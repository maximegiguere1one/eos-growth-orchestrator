
-- ================================
-- EOS schema: clean production start
-- ================================

-- Enums
create type public.issue_status as enum ('open', 'resolved');
create type public.rock_status as enum ('not_started', 'on_track', 'at_risk', 'completed');
create type public.meeting_status as enum ('planned', 'in_progress', 'ended');
create type public.audit_action as enum ('create', 'update', 'archive', 'resolve', 'complete');

-- Helper: updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Audit log table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid,
  table_name text not null,
  row_id uuid not null,
  action public.audit_action not null,
  details jsonb
);

alter table public.audit_logs enable row level security;

-- Allow authenticated users to read their own logs
create policy "audit_logs_select_own"
  on public.audit_logs
  for select
  to authenticated
  using (actor_id = auth.uid());

-- Allow insert via triggers or clients (harmless; content controlled server-side)
create policy "audit_logs_insert_any_authenticated"
  on public.audit_logs
  for insert
  to authenticated
  with check (true);

-- Generic audit trigger
create or replace function public.tg_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _actor uuid := auth.uid();
  _action public.audit_action;
begin
  if tg_op = 'INSERT' then
    _action := 'create';
    insert into public.audit_logs (actor_id, table_name, row_id, action, details)
    values (_actor, tg_table_name, new.id, _action, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    -- classify archive/resolve/complete if applicable
    if (new.archived_at is not null and (old.archived_at is null)) then
      _action := 'archive';
    elsif tg_table_name = 'eos_issues' and new.status = 'resolved' and old.status is distinct from 'resolved' then
      _action := 'resolve';
    elsif tg_table_name = 'eos_rocks' and new.status = 'completed' and old.status is distinct from 'completed' then
      _action := 'complete';
    else
      _action := 'update';
    end if;

    insert into public.audit_logs (actor_id, table_name, row_id, action, details)
    values (_actor, tg_table_name, new.id, _action, jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
    return new;
  end if;
  return new;
end;
$$;

-- ================================
-- Core EOS tables
-- ================================

-- KPIs
create table if not exists public.eos_kpis (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid(),
  name text not null,
  unit text,
  target numeric,
  direction text not null default 'up', -- 'up' or 'down' means directionality where higher/lower is better
  position int not null default 0,
  is_active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eos_kpis_archived_idx on public.eos_kpis(archived_at);
create index if not exists eos_kpis_created_by_idx on public.eos_kpis(created_by);

create trigger eos_kpis_set_updated_at
before update on public.eos_kpis
for each row execute function public.tg_set_updated_at();

alter table public.eos_kpis enable row level security;

create policy "eos_kpis_select_own"
  on public.eos_kpis
  for select
  to authenticated
  using (created_by = auth.uid());

create policy "eos_kpis_insert_own"
  on public.eos_kpis
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "eos_kpis_update_own"
  on public.eos_kpis
  for update
  to authenticated
  using (created_by = auth.uid());

-- KPI values (weekly)
create table if not exists public.eos_kpi_values (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid(),
  kpi_id uuid not null references public.eos_kpis(id) on delete cascade,
  week_start_date date not null, -- convention: Monday of the week
  value numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists eos_kpi_values_unique_week on public.eos_kpi_values(kpi_id, week_start_date);
create index if not exists eos_kpi_values_created_by_idx on public.eos_kpi_values(created_by);

create trigger eos_kpi_values_set_updated_at
before update on public.eos_kpi_values
for each row execute function public.tg_set_updated_at();

alter table public.eos_kpi_values enable row level security;

create policy "eos_kpi_values_select_own"
  on public.eos_kpi_values
  for select
  to authenticated
  using (created_by = auth.uid());

create policy "eos_kpi_values_insert_own"
  on public.eos_kpi_values
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "eos_kpi_values_update_own"
  on public.eos_kpi_values
  for update
  to authenticated
  using (created_by = auth.uid());

-- Issues
create table if not exists public.eos_issues (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid(),
  title text not null,
  description text,
  assigned_to uuid,
  status public.issue_status not null default 'open',
  priority int not null default 0,
  resolved_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eos_issues_archived_idx on public.eos_issues(archived_at);
create index if not exists eos_issues_status_idx on public.eos_issues(status);
create index if not exists eos_issues_created_by_idx on public.eos_issues(created_by);

create trigger eos_issues_set_updated_at
before update on public.eos_issues
for each row execute function public.tg_set_updated_at();

alter table public.eos_issues enable row level security;

create policy "eos_issues_select_own_or_assigned"
  on public.eos_issues
  for select
  to authenticated
  using (created_by = auth.uid() or assigned_to = auth.uid());

create policy "eos_issues_insert_own"
  on public.eos_issues
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "eos_issues_update_own"
  on public.eos_issues
  for update
  to authenticated
  using (created_by = auth.uid());

-- Rocks
create table if not exists public.eos_rocks (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid(),
  title text not null,
  description text,
  owner_id uuid,
  start_date date,
  due_date date,
  progress numeric not null default 0,
  status public.rock_status not null default 'not_started',
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eos_rocks_archived_idx on public.eos_rocks(archived_at);
create index if not exists eos_rocks_status_idx on public.eos_rocks(status);
create index if not exists eos_rocks_created_by_idx on public.eos_rocks(created_by);

create trigger eos_rocks_set_updated_at
before update on public.eos_rocks
for each row execute function public.tg_set_updated_at();

alter table public.eos_rocks enable row level security;

create policy "eos_rocks_select_own_or_owner"
  on public.eos_rocks
  for select
  to authenticated
  using (created_by = auth.uid() or owner_id = auth.uid());

create policy "eos_rocks_insert_own"
  on public.eos_rocks
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "eos_rocks_update_own"
  on public.eos_rocks
  for update
  to authenticated
  using (created_by = auth.uid());

-- Todos
create table if not exists public.eos_todos (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid(),
  description text not null,
  assigned_to uuid,
  due_date date,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eos_todos_archived_idx on public.eos_todos(archived_at);
create index if not exists eos_todos_created_by_idx on public.eos_todos(created_by);

create trigger eos_todos_set_updated_at
before update on public.eos_todos
for each row execute function public.tg_set_updated_at();

alter table public.eos_todos enable row level security;

create policy "eos_todos_select_own_or_assigned"
  on public.eos_todos
  for select
  to authenticated
  using (created_by = auth.uid() or assigned_to = auth.uid());

create policy "eos_todos_insert_own"
  on public.eos_todos
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "eos_todos_update_own"
  on public.eos_todos
  for update
  to authenticated
  using (created_by = auth.uid());

-- Meetings
create table if not exists public.eos_meetings (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid(),
  started_at timestamptz,
  ended_at timestamptz,
  status public.meeting_status not null default 'planned',
  agenda jsonb not null default '[
    {"key":"segue","title":"Segue","minutes":5},
    {"key":"scorecard","title":"Scorecard review","minutes":5},
    {"key":"rocks","title":"Rock review","minutes":5},
    {"key":"headlines","title":"Customer/employee headlines","minutes":5},
    {"key":"todos","title":"To-do list","minutes":5},
    {"key":"ids","title":"Issues solving (IDS)","minutes":60},
    {"key":"conclude","title":"Conclude","minutes":5}
  ]'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eos_meetings_archived_idx on public.eos_meetings(archived_at);
create index if not exists eos_meetings_status_idx on public.eos_meetings(status);
create index if not exists eos_meetings_created_by_idx on public.eos_meetings(created_by);

create trigger eos_meetings_set_updated_at
before update on public.eos_meetings
for each row execute function public.tg_set_updated_at();

alter table public.eos_meetings enable row level security;

create policy "eos_meetings_select_own"
  on public.eos_meetings
  for select
  to authenticated
  using (created_by = auth.uid());

create policy "eos_meetings_insert_own"
  on public.eos_meetings
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "eos_meetings_update_own"
  on public.eos_meetings
  for update
  to authenticated
  using (created_by = auth.uid());

-- Meeting notes
create table if not exists public.eos_meeting_notes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid(),
  meeting_id uuid not null references public.eos_meetings(id) on delete cascade,
  item_type text, -- 'segue' | 'scorecard' | 'rocks' | 'headlines' | 'todos' | 'ids' | 'conclude'
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eos_meeting_notes_meeting_idx on public.eos_meeting_notes(meeting_id);
create index if not exists eos_meeting_notes_created_by_idx on public.eos_meeting_notes(created_by);

create trigger eos_meeting_notes_set_updated_at
before update on public.eos_meeting_notes
for each row execute function public.tg_set_updated_at();

alter table public.eos_meeting_notes enable row level security;

create policy "eos_meeting_notes_select_own"
  on public.eos_meeting_notes
  for select
  to authenticated
  using (created_by = auth.uid());

create policy "eos_meeting_notes_insert_own"
  on public.eos_meeting_notes
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "eos_meeting_notes_update_own"
  on public.eos_meeting_notes
  for update
  to authenticated
  using (created_by = auth.uid());

-- ================================
-- Attach audit triggers
-- ================================
create trigger eos_kpis_audit_trg
after insert or update on public.eos_kpis
for each row execute function public.tg_audit();

create trigger eos_kpi_values_audit_trg
after insert or update on public.eos_kpi_values
for each row execute function public.tg_audit();

create trigger eos_issues_audit_trg
after insert or update on public.eos_issues
for each row execute function public.tg_audit();

create trigger eos_rocks_audit_trg
after insert or update on public.eos_rocks
for each row execute function public.tg_audit();

create trigger eos_todos_audit_trg
after insert or update on public.eos_todos
for each row execute function public.tg_audit();

create trigger eos_meetings_audit_trg
after insert or update on public.eos_meetings
for each row execute function public.tg_audit();

create trigger eos_meeting_notes_audit_trg
after insert or update on public.eos_meeting_notes
for each row execute function public.tg_audit();

-- ================================
-- Notes
-- - No hard delete policies added on purpose.
-- - Frontend should set archived_at instead of DELETE.
-- - Auth is required for RLS-based access (auth.uid()).
-- ================================
