-- Compartir una publicacion o una prenda en un chat: el mensaje lleva cual es.
-- shared_type se queda aunque la publicacion o prenda se borre, para mostrar "ya no disponible"
alter table public.messages
  add column shared_type text check (shared_type in ('post', 'item')),
  add column post_id uuid references public.posts on delete set null,
  add column item_id uuid references public.items on delete set null;
create index messages_post_idx on public.messages (post_id);
create index messages_item_idx on public.messages (item_id);

alter table public.messages drop constraint messages_body_check;
alter table public.messages add constraint messages_body_check
  check (
    char_length(body) <= 2000
    and (char_length(body) > 0 or image_path is not null or deleted_at is not null or shared_type is not null)
  );

-- Al compartir, el tipo tiene que coincidir con lo que se manda
alter table public.messages add constraint messages_shared_check
  check (
    shared_type is null
    or (shared_type = 'post' and item_id is null)
    or (shared_type = 'item' and post_id is null)
  );

-- Adelanto en la lista de chats para lo compartido sin texto
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message = case
        when new.body <> '' then new.body
        when new.shared_type = 'post' then 'Publicacion compartida'
        when new.shared_type = 'item' then 'Prenda compartida'
        else 'Foto'
      end,
      last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end
$$;

-- Al borrar un mensaje compartido tambien se quita lo que compartia
create or replace function public.before_message_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deleted_at is not null then
    new.deleted_at = now();
    new.body = '';
    new.image_path = null;
    new.post_id = null;
    new.item_id = null;
  elsif new.body is distinct from old.body then
    new.edited_at = now();
  end if;
  return new;
end
$$;
