-- Phase 1: Database Performance Optimizations

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_eos_issues_created_by ON public.eos_issues(created_by);
CREATE INDEX IF NOT EXISTS idx_eos_issues_assigned_to ON public.eos_issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_eos_issues_status ON public.eos_issues(status);
CREATE INDEX IF NOT EXISTS idx_eos_issues_priority_created_at ON public.eos_issues(priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eos_issues_archived_at ON public.eos_issues(archived_at);

CREATE INDEX IF NOT EXISTS idx_eos_rocks_created_by ON public.eos_rocks(created_by);
CREATE INDEX IF NOT EXISTS idx_eos_rocks_owner_id ON public.eos_rocks(owner_id);
CREATE INDEX IF NOT EXISTS idx_eos_rocks_status ON public.eos_rocks(status);
CREATE INDEX IF NOT EXISTS idx_eos_rocks_archived_at ON public.eos_rocks(archived_at);
CREATE INDEX IF NOT EXISTS idx_eos_rocks_created_at ON public.eos_rocks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_eos_kpis_created_by ON public.eos_kpis(created_by);
CREATE INDEX IF NOT EXISTS idx_eos_kpis_active_position ON public.eos_kpis(is_active, position);
CREATE INDEX IF NOT EXISTS idx_eos_kpis_archived_at ON public.eos_kpis(archived_at);

CREATE INDEX IF NOT EXISTS idx_eos_kpi_values_kpi_id ON public.eos_kpi_values(kpi_id);
CREATE INDEX IF NOT EXISTS idx_eos_kpi_values_week_start ON public.eos_kpi_values(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_eos_kpi_values_created_by ON public.eos_kpi_values(created_by);

CREATE INDEX IF NOT EXISTS idx_eos_todos_created_by ON public.eos_todos(created_by);
CREATE INDEX IF NOT EXISTS idx_eos_todos_assigned_to ON public.eos_todos(assigned_to);
CREATE INDEX IF NOT EXISTS idx_eos_todos_completed_at ON public.eos_todos(completed_at);
CREATE INDEX IF NOT EXISTS idx_eos_todos_archived_at ON public.eos_todos(archived_at);

CREATE INDEX IF NOT EXISTS idx_eos_meetings_created_by ON public.eos_meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_eos_meetings_status ON public.eos_meetings(status);
CREATE INDEX IF NOT EXISTS idx_eos_meetings_archived_at ON public.eos_meetings(archived_at);
CREATE INDEX IF NOT EXISTS idx_eos_meetings_created_at ON public.eos_meetings(created_at DESC);

-- Enable realtime for all EOS tables
ALTER TABLE public.eos_issues REPLICA IDENTITY FULL;
ALTER TABLE public.eos_rocks REPLICA IDENTITY FULL;
ALTER TABLE public.eos_kpis REPLICA IDENTITY FULL;
ALTER TABLE public.eos_kpi_values REPLICA IDENTITY FULL;
ALTER TABLE public.eos_todos REPLICA IDENTITY FULL;
ALTER TABLE public.eos_meetings REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.eos_issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eos_rocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eos_kpis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eos_kpi_values;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eos_todos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eos_meetings;