-- La politica "ver ventas de tus chats" consultaba conversations, y la de abrir un chat consulta
-- listings: Postgres lo ve como un ciclo y falla. Esta funcion revisa el chat sin pasar por RLS
-- (security definer) y solo responde si tu eres el comprador, asi que no expone nada.
create function public.is_chat_buyer(listing uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.listing_id = listing and c.buyer_id = (select auth.uid())
  )
$$;
revoke execute on function public.is_chat_buyer(uuid) from public, anon;

drop policy "ver ventas de tus chats" on public.listings;
create policy "ver ventas de tus chats" on public.listings for select to authenticated
  using (public.is_chat_buyer(id));
