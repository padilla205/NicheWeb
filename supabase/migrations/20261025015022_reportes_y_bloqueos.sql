-- ---------- Administradores ----------
-- Solo se agregan desde la base de datos; cada quien puede ver si es admin (para mostrar el panel)
create table public.admins (
  user_id uuid primary key references public.profiles on delete cascade
);
alter table public.admins enable row level security;
create policy "saber si eres admin" on public.admins for select to authenticated
  using (user_id = (select auth.uid()));
insert into public.admins (user_id) select id from public.profiles where username = 'admin';

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;

-- ---------- Reportes ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'listing', 'profile', 'message')),
  target_id uuid not null,
  reason text not null check (reason in ('inapropiado', 'estafa', 'acoso', 'spam', 'otro')),
  details text not null default '' check (char_length(details) <= 500),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  -- Una persona reporta algo una sola vez: nadie puede ocultar algo reportandolo varias veces
  unique (reporter_id, target_type, target_id)
);
create index reports_open_target_idx on public.reports (target_type, target_id) where resolved_at is null;
alter table public.reports enable row level security;
create policy "reportar" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "ver tus reportes o todos si eres admin" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));
-- Solo admin resuelve (la columna resolved_at) o borra reportes
revoke update on public.reports from anon, authenticated;
grant update (resolved_at) on public.reports to authenticated;
create policy "admin resuelve reportes" on public.reports for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin borra reportes" on public.reports for delete to authenticated
  using ((select public.is_admin()));

-- Con 3 reportes abiertos (de personas distintas) el contenido se oculta hasta que admin lo revise
create function public.hidden_by_reports(kind text, target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) >= 3 from public.reports
  where target_type = kind and target_id = target and resolved_at is null
$$;

-- Si tu bloqueaste a esa persona o ella a ti
create function public.is_blocked_with(other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = (select auth.uid()) and blocked_id = other)
       or (blocker_id = other and blocked_id = (select auth.uid()))
  )
$$;

revoke execute on function public.hidden_by_reports(text, uuid) from public, anon, authenticated;
grant execute on function public.hidden_by_reports(text, uuid) to anon, authenticated;

-- ---------- Que se ve ----------
-- Lo tuyo siempre lo ves; admin ve todo; lo demas, si no esta oculto por reportes ni hay bloqueo
drop policy "publicaciones visibles para todos" on public.posts;
create policy "publicaciones visibles" on public.posts for select to anon, authenticated
  using (
    author_id = (select auth.uid())
    or (select public.is_admin())
    or (not public.hidden_by_reports('post', id) and not public.is_blocked_with(author_id))
  );

drop policy "comentarios visibles para todos" on public.comments;
create policy "comentarios visibles" on public.comments for select to anon, authenticated
  using (
    author_id = (select auth.uid())
    or (select public.is_admin())
    or (not public.hidden_by_reports('comment', id) and not public.is_blocked_with(author_id))
  );

drop policy "ventas activas visibles" on public.listings;
create policy "ventas activas visibles" on public.listings for select to anon, authenticated
  using (
    seller_id = (select auth.uid())
    or (select public.is_admin())
    or (
      status <> 'vendida'
      and not public.hidden_by_reports('listing', id)
      and not public.is_blocked_with(seller_id)
    )
  );

-- Admin puede leer un mensaje de chat solo si alguien lo reporto
create policy "admin ve mensajes reportados" on public.messages for select to authenticated
  using (
    (select public.is_admin())
    and exists (select 1 from public.reports r where r.target_type = 'message' and r.target_id = messages.id)
  );

-- Admin puede borrar lo que se reporto
create policy "admin borra publicaciones" on public.posts for delete to authenticated using ((select public.is_admin()));
create policy "admin borra comentarios" on public.comments for delete to authenticated using ((select public.is_admin()));
create policy "admin borra ventas" on public.listings for delete to authenticated using ((select public.is_admin()));
