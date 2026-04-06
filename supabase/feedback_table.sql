-- Run this in Supabase SQL Editor (addition to main schema.sql)

-- Feedback table for bug reports
create table if not exists feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  email text,
  type text check (type in ('bug', 'feature', 'other')),
  message text not null,
  url text,
  user_agent text,
  created_at timestamptz default now()
);

alter table feedback enable row level security;
create policy "anyone_insert_feedback" on feedback for insert with check (true);
create policy "owner_read_feedback" on feedback for select using (auth.uid() = user_id);
