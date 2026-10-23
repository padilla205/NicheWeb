-- La politica "ver prendas" consultaba outfit_items, y la de armar outfits consulta items:
-- Postgres lo ve como un ciclo y falla al guardar un outfit. Esta funcion revisa si la prenda
-- esta en un outfit publico sin pasar por RLS (security definer); solo responde si o no.
create function public.is_item_in_public_outfit(item uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.outfit_items oi
    join public.outfits o on o.id = oi.outfit_id
    where oi.item_id = item and o.is_public
  )
$$;

drop policy "ver prendas" on public.items;
create policy "ver prendas" on public.items for select to anon, authenticated
  using (
    owner_id = (select auth.uid())
    or (not is_private and exists (select 1 from public.profiles p where p.id = owner_id and p.closet_public))
    or public.is_item_in_public_outfit(id)
  );
