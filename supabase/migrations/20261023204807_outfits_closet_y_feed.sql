-- Outfits: mostrarlos en el closet del perfil y publicarlos en el feed sin foto
-- in_closet: el dueno quiere que se vea en la seccion Closet de su perfil.
-- (is_public ya existe: con true cualquiera lo puede ver, tambien con su link sin sesion)
alter table public.outfits add column in_closet boolean not null default false;
-- Mostrar en el closet hace publico el outfit (si no, los demas no podrian verlo)
alter table public.outfits add constraint outfits_in_closet_public check (not in_closet or is_public);

-- Una publicacion puede ser solo un outfit, sin fotos propias
alter table public.posts drop constraint posts_photos_check;
alter table public.posts add constraint posts_photos_check
  check (cardinality(photos) <= 10 and (cardinality(photos) >= 1 or outfit_id is not null));

-- Solo se puede publicar un outfit tuyo, y queda publico para que todos vean sus prendas
create function public.before_post_outfit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.outfit_id is not null then
    if not exists (select 1 from public.outfits o where o.id = new.outfit_id and o.owner_id = new.author_id) then
      raise exception 'Solo puedes publicar tus propios outfits';
    end if;
    update public.outfits set is_public = true where id = new.outfit_id;
  end if;
  return new;
end
$$;
revoke execute on function public.before_post_outfit() from public, anon, authenticated;

create trigger posts_before_insert_outfit
before insert on public.posts
for each row execute function public.before_post_outfit();

-- Al borrar un outfit, sus publicaciones sin foto propia se borran tambien
-- (sin el outfit quedarian vacias); las que tienen fotos se quedan
create function public.before_outfit_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  delete from public.posts where outfit_id = old.id and cardinality(photos) = 0;
  return old;
end
$$;

create trigger outfits_before_delete
before delete on public.outfits
for each row execute function public.before_outfit_delete();
