-- ═══════════════════════════════════════════════════════════════════════
-- FlowDocs: Supabase advisor cleanup (fix list P2 #10)
-- Run in Supabase Dashboard -> SQL Editor, AFTER 2026-10-07_signing_security.sql.
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════


-- ── 1. reminder_log was readable and writable by everyone ────────────────
-- automation_schema.sql created  policy "service_role_only" ... using (true)
-- with no role, so it applied to anon and authenticated too. Only the
-- backend (service_role, which bypasses RLS anyway) should touch this table.
drop policy if exists "service_role_only" on public.reminder_log;


-- ── 2. "Auth RLS initialization plan" warning ────────────────────────────
-- Policies that call auth.uid() directly re-evaluate it for every row.
-- Wrapping it as (select auth.uid()) evaluates it once per query. This
-- rewrites every public-schema policy in place, whatever its name, so it
-- also covers policies that exist in production but not in this repo.
do $$
declare
  p record;
  new_qual text;
  new_check text;
  stmt text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (
        (qual is not null and qual ~ 'auth\.uid\(\)' and qual !~ 'SELECT auth\.uid\(\)')
        or (with_check is not null and with_check ~ 'auth\.uid\(\)' and with_check !~ 'SELECT auth\.uid\(\)')
      )
  loop
    new_qual  := replace(p.qual, 'auth.uid()', '(select auth.uid())');
    new_check := replace(p.with_check, 'auth.uid()', '(select auth.uid())');
    stmt := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if p.qual is not null then
      stmt := stmt || format(' using (%s)', new_qual);
    end if;
    if p.with_check is not null then
      stmt := stmt || format(' with check (%s)', new_check);
    end if;
    raise notice '%', stmt;
    execute stmt;
  end loop;
end $$;


-- ── 3. "Multiple permissive policies" warning ────────────────────────────
-- The documents table is fixed by the signing migration (only the owner
-- policy remains). For the other tables, list what is left and merge by
-- hand: two permissive policies for the same table + command + role are
-- OR-ed together, so they can usually become one policy.
--
--   select tablename, cmd, roles, array_agg(policyname order by policyname) as policies
--   from pg_policies
--   where schemaname = 'public' and permissive = 'PERMISSIVE'
--   group by tablename, cmd, roles
--   having count(*) > 1
--   order by tablename, cmd;
--
-- Watch for policies with no role and "using (true)" (like section 1):
--
--   select tablename, policyname, cmd, roles, qual
--   from pg_policies
--   where schemaname = 'public' and (qual = 'true' or with_check = 'true');
