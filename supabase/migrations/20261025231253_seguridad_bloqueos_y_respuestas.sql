-- Comentar: solo en publicaciones que puedes ver (asi alguien bloqueado ya no comenta lo tuyo),
-- la respuesta va dentro de un comentario principal de la misma publicacion, y solo se le
-- "responde" a alguien que de verdad comento en ese hilo (si no, se mandaban avisos falsos)
alter policy "comentar como uno mismo" on public.comments
  with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.posts p where p.id = post_id)
    and (
      parent_id is null
      or exists (
        select 1 from public.comments pc
        where pc.id = parent_id and pc.post_id = comments.post_id and pc.parent_id is null
      )
    )
    and (
      reply_to_id is null
      or exists (
        select 1 from public.comments rc
        where rc.post_id = comments.post_id
          and rc.author_id = comments.reply_to_id
          and (rc.id = comments.parent_id or rc.parent_id = comments.parent_id)
      )
    )
  );

-- Seguir: no si hay un bloqueo de por medio
alter policy "seguir" on public.follows
  with check (follower_id = (select auth.uid()) and not public.is_blocked_with(following_id));

-- Like, compartir y like a comentarios: solo en lo que puedes ver
alter policy "dar like" on public.likes
  with check (user_id = (select auth.uid()) and exists (select 1 from public.posts p where p.id = post_id));
alter policy "compartir" on public.shares
  with check (user_id = (select auth.uid()) and exists (select 1 from public.posts p where p.id = post_id));
alter policy "dar like a un comentario" on public.comment_likes
  with check (user_id = (select auth.uid()) and exists (select 1 from public.comments c where c.id = comment_id));

-- Cambiar tu reaccion: el mensaje tiene que seguir siendo de uno de tus chats
alter policy "cambiar tu reaccion" on public.message_reactions
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_reactions.message_id
        and m.deleted_at is null
        and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );
