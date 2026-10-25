-- La regla de comentarios consultaba la misma tabla de comentarios y Postgres lo toma como un ciclo
-- infinito (error 42P17). La revision del hilo pasa a una funcion aparte (como en chats y prendas)
create function public.valid_comment_thread(post uuid, parent uuid, reply_to uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    -- La respuesta va dentro de un comentario principal de la misma publicacion
    (parent is null or exists (
      select 1 from public.comments pc where pc.id = parent and pc.post_id = post and pc.parent_id is null
    ))
    -- Solo se le "responde" a alguien que de verdad comento en ese hilo
    and (reply_to is null or exists (
      select 1 from public.comments rc
      where rc.post_id = post and rc.author_id = reply_to and (rc.id = parent or rc.parent_id = parent)
    ))
$$;
revoke execute on function public.valid_comment_thread(uuid, uuid, uuid) from public, anon;
grant execute on function public.valid_comment_thread(uuid, uuid, uuid) to authenticated;

alter policy "comentar como uno mismo" on public.comments
  with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.posts p where p.id = post_id)
    and public.valid_comment_thread(post_id, parent_id, reply_to_id)
  );
