-- Add performance indexes for frequently queried columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_issues_status_created_by ON public.eos_issues(status, created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_issues_assigned_to_status ON public.eos_issues(assigned_to, status) WHERE assigned_to IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_rocks_status_created_by ON public.eos_rocks(status, created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_rocks_owner_status ON public.eos_rocks(owner_id, status) WHERE owner_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_todos_created_by_completed ON public.eos_todos(created_by, completed_at, archived_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_todos_assigned_completed ON public.eos_todos(assigned_to, completed_at, archived_at) WHERE assigned_to IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_kpis_created_by_active ON public.eos_kpis(created_by, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_kpi_values_kpi_week ON public.eos_kpi_values(kpi_id, week_start_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eos_meetings_created_by_status ON public.eos_meetings(created_by, status);