-- ---------- Marca ----------
alter table public.listings add column brand text not null default '' check (char_length(brand) <= 40);

-- Marcas que existen en las ventas, para el filtro (sin repetir "Nike" y "nike")
create function public.listing_brands()
returns setof text
language sql
stable
set search_path = ''
as $$
  select min(trim(brand)) from public.listings
  where status <> 'vendida' and trim(brand) <> ''
  group by public.normalize_text(trim(brand))
$$;

-- La busqueda tambien busca en la marca y filtra por marcas (cambia la firma: se reemplaza)
drop function public.search_listings(text, integer, integer, text[], text[], text[], text[], text, text, text, text, double precision, double precision, text, integer, integer);
create function public.search_listings(search text DEFAULT ''::text, min_price integer DEFAULT NULL::integer, max_price integer DEFAULT NULL::integer, sizes text[] DEFAULT '{}'::text[], conditions text[] DEFAULT '{}'::text[], colors text[] DEFAULT '{}'::text[], seasons text[] DEFAULT '{}'::text[], brands text[] DEFAULT '{}'::text[], only_country text DEFAULT NULL::text, only_city text DEFAULT NULL::text, near_country text DEFAULT NULL::text, near_city text DEFAULT NULL::text, near_lat double precision DEFAULT NULL::double precision, near_lng double precision DEFAULT NULL::double precision, sort text DEFAULT 'recientes'::text, page_offset integer DEFAULT 0, page_limit integer DEFAULT 12)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  with words as (
    select array_remove(regexp_split_to_array(public.normalize_text(trim(search)), '\s+'), '') as list
  ),
  found as (
    select
      l.*,
      jsonb_build_object('username', p.username, 'name', p.name, 'avatar_path', p.avatar_path) as seller,
      -- 0 tu ciudad, 1 tu pais, 2 el resto
      case
        when l.country = near_country and l.city = near_city then 0
        when l.country = near_country then 1
        else 2
      end as nearness,
      -- Distancia en km al centro de tu ciudad (formula de haversine); null si la venta no tiene punto
      12742 * asin(sqrt(
        sin(radians(l.delivery_lat - near_lat) / 2) ^ 2
        + cos(radians(near_lat)) * cos(radians(l.delivery_lat)) * sin(radians(l.delivery_lng - near_lng) / 2) ^ 2
      )) as distance
    from public.listings l
    join public.profiles p on p.id = l.seller_id
    cross join words
    where l.status <> 'vendida'
      -- Todas las palabras tienen que aparecer en el titulo, la marca, el tipo o la descripcion
      and not exists (
        select 1 from unnest(words.list) word
        where strpos(public.normalize_text(l.title || ' ' || l.brand || ' ' || l.type || ' ' || l.description), word) = 0
      )
      and (min_price is null or l.price >= min_price)
      and (max_price is null or l.price <= max_price)
      and (cardinality(sizes) = 0 or upper(trim(l.size)) = any (sizes))
      and (cardinality(conditions) = 0 or l.condition = any (conditions))
      and (cardinality(search_listings.colors) = 0 or l.colors && search_listings.colors)
      and (cardinality(search_listings.seasons) = 0 or l.seasons && search_listings.seasons)
      and (
        cardinality(brands) = 0
        or public.normalize_text(trim(l.brand)) in (select public.normalize_text(b) from unnest(brands) b)
      )
      and (only_city is null or (l.country = only_country and l.city = only_city))
  ),
  ordered as (
    select found.*, row_number() over (
      order by
        case when sort = 'precio-menor' then price end asc,
        case when sort = 'precio-mayor' then price end desc,
        case when sort = 'cercanos' then nearness end asc,
        case when sort = 'cercanos' then distance end asc nulls last,
        created_at desc
    ) as position
    from found
  )
  select jsonb_build_object(
    'total', (select count(*) from found),
    'items', coalesce(
      (select jsonb_agg(to_jsonb(ordered) - 'nearness' - 'distance' - 'position' order by position)
       from ordered
       where position > page_offset and position <= page_offset + page_limit),
      '[]'::jsonb
    )
  )
$function$;

-- ---------- Estadisticas para el vendedor ----------
-- Quien abrio la venta (una vez por persona). Nadie puede leer estas filas: solo se cuentan
create table public.listing_views (
  listing_id uuid not null references public.listings on delete cascade,
  viewer_id uuid not null default auth.uid() references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (listing_id, viewer_id)
);
create index listing_views_viewer_idx on public.listing_views (viewer_id);
alter table public.listing_views enable row level security;
-- Se registra tu vista, pero no cuenta si la venta es tuya
create policy "registrar vista" on public.listing_views for insert to authenticated
  with check (
    viewer_id = (select auth.uid())
    and not exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid()))
  );

-- Cuantas personas la vieron, la guardaron y le escribieron. Solo responde al vendedor
create function public.listing_stats(listing uuid)
returns table (views bigint, saves bigint, chats bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.listing_views v where v.listing_id = l.id),
    (select count(*) from public.favorites f where f.listing_id = l.id),
    (select count(*) from public.conversations c where c.listing_id = l.id)
  from public.listings l
  where l.id = listing and l.seller_id = (select auth.uid())
$$;
