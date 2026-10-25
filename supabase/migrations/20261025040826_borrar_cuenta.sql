-- Borra la cuenta de quien la llama (y solo esa). Todo lo suyo se borra en cadena desde el perfil:
-- prendas, outfits, publicaciones, comentarios, ventas, chats, likes, seguidores, avisos y reportes.
-- Las fotos de Storage las borra la app antes de llamar esta funcion
create function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid())
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
