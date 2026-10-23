-- Chat: cada conversacion guarda su ultimo mensaje para ordenar la lista y mostrar un adelanto
-- sin tener que leer todos los mensajes.

alter table public.conversations
  add column last_message text,
  add column last_message_at timestamptz;

create index conversations_last_message_idx on public.conversations (last_message_at desc nulls last);

-- Al entrar un mensaje se copia a su conversacion. security definer porque nadie puede editar
-- conversaciones directamente (no hay politica de update)
create function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message = new.body, last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end
$$;
revoke execute on function public.touch_conversation() from public, anon, authenticated;

create trigger messages_touch_conversation
after insert on public.messages
for each row execute function public.touch_conversation();

-- El comprador sigue viendo la prenda de su chat aunque ya este vendida
-- (el vendedor ya la ve por ser suya)
create policy "ver ventas de tus chats" on public.listings for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.listing_id = listings.id and c.buyer_id = (select auth.uid())
  ));
