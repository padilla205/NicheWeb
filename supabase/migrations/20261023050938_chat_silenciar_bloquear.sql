-- ---------- Chats silenciados ----------
-- Un chat silenciado sigue recibiendo mensajes, pero no suma al numero rojo de arriba
create table public.chat_mutes (
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  conversation_id uuid not null references public.conversations on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, conversation_id)
);
create index chat_mutes_conversation_idx on public.chat_mutes (conversation_id);
alter table public.chat_mutes enable row level security;
create policy "ver tus silenciados" on public.chat_mutes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "silenciar tus chats" on public.chat_mutes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );
create policy "quitar silencio" on public.chat_mutes for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------- Bloqueos ----------
-- Si alguno bloquea al otro, ninguno de los dos puede escribirle ni abrir chats nuevos con el otro.
-- El bloqueado tambien ve la fila, para que la app le diga que no puede escribir en ese chat
create table public.blocks (
  blocker_id uuid not null default auth.uid() references public.profiles on delete cascade,
  blocked_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);
alter table public.blocks enable row level security;
create policy "ver bloqueos tuyos" on public.blocks for select to authenticated
  using ((select auth.uid()) in (blocker_id, blocked_id));
create policy "bloquear" on public.blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy "desbloquear" on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

drop policy "enviar mensajes en chats propios" on public.messages;
create policy "enviar mensajes en chats propios" on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = c.buyer_id and b.blocked_id = c.seller_id)
             or (b.blocker_id = c.seller_id and b.blocked_id = c.buyer_id)
        )
    )
  );

drop policy "abrir chat como comprador" on public.conversations;
create policy "abrir chat como comprador" on public.conversations for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = conversations.seller_id)
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = buyer_id and b.blocked_id = seller_id)
         or (b.blocker_id = seller_id and b.blocked_id = buyer_id)
    )
  );
