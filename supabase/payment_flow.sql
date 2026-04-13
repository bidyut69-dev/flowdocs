-- ═══════════════════════════════════════════════════════
-- FlowDocs Payment Flow Schema
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Add payment columns to documents
alter table documents
  add column if not exists razorpay_payment_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists currency text default 'INR',
  add column if not exists payment_link text;

-- ── AUTO: Contract signed → Create Invoice ────────────
create or replace function auto_create_invoice()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- When Contract is signed and no invoice exists yet
  if NEW.status = 'signed'
    and NEW.type = 'Contract'
    and NEW.auto_invoice_created = false
    and NEW.amount > 0
  then
    insert into public.documents (
      user_id, client_id, title, type, status,
      amount, currency, content
    ) values (
      NEW.user_id, NEW.client_id,
      'Invoice — ' || NEW.title,
      'Invoice', 'draft',
      NEW.amount,
      coalesce(NEW.currency, 'INR'),
      jsonb_build_object(
        'description', 'Payment for: ' || NEW.title,
        'items', jsonb_build_array(
          jsonb_build_object(
            'description', NEW.title,
            'qty', 1,
            'rate', NEW.amount
          )
        ),
        'source_contract_id', NEW.id
      )
    );
    update public.documents
      set auto_invoice_created = true
    where id = NEW.id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_contract_signed on documents;
create trigger on_contract_signed
  after update on documents
  for each row execute procedure auto_create_invoice();

-- ── FUNCTION: Mark invoice paid (called from client) ──
create or replace function mark_invoice_paid(
  p_doc_id uuid,
  p_payment_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.documents
  set
    status = 'paid',
    razorpay_payment_id = p_payment_id,
    paid_at = now()
  where id = p_doc_id;

  insert into public.audit_log (document_id, action, metadata)
  values (p_doc_id, 'paid', jsonb_build_object('payment_id', p_payment_id));
end;
$$;

grant execute on function mark_invoice_paid to anon;