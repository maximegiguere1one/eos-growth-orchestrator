import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type EOSKPI = Tables<'eos_kpis'>;
export type EOSKPIInsert = TablesInsert<'eos_kpis'>;
export type EOSKPIUpdate = TablesUpdate<'eos_kpis'>;

export type EOSKPIValue = Tables<'eos_kpi_values'>;
export type EOSKPIValueInsert = TablesInsert<'eos_kpi_values'>;
export type EOSKPIValueUpdate = TablesUpdate<'eos_kpi_values'>;

export const KPI_DIRECTION_OPTIONS = [
  { value: 'up' as const, label: 'Higher is Better' },
  { value: 'down' as const, label: 'Lower is Better' },
];

export interface KPITrendData {
  week_start_date: string;
  value: number;
}