-- Notifications table for Kortex

create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'user',
  sender_name text null,
  sender_email text null,
  sender_avatar_url text null,
  body text not null,
  link_path text null,
  read_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.conname = 'notifications_type_check'
      and n.nspname = 'public'
      and t.relname = 'notifications'
  ) then
    alter table public.notifications
      add constraint notifications_type_check
      check (type in ('user', 'system'));
  end if;
end $$;

create index if not exists notifications_user_id_created_at_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_id_read_at_idx
  on public.notifications(user_id, read_at);

alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_select_own'
  ) then
    create policy notifications_select_own
      on public.notifications
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_update_own'
  ) then
    create policy notifications_update_own
      on public.notifications
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;