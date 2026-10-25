-- Datos publicos del vendedor para su tarjeta: desde cuando esta y cuantas ventas completo.
-- Las ventas vendidas solo las ve su dueno, por eso se cuentan aqui (solo sale el numero)
create function public.seller_stats(seller uuid)
returns table (member_since timestamptz, sold_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select p.created_at, (select count(*) from public.listings l where l.seller_id = p.id and l.status = 'vendida')
  from public.profiles p
  where p.id = seller
$$;

-- La busqueda del marketplace tambien trae la foto de perfil del vendedor
create or replace function public.search_listings(search text DEFAULT ''::text, min_price integer DEFAULT NULL::integer, max_price integer DEFAULT NULL::integer, sizes text[] DEFAULT '{}'::text[], conditions text[] DEFAULT '{}'::text[], colors text[] DEFAULT '{}'::text[], seasons text[] DEFAULT '{}'::text[], only_country text DEFAULT NULL::text, only_city text DEFAULT NULL::text, near_country text DEFAULT NULL::text, near_city text DEFAULT NULL::text, near_lat double precision DEFAULT NULL::double precision, near_lng double precision DEFAULT NULL::double precision, sort text DEFAULT 'recientes'::text, page_offset integer DEFAULT 0, page_limit integer DEFAULT 12)
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
      -- Todas las palabras tienen que aparecer en el titulo, el tipo o la descripcion
      and not exists (
        select 1 from unnest(words.list) word
        where strpos(public.normalize_text(l.title || ' ' || l.type || ' ' || l.description), word) = 0
      )
      and (min_price is null or l.price >= min_price)
      and (max_price is null or l.price <= max_price)
      and (cardinality(sizes) = 0 or upper(trim(l.size)) = any (sizes))
      and (cardinality(conditions) = 0 or l.condition = any (conditions))
      and (cardinality(search_listings.colors) = 0 or l.colors && search_listings.colors)
      and (cardinality(search_listings.seasons) = 0 or l.seasons && search_listings.seasons)
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
