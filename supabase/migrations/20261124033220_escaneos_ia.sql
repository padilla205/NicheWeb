-- Escaneos de prendas con IA: uno por cada vez que alguien toca "Identificar con IA".
-- Sirve para el limite diario por usuario y para el tope global de busquedas en Google.
-- Solo la funcion del servidor (con su clave de servicio) escribe aqui; cada usuario puede leer los suyos.
create table public.item_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- false si la IA fallo (no cuenta para el limite del usuario)
  ok boolean not null default true,
  -- Busquedas en Google que hizo la IA en este escaneo (Google cobra por cada una)
  searches smallint not null default 0 check (searches between 0 and 100)
);

create index item_scans_user_recent on public.item_scans (user_id, created_at desc);
create index item_scans_recent on public.item_scans (created_at desc);

alter table public.item_scans enable row level security;

create policy "Cada quien ve sus escaneos" on public.item_scans
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Sin politicas de insertar, editar ni borrar: desde la app nadie puede tocar estos registros
revoke insert, update, delete on public.item_scans from anon, authenticated;
