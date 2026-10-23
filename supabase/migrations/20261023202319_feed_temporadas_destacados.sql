-- Feed en Supabase: temporadas y forma de la portada en cada publicacion, y los destacados
alter table public.posts
  add column seasons text[] not null default '{}'
    check (seasons <@ array['primavera', 'verano', 'otono', 'invierno'] and cardinality(seasons) <= 2),
  -- Ancho entre alto de la portada, para la cuadricula tipo Pinterest
  add column aspect real not null default 0.8 check (aspect between 0.2 and 5);
create index posts_seasons_idx on public.posts using gin (seasons);

-- Las publicaciones con mas likes y comentarios de los ultimos 30 dias (un comentario vale 2).
-- Devuelve filas de posts, asi la app puede pedir tambien el autor y los contadores.
-- ponytail: cuenta en cada llamada; con muchas publicaciones guardar los contadores en columnas
create function public.featured_posts(how_many integer default 4)
returns setof public.posts
language sql
stable
security invoker
set search_path = ''
as $$
  select p.*
  from public.posts p
  where p.created_at > now() - interval '30 days'
  order by
    (select count(*) from public.likes l where l.post_id = p.id)
    + 2 * (select count(*) from public.comments c where c.post_id = p.id) desc,
    p.created_at desc
  limit least(how_many, 12)
$$;

