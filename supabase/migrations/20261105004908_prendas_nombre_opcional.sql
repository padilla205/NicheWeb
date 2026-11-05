-- El formulario dice que el nombre es opcional y las tarjetas muestran el tipo de prenda si no hay
-- nombre, pero la base de datos exigia al menos una letra y rechazaba la prenda
alter table public.items drop constraint items_name_check;
alter table public.items add constraint items_name_check check (char_length(name) <= 80);
alter table public.items alter column name set default '';
