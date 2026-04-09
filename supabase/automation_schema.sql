-- ═══════════════════════════════════════════════════
-- FlowDocs v3 — Automation & Tracking Schema
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Track when client opens a document
alter table documents
  add column if not exists opened_at timestamptz,
  add column if not exists reminder_sent_at timestamptz,
  add column if not exists auto_contract_created boolean default false,
  add column if not exists auto_invoice_created boolean default false;

-- Reminder log (prevent duplicate reminders)
create table if not exists reminder_log (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade,
  type text not null, -- 'proposal_not_opened' | 'proposal_not_signed' | 'invoice_overdue'
  sent_at timestamptz default now()
);

alter table reminder_log enable row level security;
create policy "service_role_only" on reminder_log using (true);

-- Audit log (every action timestamped)
create table if not exists audit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  action text not null, -- 'created' | 'sent' | 'opened' | 'signed' | 'paid' | 'reminded'
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

alter table audit_log enable row level security;
create policy "owner_read_audit" on audit_log for select using (auth.uid() = user_id);
create policy "insert_audit" on audit_log for insert with check (true);

-- Onboarding status (track if user completed onboarding)
alter table profiles
  add column if not exists onboarding_completed boolean default false,
  add column if not exists onboarding_completed_at timestamptz;

-- ── AUTOMATION TRIGGER: Proposal signed → auto create contract ────────
create or replace function auto_create_contract()
returns trigger as $$
begin
  -- When proposal is signed and auto_contract not yet created
  if NEW.status = 'signed' and NEW.type = 'Proposal' and NEW.auto_contract_created = false then
    insert into documents (user_id, client_id, title, type, status, amount, content)
    values (
      NEW.user_id,
      NEW.client_id,
      'Service Contract — ' || NEW.title,
      'Contract',
      'draft',
      NEW.amount,
      jsonb_build_object(
        'description', 'Auto-generated from signed proposal: ' || NEW.title || E'\n\nThis contract is based on the proposal accepted by the client. Please review and send for signature.',
        'source_proposal_id', NEW.id
      )
    );
    update documents set auto_contract_created = true where id = NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_proposal_signed on documents;
create trigger on_proposal_signed
  after update on documents
  for each row execute procedure auto_create_contract();

-- ── FUNCTION: Mark document as opened (called from sign page) ─────────
create or replace function mark_document_opened(doc_sign_token uuid, viewer_ip text default null)
returns void as $$
begin
  update documents
  set opened_at = coalesce(opened_at, now())
  where sign_token = doc_sign_token and opened_at is null;

  insert into audit_log (document_id, action, metadata)
  select id, 'opened', jsonb_build_object('ip', viewer_ip)
  from documents where sign_token = doc_sign_token;
end;
$$ language plpgsql security definer;

-- Grant execute to anon (sign page is public)
grant execute on function mark_document_opened to anon;

-- ── WEEKLY DIGEST VIEW ────────────────────────────────────────────────
create or replace view user_weekly_stats as
select
  user_id,
  count(*) filter (where type = 'Proposal' and created_at > now() - interval '7 days') as proposals_sent,
  count(*) filter (where status = 'signed' and updated_at > now() - interval '7 days') as docs_signed,
  count(*) filter (where status = 'paid' and updated_at > now() - interval '7 days') as invoices_paid,
  count(*) filter (where status = 'pending') as pending_total,
  count(*) filter (where status = 'overdue') as overdue_total,
  sum(amount) filter (where status = 'paid' and updated_at > now() - interval '30 days') as earned_30d
from documents
group by user_id;