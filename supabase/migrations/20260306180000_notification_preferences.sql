-- Notification preferences per user
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_email boolean not null default true,
  channel_desktop boolean not null default false,
  digest_weekly boolean not null default false,
  product_updates boolean not null default true,
  important_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- RLS
alter table public.notification_preferences enable row level security;

create policy "Users can view own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id);

-- Updated at trigger
create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.set_updated_at();

-- Index
create index if not exists idx_notification_preferences_user_id
  on public.notification_preferences(user_id);
