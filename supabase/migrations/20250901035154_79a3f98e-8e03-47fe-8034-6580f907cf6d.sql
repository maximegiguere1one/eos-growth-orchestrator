-- Add unique constraint for KPI values to support proper upserts
ALTER TABLE public.eos_kpi_values 
ADD CONSTRAINT eos_kpi_values_kpi_week_unique 
UNIQUE (kpi_id, week_start_date);

-- Add audit trigger to eos_issues table
DROP TRIGGER IF EXISTS tg_audit_eos_issues ON public.eos_issues;
CREATE TRIGGER tg_audit_eos_issues
  AFTER INSERT OR UPDATE ON public.eos_issues
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit();

-- Add audit trigger to eos_rocks table  
DROP TRIGGER IF EXISTS tg_audit_eos_rocks ON public.eos_rocks;
CREATE TRIGGER tg_audit_eos_rocks
  AFTER INSERT OR UPDATE ON public.eos_rocks
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit();

-- Add audit trigger to eos_kpis table
DROP TRIGGER IF EXISTS tg_audit_eos_kpis ON public.eos_kpis;
CREATE TRIGGER tg_audit_eos_kpis
  AFTER INSERT OR UPDATE ON public.eos_kpis
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit();

-- Add audit trigger to eos_todos table
DROP TRIGGER IF EXISTS tg_audit_eos_todos ON public.eos_todos;
CREATE TRIGGER tg_audit_eos_todos
  AFTER INSERT OR UPDATE ON public.eos_todos
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit();

-- Add audit trigger to eos_meetings table
DROP TRIGGER IF EXISTS tg_audit_eos_meetings ON public.eos_meetings;
CREATE TRIGGER tg_audit_eos_meetings
  AFTER INSERT OR UPDATE ON public.eos_meetings
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit();