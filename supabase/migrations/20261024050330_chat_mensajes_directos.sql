-- Mensajes directos: un chat sin venta. Quien lo abre queda como buyer_id y la otra persona como seller_id
alter table public.conversations alter column listing_id drop not null;

-- Un solo chat directo por pareja, sin importar quien lo abrio
create unique index conversations_direct_pair_idx on public.conversations
  (least(buyer_id, seller_id), greatest(buyer_id, seller_id))
  where listing_id is null;

-- Abrir un chat: por una venta (como antes) o directo con cualquier persona; nunca si hay un bloqueo
drop policy "abrir chat como comprador" on public.conversations;
create policy "abrir chat" on public.conversations for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and (
      listing_id is null
      or exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = conversations.seller_id)
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = buyer_id and b.blocked_id = seller_id)
         or (b.blocker_id = seller_id and b.blocked_id = buyer_id)
    )
  );
