alter table public.user_preferences
  add column if not exists guided_tours jsonb not null default '{}'::jsonb;
