-- ---------- Editar y borrar mensajes ----------
-- Solo quien lo mando, y solo durante los primeros 10 minutos. Borrar no quita la fila:
-- el mensaje queda como "Mensaje eliminado" para que la conversacion no tenga huecos
alter table public.messages
  add column edited_at timestamptz,
  add column deleted_at timestamptz;

alter table public.messages drop constraint messages_body_check;
alter table public.messages add constraint messages_body_check
  check (char_length(body) <= 2000 and (char_length(body) > 0 or image_path is not null or deleted_at is not null));

-- Solo se pueden cambiar estas dos columnas; lo demas (quien, cuando, chat) queda fijo
revoke update on public.messages from anon, authenticated;
grant update (body, deleted_at) on public.messages to authenticated;

create policy "editar o borrar tus mensajes recientes" on public.messages for update to authenticated
  using (
    sender_id = (select auth.uid())
    and deleted_at is null
    and created_at > now() - interval '10 minutes'
  )
  with check (sender_id = (select auth.uid()));

-- Al borrar se vacia el mensaje; al cambiar el texto se marca como editado.
-- Las horas las pone la base de datos, no la app
create function public.before_message_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deleted_at is not null then
    new.deleted_at = now();
    new.body = '';
    new.image_path = null;
  elsif new.body is distinct from old.body then
    new.edited_at = now();
  end if;
  return new;
end
$$;

create trigger messages_before_update
before update on public.messages
for each row execute function public.before_message_update();

-- Si el mensaje editado o borrado es el ultimo del chat, el adelanto de la lista cambia tambien
create function public.after_message_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message = case
    when new.deleted_at is not null then 'Mensaje eliminado'
    when new.body = '' then 'Foto'
    else new.body
  end
  where id = new.conversation_id and last_message_at = new.created_at;
  return new;
end
$$;
revoke execute on function public.after_message_update() from public, anon, authenticated;

create trigger messages_after_update
after update on public.messages
for each row execute function public.after_message_update();

-- ---------- Reacciones ----------
-- Una reaccion por persona en cada mensaje, de 4 posibles
create table public.message_reactions (
  message_id uuid not null references public.messages on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  emoji text not null check (emoji in ('😂', '👍', '👎', '😢')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
create index message_reactions_user_idx on public.message_reactions (user_id);
alter table public.message_reactions enable row level security;

-- Las ven y las ponen solo los dos del chat
create policy "ver reacciones de tus chats" on public.message_reactions for select to authenticated
  using (exists (
    select 1 from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_id and (select auth.uid()) in (c.buyer_id, c.seller_id)
  ));
create policy "reaccionar en tus chats" on public.message_reactions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id and m.deleted_at is null and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );
create policy "cambiar tu reaccion" on public.message_reactions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "quitar tu reaccion" on public.message_reactions for delete to authenticated
  using (user_id = (select auth.uid()));

alter publication supabase_realtime add table public.message_reactions;
