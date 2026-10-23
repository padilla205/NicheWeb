-- Imagenes y GIFs en el chat: un mensaje puede llevar una foto, y entonces el texto es opcional
alter table public.messages add column image_path text;
alter table public.messages alter column body set default '';
alter table public.messages drop constraint messages_body_check;
alter table public.messages add constraint messages_body_check
  check (char_length(body) <= 2000 and (char_length(body) > 0 or image_path is not null));
-- La foto tiene que estar en la carpeta de quien la manda (no se puede "mandar" la foto de otro)
alter table public.messages add constraint messages_image_path_check
  check (image_path is null or split_part(image_path, '/', 1) = sender_id::text);

-- El adelanto de la lista dice "Foto" cuando el mensaje no trae texto
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message = case when new.body = '' then 'Foto' else new.body end,
      last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end
$$;
