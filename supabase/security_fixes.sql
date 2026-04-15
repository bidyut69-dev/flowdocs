-- ═══════════════════════════════════════════════════════════
-- FlowDocs Security Fixes (CLEAN VERSION)
-- ═══════════════════════════════════════════════════════════

-- ── FIX 1: Security Definer View ───────────────────────────
drop view if exists user_weekly_stats;

create view user_weekly_stats
with (security_invoker = true)
as
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


-- ── FIX 2: Secure Functions (LOCK SEARCH PATH) ─────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


create or replace function update_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create or replace function is_pro(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id
      and plan = 'pro'
      and (plan_expires_at is null or plan_expires_at > now())
  );
$$;


create or replace function auto_create_contract()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.status = 'signed'
     and NEW.type = 'Proposal'
     and NEW.auto_contract_created = false then

    insert into public.documents (
      user_id, client_id, title, type, status, amount, content
    )
    values (
      NEW.user_id,
      NEW.client_id,
      'Service Contract — ' || NEW.title,
      'Contract',
      'draft',
      NEW.amount,
      jsonb_build_object(
        'description', 'Auto-generated from signed proposal: ' || NEW.title,
        'source_proposal_id', NEW.id
      )
    );

    update public.documents
    set auto_contract_created = true
    where id = NEW.id;
  end if;

  return NEW;
end;
$$;


create or replace function mark_document_opened(
  doc_sign_token uuid,
  viewer_ip text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.documents
  set opened_at = coalesce(opened_at, now())
  where sign_token = doc_sign_token
    and opened_at is null;

  insert into public.audit_log (document_id, action, metadata)
  select id, 'opened', jsonb_build_object('ip', viewer_ip)
  from public.documents
  where sign_token = doc_sign_token;
end;
$$;

grant execute on function mark_document_opened to anon;


-- ── FIX 3: RLS POLICIES (REAL SECURITY, NOT FAKE) ─────────

-- 🔒 audit_log → BACKEND ONLY (logs must be trusted)
drop policy if exists insert_audit on audit_log;

create policy insert_audit
on audit_log
for insert
to service_role
with check (true);


-- 🔒 reminder_log → BACKEND ONLY (you already fixed this once)
drop policy if exists service_role_insert on reminder_log;

create policy service_role_insert
on reminder_log
for insert
to service_role
with check (true);


-- ⚠️ documents signing → controlled public update
drop policy if exists documents_public_sign on documents;

create policy documents_public_sign
on documents
for update
using (sign_token is not null)
with check (
  sign_token is not null
  and status = 'signed'
);


-- ⚠️ feedback → intentionally open (keep, but KNOW why)
-- No change needed (public insert allowed)


-- ── FIX 4: STORAGE SECURITY ──────────────────────────────

-- Make signatures bucket private
update storage.buckets
set public = false
where id = 'signatures';


-- Only owner can READ signatures
drop policy if exists owner_read_signatures on storage.objects;

create policy owner_read_signatures
on storage.objects
for select
using (
  bucket_id = 'signatures'
  and auth.uid() = (
    select user_id
    from documents
    where id::text = split_part(name, '-', 1)
    limit 1
  )
);


-- ⚠️ Upload: STILL PUBLIC but restricted to bucket
drop policy if exists public_upload_signatures on storage.objects;

create policy public_upload_signatures
on storage.objects
for insert
with check (
  bucket_id = 'signatures'
);