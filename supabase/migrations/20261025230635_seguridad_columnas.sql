-- Revision de seguridad: al crear y editar solo se aceptan las columnas que usa la app. Las fechas,
-- el dueno, el precio anterior y la antiguedad del perfil los pone solo la base de datos.
-- OJO: una columna nueva en estas tablas necesita su propio grant para poder escribirse.
revoke insert, update on public.listings from anon, authenticated;
grant insert (brand, city, colors, condition, country, delivery_lat, delivery_lng, delivery_radius_km, description,
  photos, price, seasons, size, status, team, title, type) on public.listings to authenticated;
grant update (brand, city, colors, condition, country, delivery_lat, delivery_lng, delivery_radius_km, description,
  photos, price, seasons, size, status, team, title, type) on public.listings to authenticated;
revoke insert, update on public.profiles from anon, authenticated;
grant update (name, bio, socials, closet_public, avatar_path, cover_path) on public.profiles to authenticated;
revoke insert, update on public.posts from anon, authenticated;
grant insert (photos, caption, seasons, aspect, outfit_id) on public.posts to authenticated;
grant update (caption, seasons) on public.posts to authenticated;
revoke insert, update on public.items from anon, authenticated;
grant insert (photos, name, type, seasons, colors, team, is_private) on public.items to authenticated;
grant update (photos, name, type, seasons, colors, team, is_private) on public.items to authenticated;
revoke insert, update on public.outfits from anon, authenticated;
grant insert (name, in_closet, is_public) on public.outfits to authenticated;
grant update (name, in_closet, is_public) on public.outfits to authenticated;
revoke insert on public.messages from anon, authenticated;
grant insert (id, conversation_id, body, image_path, shared_type, post_id, item_id) on public.messages to authenticated;
revoke insert, update on public.comments from anon, authenticated;
grant insert (post_id, text, image_path, parent_id, reply_to_id) on public.comments to authenticated;
revoke insert, update on public.conversations from anon, authenticated;
grant insert (listing_id, seller_id) on public.conversations to authenticated;
revoke insert, update on public.message_reactions from anon, authenticated;
grant insert (message_id, emoji) on public.message_reactions to authenticated;
grant update (message_id, emoji) on public.message_reactions to authenticated;
revoke insert on public.reports from anon, authenticated;
grant insert (target_type, target_id, reason, details) on public.reports to authenticated;
