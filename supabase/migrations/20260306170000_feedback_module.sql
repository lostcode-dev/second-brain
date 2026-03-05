-- ============================================================
-- Migration: Feedback Module
-- Tables: feedbacks, feedback_responses, feedback_attachments, feedback_entity_links
-- ============================================================

-- 1. Feedbacks
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('bug', 'suggestion', 'improvement', 'praise')),
  title text not null,
  description text not null,
  tech_context jsonb default null,
  status text not null default 'submitted' check (status in ('submitted', 'in_review', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Feedback Responses
create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedbacks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Feedback Attachments
create table if not exists public.feedback_attachments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedbacks(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null default 'application/octet-stream',
  created_at timestamptz not null default now()
);

-- 4. Feedback Entity Links (admin can link feedback to system entities or external issues)
create table if not exists public.feedback_entity_links (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedbacks(id) on delete cascade,
  entity_type text not null,
  entity_id uuid default null,
  external_url text default null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_feedbacks_user_id on public.feedbacks(user_id);
create index if not exists idx_feedbacks_status on public.feedbacks(status);
create index if not exists idx_feedbacks_type on public.feedbacks(type);
create index if not exists idx_feedbacks_priority on public.feedbacks(priority);
create index if not exists idx_feedbacks_created_at on public.feedbacks(created_at desc);
create index if not exists idx_feedback_responses_feedback_id on public.feedback_responses(feedback_id);
create index if not exists idx_feedback_attachments_feedback_id on public.feedback_attachments(feedback_id);
create index if not exists idx_feedback_entity_links_feedback_id on public.feedback_entity_links(feedback_id);

-- RLS
alter table public.feedbacks enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.feedback_attachments enable row level security;
alter table public.feedback_entity_links enable row level security;

-- Policies: feedbacks
create policy "Users can view own feedbacks"
  on public.feedbacks for select
  using (auth.uid() = user_id);

create policy "Users can insert own feedbacks"
  on public.feedbacks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own feedbacks"
  on public.feedbacks for update
  using (auth.uid() = user_id);

create policy "Users can delete own feedbacks"
  on public.feedbacks for delete
  using (auth.uid() = user_id);

-- Policies: feedback_responses
create policy "Users can view responses on own feedbacks"
  on public.feedback_responses for select
  using (
    exists (
      select 1 from public.feedbacks f
      where f.id = feedback_id and f.user_id = auth.uid()
    )
  );

create policy "Users can insert responses on own feedbacks"
  on public.feedback_responses for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.feedbacks f
      where f.id = feedback_id and f.user_id = auth.uid()
    )
  );

-- Policies: feedback_attachments
create policy "Users can view attachments on own feedbacks"
  on public.feedback_attachments for select
  using (
    exists (
      select 1 from public.feedbacks f
      where f.id = feedback_id and f.user_id = auth.uid()
    )
  );

create policy "Users can insert attachments on own feedbacks"
  on public.feedback_attachments for insert
  with check (
    exists (
      select 1 from public.feedbacks f
      where f.id = feedback_id and f.user_id = auth.uid()
    )
  );

-- Policies: feedback_entity_links (admin-only via service role, no user-facing RLS needed)
create policy "Users can view entity links on own feedbacks"
  on public.feedback_entity_links for select
  using (
    exists (
      select 1 from public.feedbacks f
      where f.id = feedback_id and f.user_id = auth.uid()
    )
  );

-- Updated_at trigger
create or replace function public.update_feedbacks_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_feedbacks_updated_at
  before update on public.feedbacks
  for each row execute function public.update_feedbacks_updated_at();
