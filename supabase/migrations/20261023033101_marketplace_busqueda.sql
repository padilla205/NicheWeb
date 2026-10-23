-- Busqueda del marketplace hecha en la base de datos: palabras sin acentos, filtros, orden y
-- paginas de 12. Asi la app nunca descarga todas las ventas.
-- security invoker: corre con los permisos de quien busca, asi que respeta RLS.

create extension if not exists unaccent with schema extensions;

-- Texto en minusculas y sin acentos. Se pasa el diccionario explicito porque con
-- search_path vacio unaccent no lo encuentra solo
create function public.normalize_text(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, lower(coalesce(value, '')))
$$;

create function public.search_listings(
  search text default '',
  min_price integer default null,
  max_price integer default null,
  sizes text[] default '{}',
  conditions text[] default '{}',
  colors text[] default '{}',
  seasons text[] default '{}',
  -- Solo ventas de esta ciudad ("En Guadalajara")
  only_country text default null,
  only_city text default null,
  -- Ubicacion de quien busca, para ordenar por cercania
  near_country text default null,
  near_city text default null,
  near_lat double precision default null,
  near_lng double precision default null,
  sort text default 'recientes',
  page_offset integer default 0,
  page_limit integer default 12
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with words as (
    select array_remove(regexp_split_to_array(public.normalize_text(trim(search)), '\s+'), '') as list
  ),
  found as (
    select
      l.*,
      jsonb_build_object('username', p.username, 'name', p.name) as seller,
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
$$;

-- Tallas que existen en las ventas activas, para el filtro de tallas
create function public.listing_sizes()
returns setof text
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct upper(trim(size)) from public.listings
  where status <> 'vendida' and trim(size) <> ''
$$;
