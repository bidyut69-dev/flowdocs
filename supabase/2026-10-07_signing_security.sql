-- ═══════════════════════════════════════════════════════════════════════
-- FlowDocs: lock down the public signing flow
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.
--
-- Problem (from schema.sql / security_fixes.sql):
--   documents_public_read  : FOR SELECT USING (true)
--   documents_public_sign  : FOR UPDATE USING (true / sign_token is not null)
-- With the public anon key, anyone could list every freelancer's documents
-- (client names, emails, amounts, signatures) and edit any of them.
-- mark_invoice_paid(p_doc_id) was also granted to anon, so anyone could
-- mark any document as paid.
--
-- Fix: the sign page talks to the database only through the SECURITY
-- DEFINER functions below. Each one acts on the single document that
-- matches the sign_token in the link, and only moves it forward in the
-- review -> sign -> pay -> intake flow.
--
-- ORDER MATTERS:
--   1. Deploy the SignPage.jsx that calls these functions (commit
--      "SignPage: use token-scoped RPCs"). It falls back to the old
--      queries while the functions are missing, so it works before step 2.
--   2. Then run this SQL. Running it while the OLD SignPage is live would
--      break signing, because the old page reads the table directly.
-- ═══════════════════════════════════════════════════════════════════════


-- ── 1. Read one document by its sign token ───────────────────────────────
create or replace function public.get_document_for_signing(p_sign_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(d)
         - 'user_id'
         || jsonb_build_object(
              'clients',
              case when c.id is null then null
                   else jsonb_build_object('name', c.name, 'email', c.email, 'company', c.company)
              end
            )
  from public.documents d
  left join public.clients c on c.id = d.client_id
  where d.sign_token = p_sign_token
  limit 1;
$$;


-- ── 2. Freelancer details for the sign page (8 fields, never the table) ──
-- An earlier version took a text param and failed because sign_token is uuid.
drop function if exists public.get_payment_info_for_signing(text);

create or replace function public.get_payment_info_for_signing(p_sign_token uuid)
returns table (
  name text,
  company text,
  email text,
  razorpay_key_id text,
  upi_id text,
  bank_name text,
  bank_account text,
  bank_ifsc text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.name, p.company, p.email, p.razorpay_key_id,
         p.upi_id, p.bank_name, p.bank_account, p.bank_ifsc
  from public.documents d
  join public.profiles p on p.id = d.user_id
  where d.sign_token = p_sign_token
  limit 1;
$$;


-- ── 3. Sign: only a document that is not signed yet ──────────────────────
create or replace function public.sign_document(
  p_sign_token uuid,
  p_signer_name text,
  p_signature_data text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce(length(trim(p_signer_name)), 0) < 2 or length(p_signer_name) > 120 then
    raise exception 'Please enter your full name.';
  end if;
  if p_signature_data is null
     or left(p_signature_data, 22) <> 'data:image/png;base64,'
     or length(p_signature_data) > 600000 then
    raise exception 'Invalid signature image.';
  end if;

  update public.documents
     set status = 'signed',
         signer_name = trim(p_signer_name),
         signature_data = p_signature_data,
         signed_at = now()
   where sign_token = p_sign_token
     and status not in ('signed', 'payment_pending', 'paid')
  returning id into v_id;

  if v_id is null then
    raise exception 'This document is already signed or the link is invalid.';
  end if;
end;
$$;


-- ── 4. Client says "I've paid" on the manual UPI / bank flow ─────────────
create or replace function public.mark_payment_pending(p_sign_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.documents
     set status = 'payment_pending'
   where sign_token = p_sign_token
     and status = 'signed';
end;
$$;


-- ── 5. Razorpay success callback ─────────────────────────────────────────
-- Still trusts the browser's payment id (no server-side signature check
-- yet), but it is now limited to the document in the link and only from
-- the signed / payment_pending states. A Razorpay webhook that verifies
-- the payment with the key secret is the real fix (see README note).
create or replace function public.mark_paid_by_token(p_sign_token uuid, p_payment_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_payment_id is null or p_payment_id !~ '^pay_[A-Za-z0-9]{6,40}$' then
    raise exception 'Invalid payment id.';
  end if;

  update public.documents
     set status = 'paid',
         razorpay_payment_id = p_payment_id,
         paid_at = now()
   where sign_token = p_sign_token
     and status in ('signed', 'payment_pending')
  returning id into v_id;

  if v_id is not null then
    insert into public.audit_log (document_id, action, metadata)
    values (v_id, 'paid', jsonb_build_object('payment_id', p_payment_id));
  end if;
end;
$$;


-- ── 6. Intake form answers ───────────────────────────────────────────────
create or replace function public.submit_intake(p_sign_token uuid, p_responses jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_responses is null or jsonb_typeof(p_responses) <> 'object'
     or length(p_responses::text) > 20000 then
    raise exception 'Invalid intake answers.';
  end if;

  update public.documents
     set intake_responses = p_responses,
         intake_submitted_at = now()
   where sign_token = p_sign_token
     and status in ('signed', 'payment_pending', 'paid');
end;
$$;


-- ── 7. Grants ────────────────────────────────────────────────────────────
grant execute on function public.get_document_for_signing(uuid)      to anon, authenticated;
grant execute on function public.get_payment_info_for_signing(uuid)  to anon, authenticated;
grant execute on function public.sign_document(uuid, text, text)     to anon, authenticated;
grant execute on function public.mark_payment_pending(uuid)          to anon, authenticated;
grant execute on function public.mark_paid_by_token(uuid, text)      to anon, authenticated;
grant execute on function public.submit_intake(uuid, jsonb)          to anon, authenticated;
-- mark_document_opened(uuid, text) already exists and is granted to anon.

-- Old helper keyed by document id: no longer callable from the browser.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'mark_invoice_paid') then
    revoke execute on function public.mark_invoice_paid(uuid, text) from anon, public;
  end if;
end $$;


-- ── 8. Remove the open document policies ─────────────────────────────────
-- Owners keep full access through "documents_owner" (auth.uid() = user_id).
drop policy if exists "documents_public_read" on public.documents;
drop policy if exists "documents_public_sign" on public.documents;
drop policy if exists documents_public_sign on public.documents;


-- ── 9. Signatures bucket: private, no public listing (fix list P2 #8) ────
-- The sign page now stores the signature only as base64 in
-- documents.signature_data, so the bucket no longer needs public access.
update storage.buckets set public = false where id = 'signatures';
drop policy if exists "signatures_read" on storage.objects;
drop policy if exists "signatures_upload" on storage.objects;
drop policy if exists public_upload_signatures on storage.objects;


-- ── 10. Check after running (each should match the comment) ──────────────
-- Policies on documents: only the owner policy should remain.
--   select policyname, cmd, roles, qual from pg_policies where tablename = 'documents';
-- Functions exist with uuid params:
--   select proname, pg_get_function_identity_arguments(oid) from pg_proc
--   where proname in ('get_document_for_signing','get_payment_info_for_signing',
--                     'sign_document','mark_payment_pending','mark_paid_by_token','submit_intake');
-- As anon this must now return 0 rows (run from the browser console on the live site):
--   (await supabase.from('documents').select('id')).data?.length
