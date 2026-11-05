-- Marca y decada de cada prenda (opcionales). Se muestran como cuadritos en las tarjetas del closet
alter table public.items
  add column brand text check (char_length(brand) <= 60),
  add column decade smallint check (decade between 1900 and 2100 and decade % 10 = 0);

-- Los permisos de escritura de items son por columna: las columnas nuevas se tienen que agregar
grant insert (brand, decade) on public.items to authenticated;
grant update (brand, decade) on public.items to authenticated;
