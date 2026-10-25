-- Like en un comentario: mismas reglas que el like de una publicacion
create table public.comment_likes (
  comment_id uuid not null references public.comments on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
create index comment_likes_user_idx on public.comment_likes (user_id);
alter table public.comment_likes enable row level security;
create policy "likes de comentarios visibles para todos" on public.comment_likes for select to anon, authenticated using (true);
create policy "dar like a un comentario" on public.comment_likes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "quitar like a un comentario" on public.comment_likes for delete to authenticated using (user_id = (select auth.uid()));
