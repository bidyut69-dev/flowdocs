-- Run in Supabase SQL Editor
-- Adds payment tracking to profiles table

alter table profiles
  add column if not exists plan text default 'free',
  add column if not exists plan_activated_at timestamptz,
  add column if not exists plan_expires_at timestamptz,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_customer_id text;

-- Helper function to check if user is on pro plan
create or replace function is_pro(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = user_id
    and plan = 'pro'
    and (plan_expires_at is null or plan_expires_at > now())
  );
$$ language sql security definer;
