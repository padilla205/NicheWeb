-- Like a un comentario: avisa a su autor (con el texto del comentario); al quitarlo se borra el aviso
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'comment', 'reply', 'share', 'follow', 'comment_like'));

create function public.notify_comment_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify(c.author_id, new.user_id, 'comment_like', c.post_id, c.id)
    from public.comments c where c.id = new.comment_id;
    return new;
  end if;
  delete from public.notifications where type = 'comment_like' and actor_id = old.user_id and comment_id = old.comment_id;
  return old;
end
$$;
revoke execute on function public.notify_comment_like() from public, anon, authenticated;

create trigger comment_likes_notify after insert or delete on public.comment_likes
for each row execute function public.notify_comment_like();
