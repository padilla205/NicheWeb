-- Esquema inicial de Niche: todas las tablas, con RLS activado en cada una.
-- Regla general: el dueno lee y edita lo suyo; lo publico (perfiles, publicaciones,
-- outfits compartidos, ventas no vendidas) lo puede leer cualquiera, incluso sin sesion.
-- (select auth.uid()) va entre parentesis para que Postgres lo calcule una vez por consulta y no por fila.

-- ---------- Perfiles ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._]{3,30}$'),
  name text not null check (char_length(name) between 1 and 50),
  bio text not null default '' check (char_length(bio) <= 160),
  avatar_path text,
  cover_path text,
  -- [{ "platform": "instagram", "handle": "ana" }]
  socials jsonb not null default '[]' check (jsonb_typeof(socials) = 'array'),
  closet_public boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "perfiles visibles para todos" on public.profiles for select to anon, authenticated using (true);
create policy "cada quien edita su perfil" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Al registrarse se crea su perfil con el usuario y nombre que mando el formulario
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    coalesce(lower(new.raw_user_meta_data ->> 'username'), 'user_' || substr(new.id::text, 1, 8)),
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), 'Usuario')
  );
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Closet ----------
create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  type text not null,
  seasons text[] not null default '{}' check (cardinality(seasons) <= 2),
  colors text[] not null default '{}',
  team text,
  -- Rutas dentro del bucket "photos"; la primera es la portada
  photos text[] not null default '{}' check (cardinality(photos) <= 6),
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);
create index items_owner_created_idx on public.items (owner_id, created_at desc);
alter table public.items enable row level security;

-- ---------- Outfits ----------
create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  -- Con true se puede abrir con su link sin iniciar sesion
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create index outfits_owner_created_idx on public.outfits (owner_id, created_at desc);
alter table public.outfits enable row level security;
create policy "outfits propios o compartidos" on public.outfits for select to anon, authenticated
  using (is_public or owner_id = (select auth.uid()));
create policy "crear outfits propios" on public.outfits for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "editar outfits propios" on public.outfits for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "borrar outfits propios" on public.outfits for delete to authenticated
  using (owner_id = (select auth.uid()));

create table public.outfit_items (
  outfit_id uuid not null references public.outfits on delete cascade,
  item_id uuid not null references public.items on delete cascade,
  primary key (outfit_id, item_id)
);
create index outfit_items_item_idx on public.outfit_items (item_id);
alter table public.outfit_items enable row level security;
create policy "prendas de outfits visibles" on public.outfit_items for select to anon, authenticated
  using (exists (
    select 1 from public.outfits o
    where o.id = outfit_id and (o.is_public or o.owner_id = (select auth.uid()))
  ));
create policy "armar outfits propios" on public.outfit_items for insert to authenticated
  with check (
    exists (select 1 from public.outfits o where o.id = outfit_id and o.owner_id = (select auth.uid()))
    and exists (select 1 from public.items i where i.id = item_id and i.owner_id = (select auth.uid()))
  );
create policy "quitar prendas de outfits propios" on public.outfit_items for delete to authenticated
  using (exists (select 1 from public.outfits o where o.id = outfit_id and o.owner_id = (select auth.uid())));

-- Una prenda se ve si es tuya, si tu closet es publico y la prenda no es privada,
-- o si forma parte de un outfit compartido (para que el link publico muestre sus fotos)
create policy "ver prendas" on public.items for select to anon, authenticated
  using (
    owner_id = (select auth.uid())
    or (not is_private and exists (select 1 from public.profiles p where p.id = owner_id and p.closet_public))
    or exists (
      select 1 from public.outfit_items oi join public.outfits o on o.id = oi.outfit_id
      where oi.item_id = items.id and o.is_public
    )
  );
create policy "agregar prendas propias" on public.items for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "editar prendas propias" on public.items for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "borrar prendas propias" on public.items for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---------- Feed ----------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles on delete cascade,
  caption text not null default '' check (char_length(caption) <= 500),
  photos text[] not null check (cardinality(photos) between 1 and 10),
  outfit_id uuid references public.outfits on delete set null,
  created_at timestamptz not null default now()
);
create index posts_created_idx on public.posts (created_at desc);
create index posts_author_created_idx on public.posts (author_id, created_at desc);
create index posts_outfit_idx on public.posts (outfit_id);
alter table public.posts enable row level security;
create policy "publicaciones visibles para todos" on public.posts for select to anon, authenticated using (true);
create policy "publicar como uno mismo" on public.posts for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "editar publicaciones propias" on public.posts for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "borrar publicaciones propias" on public.posts for delete to authenticated
  using (author_id = (select auth.uid()));

create table public.likes (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index likes_user_idx on public.likes (user_id);
alter table public.likes enable row level security;
create policy "likes visibles para todos" on public.likes for select to anon, authenticated using (true);
create policy "dar like" on public.likes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "quitar like" on public.likes for delete to authenticated using (user_id = (select auth.uid()));

-- Republicar una publicacion en tu perfil (pestana Compartidos)
create table public.shares (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index shares_user_created_idx on public.shares (user_id, created_at desc);
alter table public.shares enable row level security;
create policy "compartidos visibles para todos" on public.shares for select to anon, authenticated using (true);
create policy "compartir" on public.shares for insert to authenticated with check (user_id = (select auth.uid()));
create policy "dejar de compartir" on public.shares for delete to authenticated using (user_id = (select auth.uid()));

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles on delete cascade,
  text text not null default '' check (char_length(text) <= 500),
  -- Foto o GIF adjunto (opcional)
  image_path text,
  -- Si es respuesta: el comentario principal y la persona a quien se responde
  parent_id uuid references public.comments on delete cascade,
  reply_to_id uuid references public.profiles on delete set null,
  created_at timestamptz not null default now(),
  check (char_length(text) > 0 or image_path is not null)
);
create index comments_post_created_idx on public.comments (post_id, created_at);
create index comments_author_idx on public.comments (author_id);
create index comments_parent_idx on public.comments (parent_id);
create index comments_reply_to_idx on public.comments (reply_to_id);
alter table public.comments enable row level security;
create policy "comentarios visibles para todos" on public.comments for select to anon, authenticated using (true);
create policy "comentar como uno mismo" on public.comments for insert to authenticated
  with check (author_id = (select auth.uid()));
-- Lo borra quien lo escribio o el dueno de la publicacion
create policy "borrar comentarios" on public.comments for delete to authenticated
  using (
    author_id = (select auth.uid())
    or exists (select 1 from public.posts p where p.id = post_id and p.author_id = (select auth.uid()))
  );

-- ---------- Seguidores ----------
create table public.follows (
  follower_id uuid not null default auth.uid() references public.profiles on delete cascade,
  following_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index follows_following_idx on public.follows (following_id);
alter table public.follows enable row level security;
create policy "seguidores visibles para todos" on public.follows for select to anon, authenticated using (true);
create policy "seguir" on public.follows for insert to authenticated with check (follower_id = (select auth.uid()));
create policy "dejar de seguir" on public.follows for delete to authenticated using (follower_id = (select auth.uid()));

-- ---------- Marketplace ----------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references public.profiles on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  -- En pesos, sin centavos
  price integer not null check (price >= 0),
  size text not null default '',
  country text not null,
  city text not null,
  -- Punto de entrega en el mapa (opcional); con radio es una zona
  delivery_lat double precision,
  delivery_lng double precision,
  delivery_radius_km real,
  condition text not null check (condition in ('nuevo', 'como-nuevo', 'usado')),
  status text not null default 'disponible' check (status in ('disponible', 'apartada', 'vendida')),
  type text not null default '',
  seasons text[] not null default '{}' check (cardinality(seasons) <= 2),
  colors text[] not null default '{}',
  team text,
  description text not null default '' check (char_length(description) <= 1000),
  photos text[] not null default '{}' check (cardinality(photos) <= 10),
  created_at timestamptz not null default now()
);
create index listings_status_created_idx on public.listings (status, created_at desc);
create index listings_seller_created_idx on public.listings (seller_id, created_at desc);
alter table public.listings enable row level security;
-- Las vendidas dejan de verse, salvo para quien las vendio
create policy "ventas activas visibles" on public.listings for select to anon, authenticated
  using (status <> 'vendida' or seller_id = (select auth.uid()));
create policy "publicar ventas propias" on public.listings for insert to authenticated
  with check (seller_id = (select auth.uid()));
create policy "editar ventas propias" on public.listings for update to authenticated
  using (seller_id = (select auth.uid())) with check (seller_id = (select auth.uid()));
create policy "borrar ventas propias" on public.listings for delete to authenticated
  using (seller_id = (select auth.uid()));

create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  listing_id uuid not null references public.listings on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index favorites_listing_idx on public.favorites (listing_id);
alter table public.favorites enable row level security;
create policy "ver favoritos propios" on public.favorites for select to authenticated using (user_id = (select auth.uid()));
create policy "guardar favorito" on public.favorites for insert to authenticated with check (user_id = (select auth.uid()));
create policy "quitar favorito" on public.favorites for delete to authenticated using (user_id = (select auth.uid()));

-- ---------- Chat comprador-vendedor ----------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings on delete cascade,
  buyer_id uuid not null default auth.uid() references public.profiles on delete cascade,
  seller_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);
create index conversations_buyer_idx on public.conversations (buyer_id);
create index conversations_seller_idx on public.conversations (seller_id);
alter table public.conversations enable row level security;
create policy "ver chats propios" on public.conversations for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));
-- Solo el comprador abre el chat, y el vendedor tiene que ser el de la venta
create policy "abrir chat como comprador" on public.conversations for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = conversations.seller_id)
  );

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index messages_sender_idx on public.messages (sender_id);
alter table public.messages enable row level security;
create policy "ver mensajes de chats propios" on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)
  ));
create policy "enviar mensajes en chats propios" on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );

-- Los mensajes nuevos llegan en vivo (Realtime respeta las politicas de arriba)
alter publication supabase_realtime add table public.messages;

-- ---------- Fotos ----------
-- Un solo bucket publico. Cada quien sube solo dentro de su carpeta: "<id de usuario>/<archivo>".
-- Los nombres son aleatorios, asi que solo ve una foto quien ya tiene su direccion
-- (y la direccion vive en las tablas, protegida por las politicas de arriba).
-- Limite de 2 MB por foto: la app las comprime antes, esto frena a quien se la salte.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/webp', 'image/jpeg', 'image/png', 'image/gif']);

create policy "subir fotos a tu carpeta" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Necesario para poder borrarlas; solo ves la lista de tu propia carpeta
create policy "ver tu carpeta de fotos" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "borrar fotos de tu carpeta" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
