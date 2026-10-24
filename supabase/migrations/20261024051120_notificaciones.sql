-- ---------- Notificaciones ----------
-- Las crea la base de datos (con triggers) cuando alguien da like, comenta, responde, comparte o
-- te sigue. Nadie las puede crear desde la app; cada quien solo ve y marca como leidas las suyas
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  -- Quien la recibe
  user_id uuid not null references public.profiles on delete cascade,
  -- Quien hizo la accion
  actor_id uuid not null references public.profiles on delete cascade,
  type text not null check (type in ('like', 'comment', 'reply', 'share', 'follow')),
  post_id uuid references public.posts on delete cascade,
  comment_id uuid references public.comments on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (user_id <> actor_id)
);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_actor_idx on public.notifications (actor_id);
create index notifications_post_idx on public.notifications (post_id);
create index notifications_comment_idx on public.notifications (comment_id);
alter table public.notifications enable row level security;

create policy "ver tus notificaciones" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
-- Solo se puede marcar como leida (la columna read_at); nada mas
revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;
create policy "marcar tus notificaciones" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "borrar tus notificaciones" on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

-- Crea la notificacion (si no es para uno mismo)
create function public.notify(recipient uuid, actor uuid, kind text, post uuid, comment uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
  select recipient, actor, kind, post, comment
  where recipient is not null and recipient <> actor
$$;
revoke execute on function public.notify(uuid, uuid, text, uuid, uuid) from public, anon, authenticated;

-- Likes y compartidos: avisan al autor de la publicacion; al quitarlos se borra el aviso
create function public.notify_post_action()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kind text := case tg_table_name when 'likes' then 'like' else 'share' end;
begin
  if tg_op = 'INSERT' then
    perform public.notify((select author_id from public.posts where id = new.post_id), new.user_id, kind, new.post_id, null);
    return new;
  end if;
  delete from public.notifications where type = kind and actor_id = old.user_id and post_id = old.post_id;
  return old;
end
$$;
revoke execute on function public.notify_post_action() from public, anon, authenticated;

create trigger likes_notify after insert or delete on public.likes
for each row execute function public.notify_post_action();
create trigger shares_notify after insert or delete on public.shares
for each row execute function public.notify_post_action();

-- Comentarios: avisan al autor de la publicacion y, si es respuesta, a quien se le respondio
-- (sin avisarle dos veces a la misma persona). Si se borra el comentario, se borra el aviso
create function public.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_author uuid := (select author_id from public.posts where id = new.post_id);
begin
  if new.reply_to_id is not null then
    perform public.notify(new.reply_to_id, new.author_id, 'reply', new.post_id, new.id);
  end if;
  if new.reply_to_id is distinct from post_author then
    perform public.notify(post_author, new.author_id, 'comment', new.post_id, new.id);
  end if;
  return new;
end
$$;
revoke execute on function public.notify_comment() from public, anon, authenticated;

create trigger comments_notify after insert on public.comments
for each row execute function public.notify_comment();

-- Seguidores: avisa a quien empiezas a seguir; al dejar de seguir se borra el aviso
create function public.notify_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify(new.following_id, new.follower_id, 'follow', null, null);
    return new;
  end if;
  delete from public.notifications where type = 'follow' and actor_id = old.follower_id and user_id = old.following_id;
  return old;
end
$$;
revoke execute on function public.notify_follow() from public, anon, authenticated;

create trigger follows_notify after insert or delete on public.follows
for each row execute function public.notify_follow();

-- Llegan en vivo
alter publication supabase_realtime add table public.notifications;
