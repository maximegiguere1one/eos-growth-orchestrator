
-- 1) Performance indexes (idempotent where possible)

-- Profiles
create index if not exists idx_profiles_email on public.profiles (lower(email));
create index if not exists idx_profiles_created_at on public.profiles (created_at);

-- User roles
create index if not exists idx_user_roles_user_id on public.user_roles (user_id);
create index if not exists idx_user_roles_role on public.user_roles (role);

-- Audit logs
create index if not exists idx_audit_logs_actor on public.audit_logs (actor_id);
create index if not exists idx_audit_logs_table on public.audit_logs (table_name);
create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at);

-- Issues
create index if not exists idx_eos_issues_created_by on public.eos_issues (created_by);
create index if not exists idx_eos_issues_assigned_to on public.eos_issues (assigned_to);
create index if not exists idx_eos_issues_status on public.eos_issues (status);
create index if not exists idx_eos_issues_priority on public.eos_issues (priority);
create index if not exists idx_eos_issues_created_at on public.eos_issues (created_at);

-- Rocks
create index if not exists idx_eos_rocks_created_by on public.eos_rocks (created_by);
create index if not exists idx_eos_rocks_owner_id on public.eos_rocks (owner_id);
create index if not exists idx_eos_rocks_status on public.eos_rocks (status);
create index if not exists idx_eos_rocks_due_date on public.eos_rocks (due_date);

-- Todos
create index if not exists idx_eos_todos_created_by on public.eos_todos (created_by);
create index if not exists idx_eos_todos_assigned_to on public.eos_todos (assigned_to);
create index if not exists idx_eos_todos_completed_at on public.eos_todos (completed_at);
create index if not exists idx_eos_todos_due_date on public.eos_todos (due_date);

-- KPIs
create index if not exists idx_eos_kpis_created_by on public.eos_kpis (created_by);
create index if not exists idx_eos_kpis_is_active on public.eos_kpis (is_active);
create index if not exists idx_eos_kpis_position on public.eos_kpis (position);

-- KPI values
create index if not exists idx_eos_kpi_values_kpi_week_user on public.eos_kpi_values (kpi_id, week_start_date, created_by);
create index if not exists idx_eos_kpi_values_created_at on public.eos_kpi_values (created_at);

-- Meetings
create index if not exists idx_eos_meetings_created_by on public.eos_meetings (created_by);
create index if not exists idx_eos_meetings_status on public.eos_meetings (status);
create index if not exists idx_eos_meetings_created_at on public.eos_meetings (created_at);

-- Meeting notes
create index if not exists idx_eos_meeting_notes_meeting_id on public.eos_meeting_notes (meeting_id);
create index if not exists idx_eos_meeting_notes_created_by on public.eos_meeting_notes (created_by);
create index if not exists idx_eos_meeting_notes_created_at on public.eos_meeting_notes (created_at);


-- 2) updated_at triggers (unified)

-- Create a reusable trigger if not present
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'tg_set_updated_at') then
    create or replace function public.tg_set_updated_at()
    returns trigger
    language plpgsql
    set search_path to 'public'
    as $fn$
    begin
      new.updated_at = now();
      return new;
    end;
    $fn$;
  end if;
end
$$;

-- Attach triggers to tables that have updated_at
do $$
begin
  perform 1 from pg_trigger where tgname = 'set_updated_at_eos_issues';
  if not found then
    create trigger set_updated_at_eos_issues before update on public.eos_issues
      for each row execute function public.tg_set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_eos_rocks';
  if not found then
    create trigger set_updated_at_eos_rocks before update on public.eos_rocks
      for each row execute function public.tg_set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_eos_kpis';
  if not found then
    create trigger set_updated_at_eos_kpis before update on public.eos_kpis
      for each row execute function public.tg_set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_eos_kpi_values';
  if not found then
    create trigger set_updated_at_eos_kpi_values before update on public.eos_kpi_values
      for each row execute function public.tg_set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_eos_meetings';
  if not found then
    create trigger set_updated_at_eos_meetings before update on public.eos_meetings
      for each row execute function public.tg_set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_eos_meeting_notes';
  if not found then
    create trigger set_updated_at_eos_meeting_notes before update on public.eos_meeting_notes
      for each row execute function public.tg_set_updated_at();
  end if;

  perform 1 from pg_trigger where tgname = 'set_updated_at_eos_todos';
  if not found then
    create trigger set_updated_at_eos_todos before update on public.eos_todos
      for each row execute function public.tg_set_updated_at();
  end if;
end
$$;


-- 3) Realtime readiness: set REPLICA IDENTITY FULL and ensure publication membership

-- Helper to set REPLICA IDENTITY FULL
do $$
begin
  execute 'alter table public.eos_issues replica identity full';
  execute 'alter table public.eos_rocks replica identity full';
  execute 'alter table public.eos_todos replica identity full';
  execute 'alter table public.eos_kpis replica identity full';
  execute 'alter table public.eos_kpi_values replica identity full';
  execute 'alter table public.eos_meetings replica identity full';
  execute 'alter table public.eos_meeting_notes replica identity full';
exception when others then
  -- ignore errors if already set
  null;
end
$$;

-- Safely add tables to supabase_realtime publication if not already present
do $$
declare
  t text;
begin
  foreach t in array array[
    'eos_issues','eos_rocks','eos_todos','eos_kpis','eos_kpi_values','eos_meetings','eos_meeting_notes'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;


-- 4) Seed helper: seed_current_user_demo()

create or replace function public.seed_current_user_demo()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'seed_current_user_demo: not authenticated';
  end if;

  -- Bootstrap and seed for current user
  perform public.ensure_user_bootstrap(v_user);
  perform public.seed_demo_data(v_user);
end;
$$;

-- RLS: allow authenticated users to call seed_current_user_demo()
-- Note: Functions with security definer bypass RLS. This exposes no data; it inserts defaults for the caller.
grant execute on function public.seed_current_user_demo() to authenticated;
