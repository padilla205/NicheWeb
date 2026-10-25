-- Precio antes de la rebaja: se llena solo al bajar el precio (se guarda el original si baja varias veces)
alter table public.listings add column previous_price integer check (previous_price > 0);

create function public.track_price_drop()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.price < old.price then
    new.previous_price := coalesce(old.previous_price, old.price);
  end if;
  -- Si vuelve a subir al precio original (o mas), ya no es rebaja
  if new.previous_price is not null and new.price >= new.previous_price then
    new.previous_price := null;
  end if;
  return new;
end
$$;
revoke execute on function public.track_price_drop() from public, anon, authenticated;

create trigger listings_track_price_drop before update of price on public.listings
for each row execute function public.track_price_drop();

-- Aviso "bajo de precio" a quienes guardaron la venta
alter table public.notifications add column listing_id uuid references public.listings on delete cascade;
create index notifications_listing_idx on public.notifications (listing_id);
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'comment', 'reply', 'share', 'follow', 'comment_like', 'price_drop'));

create function public.notify_price_drop()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.price < old.price and new.status <> 'vendida' then
    -- Un solo aviso sin leer por venta: si baja otra vez, se reemplaza por el nuevo
    delete from public.notifications where type = 'price_drop' and listing_id = new.id and read_at is null;
    insert into public.notifications (user_id, actor_id, type, listing_id)
    select f.user_id, new.seller_id, 'price_drop', new.id
    from public.favorites f
    where f.listing_id = new.id and f.user_id <> new.seller_id;
  end if;
  return new;
end
$$;
revoke execute on function public.notify_price_drop() from public, anon, authenticated;

create trigger listings_notify_price_drop after update of price on public.listings
for each row execute function public.notify_price_drop();
