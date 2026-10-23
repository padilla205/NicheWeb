-- Mensajes sin leer: cada chat guarda hasta cuando leyo cada quien. Lo que mando la otra
-- persona despues de esa hora cuenta como no leido. Los chats que ya existian quedan leidos.
alter table public.conversations
  add column buyer_read_at timestamptz not null default now(),
  add column seller_read_at timestamptz not null default now();

-- Cuantos mensajes sin leer hay en cada uno de tus chats (solo los que tienen alguno).
-- security invoker: las politicas de arriba ya limitan a tus chats
create function public.unread_counts()
returns table (conversation_id uuid, unread integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select m.conversation_id, count(*)::integer
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where m.sender_id <> (select auth.uid())
    and m.created_at > case when c.buyer_id = (select auth.uid()) then c.buyer_read_at else c.seller_read_at end
  group by m.conversation_id
$$;
revoke execute on function public.unread_counts() from public, anon;

-- Marca un chat como leido para quien lo llama. security definer porque nadie puede editar
-- conversaciones directo; solo cambia tu propia hora de lectura y solo en tus chats
create function public.mark_chat_read(chat uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.conversations
  set buyer_read_at = case when buyer_id = (select auth.uid()) then now() else buyer_read_at end,
      seller_read_at = case when seller_id = (select auth.uid()) then now() else seller_read_at end
  where id = chat and (select auth.uid()) in (buyer_id, seller_id)
$$;
revoke execute on function public.mark_chat_read(uuid) from public, anon;
