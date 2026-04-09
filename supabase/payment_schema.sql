-- FlowDocs: Payment Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query

alter table profiles
  add column if not exists plan text default 'free',
  add column if not exists plan_activated_at timestamptz,
  add column if not exists plan_expires_at timestamptz,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_customer_id text;

create or replace function is_pro(p_user_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from profiles
    where id = p_user_id
      and plan = 'pro'
      and (plan_expires_at is null or plan_expires_at > now())
  );
$$;