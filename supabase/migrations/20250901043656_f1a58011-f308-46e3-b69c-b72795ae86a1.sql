
-- 1) Ensure audit_action enum exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'audit_action' AND n.nspname = 'public') THEN
    CREATE TYPE public.audit_action AS ENUM ('create','update','archive','resolve','complete');
  END IF;
END$$;

-- 2) Security-definer bootstrap for profiles + roles (avoid triggers on auth schema)
--    Inserts missing profile and default 'user' role, and grants admin if email matches allowlist.
--    This runs with elevated privileges and bypasses RLS safely for bootstrap.
CREATE OR REPLACE FUNCTION public.ensure_user_bootstrap(_user_id uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_email text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'ensure_user_bootstrap: _user_id is NULL';
  END IF;

  -- Look up email via profiles first (if exists), else from auth using RPC-safe approach via pg auth schema is restricted.
  -- We rely on profiles if present; otherwise we attempt to infer from existing entries in user_roles (none on first run).
  -- To guarantee email presence, front-end should pass traits to signUp; we fallback to NULL-safe insert.

  -- Ensure profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id) THEN
    INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
    VALUES (_user_id, NULL, NULL, now(), now());
  END IF;

  -- Ensure default role 'user'
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'user') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'user');
  END IF;

  -- Optional: auto-admin for specific allowlisted emails already provisioned by other flows
  -- If a profile has allowlisted email AND no admin yet, grant admin
  SELECT email INTO v_email FROM public.profiles WHERE id = _user_id;
  IF v_email = 'maxime@giguere-influence.com' AND
     NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin');
  END IF;
END;
$$;

-- Grant execute to authenticated users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                 WHERE p.proname = 'ensure_user_bootstrap' AND n.nspname = 'public') THEN
    -- created above
    NULL;
  END IF;
  GRANT EXECUTE ON FUNCTION public.ensure_user_bootstrap(uuid) TO authenticated;
END$$;

-- 3) REPLICA IDENTITY FULL for realtime-friendly updates
ALTER TABLE public.eos_issues REPLICA IDENTITY FULL;
ALTER TABLE public.eos_rocks REPLICA IDENTITY FULL;
ALTER TABLE public.eos_kpis REPLICA IDENTITY FULL;
ALTER TABLE public.eos_kpi_values REPLICA IDENTITY FULL;
ALTER TABLE public.eos_meetings REPLICA IDENTITY FULL;
ALTER TABLE public.eos_meeting_notes REPLICA IDENTITY FULL;
ALTER TABLE public.eos_todos REPLICA IDENTITY FULL;

-- 4) updated_at triggers (idempotent) using existing tg_set_updated_at()
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_issues_set_updated_at') THEN
    CREATE TRIGGER t_eos_issues_set_updated_at
      BEFORE UPDATE ON public.eos_issues
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_rocks_set_updated_at') THEN
    CREATE TRIGGER t_eos_rocks_set_updated_at
      BEFORE UPDATE ON public.eos_rocks
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_kpis_set_updated_at') THEN
    CREATE TRIGGER t_eos_kpis_set_updated_at
      BEFORE UPDATE ON public.eos_kpis
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_kpi_values_set_updated_at') THEN
    CREATE TRIGGER t_eos_kpi_values_set_updated_at
      BEFORE UPDATE ON public.eos_kpi_values
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_meetings_set_updated_at') THEN
    CREATE TRIGGER t_eos_meetings_set_updated_at
      BEFORE UPDATE ON public.eos_meetings
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_meeting_notes_set_updated_at') THEN
    CREATE TRIGGER t_eos_meeting_notes_set_updated_at
      BEFORE UPDATE ON public.eos_meeting_notes
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_todos_set_updated_at') THEN
    CREATE TRIGGER t_eos_todos_set_updated_at
      BEFORE UPDATE ON public.eos_todos
      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END$$;

-- 5) Audit triggers for create/update/archive/resolve/complete (idempotent) using existing tg_audit()
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_issues_audit') THEN
    CREATE TRIGGER t_eos_issues_audit
      AFTER INSERT OR UPDATE ON public.eos_issues
      FOR EACH ROW EXECUTE FUNCTION public.tg_audit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_rocks_audit') THEN
    CREATE TRIGGER t_eos_rocks_audit
      AFTER INSERT OR UPDATE ON public.eos_rocks
      FOR EACH ROW EXECUTE FUNCTION public.tg_audit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_kpis_audit') THEN
    CREATE TRIGGER t_eos_kpis_audit
      AFTER INSERT OR UPDATE ON public.eos_kpis
      FOR EACH ROW EXECUTE FUNCTION public.tg_audit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_kpi_values_audit') THEN
    CREATE TRIGGER t_eos_kpi_values_audit
      AFTER INSERT OR UPDATE ON public.eos_kpi_values
      FOR EACH ROW EXECUTE FUNCTION public.tg_audit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_meetings_audit') THEN
    CREATE TRIGGER t_eos_meetings_audit
      AFTER INSERT OR UPDATE ON public.eos_meetings
      FOR EACH ROW EXECUTE FUNCTION public.tg_audit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_meeting_notes_audit') THEN
    CREATE TRIGGER t_eos_meeting_notes_audit
      AFTER INSERT OR UPDATE ON public.eos_meeting_notes
      FOR EACH ROW EXECUTE FUNCTION public.tg_audit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 't_eos_todos_audit') THEN
    CREATE TRIGGER t_eos_todos_audit
      AFTER INSERT OR UPDATE ON public.eos_todos
      FOR EACH ROW EXECUTE FUNCTION public.tg_audit();
  END IF;
END$$;

-- 6) Seed function (idempotent). Call: select public.seed_demo_data(<some_user_uuid>);
--    NOTE: Requires a valid user id to associate created_by/owner_id per RLS.
CREATE OR REPLACE FUNCTION public.seed_demo_data(_actor uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_kpi_sales uuid;
  v_kpi_nps uuid;
  v_meeting uuid;
BEGIN
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'seed_demo_data: _actor is NULL';
  END IF;

  -- KPIs
  IF NOT EXISTS (SELECT 1 FROM eos_kpis WHERE name = 'Weekly Sales' AND created_by = _actor) THEN
    INSERT INTO eos_kpis (name, unit, direction, target, position, is_active, created_by)
    VALUES ('Weekly Sales', 'USD', 'up', 50000, 1, true, _actor);
  END IF;
  SELECT id INTO v_kpi_sales FROM eos_kpis WHERE name = 'Weekly Sales' AND created_by = _actor LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM eos_kpis WHERE name = 'NPS' AND created_by = _actor) THEN
    INSERT INTO eos_kpis (name, unit, direction, target, position, is_active, created_by)
    VALUES ('NPS', 'score', 'up', 60, 2, true, _actor);
  END IF;
  SELECT id INTO v_kpi_nps FROM eos_kpis WHERE name = 'NPS' AND created_by = _actor LIMIT 1;

  -- KPI values for current week (Monday as week start)
  IF v_kpi_sales IS NOT NULL THEN
    INSERT INTO eos_kpi_values (kpi_id, week_start_date, value, created_by)
    SELECT v_kpi_sales, date_trunc('week', now())::date, 42000, _actor
    WHERE NOT EXISTS (
      SELECT 1 FROM eos_kpi_values
      WHERE kpi_id = v_kpi_sales AND week_start_date = date_trunc('week', now())::date AND created_by = _actor
    );
  END IF;

  IF v_kpi_nps IS NOT NULL THEN
    INSERT INTO eos_kpi_values (kpi_id, week_start_date, value, created_by)
    SELECT v_kpi_nps, date_trunc('week', now())::date, 55, _actor
    WHERE NOT EXISTS (
      SELECT 1 FROM eos_kpi_values
      WHERE kpi_id = v_kpi_nps AND week_start_date = date_trunc('week', now())::date AND created_by = _actor
    );
  END IF;

  -- Rocks
  INSERT INTO eos_rocks (title, description, owner_id, created_by, status, progress, start_date, due_date)
  SELECT 'Launch Q4 Campaign', 'Ship the full EOS feature set with analytics', _actor, _actor, 'in_progress', 35, now()::date, (now() + interval '60 days')::date
  WHERE NOT EXISTS (SELECT 1 FROM eos_rocks WHERE title = 'Launch Q4 Campaign' AND created_by = _actor);

  -- Issues
  INSERT INTO eos_issues (title, description, priority, status, created_by, assigned_to)
  SELECT 'Reduce churn in SMB segment', 'Analyze exit surveys and propose fixes', 2, 'open', _actor, _actor
  WHERE NOT EXISTS (SELECT 1 FROM eos_issues WHERE title = 'Reduce churn in SMB segment' AND created_by = _actor);

  -- Todos
  INSERT INTO eos_todos (description, created_by, assigned_to, due_date)
  SELECT 'Prepare QBR deck', _actor, _actor, (now() + interval '7 days')::date
  WHERE NOT EXISTS (SELECT 1 FROM eos_todos WHERE description = 'Prepare QBR deck' AND created_by = _actor);

  -- Meetings
  IF NOT EXISTS (SELECT 1 FROM eos_meetings WHERE created_by = _actor AND status = 'planned') THEN
    INSERT INTO eos_meetings (created_by, status) VALUES (_actor, 'planned');
  END IF;
  SELECT id INTO v_meeting FROM eos_meetings WHERE created_by = _actor ORDER BY created_at DESC LIMIT 1;

  -- Meeting notes
  IF v_meeting IS NOT NULL THEN
    INSERT INTO eos_meeting_notes (meeting_id, item_type, note, created_by)
    SELECT v_meeting, 'ids', 'Top priority: stabilize onboarding funnel', _actor
    WHERE NOT EXISTS (
      SELECT 1 FROM eos_meeting_notes WHERE meeting_id = v_meeting AND note = 'Top priority: stabilize onboarding funnel' AND created_by = _actor
    );
  END IF;
END;
$$;

-- Grant execute to authenticated users
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION public.seed_demo_data(uuid) TO authenticated;
END$$;
