-- "No me interesa": personas cuyas publicaciones ya no quieres ver en tu feed.
-- Solo tu ves y cambias tu lista; la otra persona no se entera
create table public.feed_hidden_users (
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  hidden_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, hidden_id),
  check (user_id <> hidden_id)
);
create index feed_hidden_users_hidden_idx on public.feed_hidden_users (hidden_id);
alter table public.feed_hidden_users enable row level security;
create policy "ver tus ocultos" on public.feed_hidden_users for select to authenticated
  using (user_id = (select auth.uid()));
create policy "ocultar personas" on public.feed_hidden_users for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "volver a mostrar personas" on public.feed_hidden_users for delete to authenticated
  using (user_id = (select auth.uid()));
