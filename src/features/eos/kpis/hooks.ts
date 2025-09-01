import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EOSKPI, EOSKPIInsert, EOSKPIUpdate, EOSKPIValue, EOSKPIValueInsert, KPITrendData } from './types';
import { kpisQueryKeys } from './queryKeys';

export function useEOSKPIs() {
  return useQuery({
    queryKey: kpisQueryKeys.lists(),
    queryFn: async (): Promise<EOSKPI[]> => {
      const { data, error } = await supabase
        .from('eos_kpis')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateKPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kpi: EOSKPIInsert): Promise<EOSKPI> => {
      const { data, error } = await supabase
        .from('eos_kpis')
        .insert(kpi)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kpisQueryKeys.all });
      toast({
        title: "KPI created",
        description: "The KPI has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating KPI",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateKPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EOSKPIUpdate }): Promise<EOSKPI> => {
      const { data, error } = await supabase
        .from('eos_kpis')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kpisQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: kpisQueryKeys.values() });
      toast({
        title: "KPI updated",
        description: "The KPI has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating KPI",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useKPIValuesForWeek(weekStartDate: string) {
  return useQuery({
    queryKey: kpisQueryKeys.valuesForWeek(weekStartDate),
    queryFn: async (): Promise<EOSKPIValue[]> => {
      const { data, error } = await supabase
        .from('eos_kpi_values')
        .select('*')
        .eq('week_start_date', weekStartDate);

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 1000,
  });
}

export function useUpsertKPIValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kpiValue: EOSKPIValueInsert): Promise<EOSKPIValue> => {
      const { data, error } = await supabase
        .from('eos_kpi_values')
        .upsert(kpiValue, {
          onConflict: 'kpi_id,week_start_date'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kpisQueryKeys.values() });
    },
    onError: (error) => {
      toast({
        title: "Error saving KPI value",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useKPITrends(kpiId: string) {
  return useQuery({
    queryKey: kpisQueryKeys.trends(kpiId),
    queryFn: async (): Promise<KPITrendData[]> => {
      const thirteenWeeksAgo = new Date();
      thirteenWeeksAgo.setDate(thirteenWeeksAgo.getDate() - (13 * 7));

      const { data, error } = await supabase
        .from('eos_kpi_values')
        .select('week_start_date, value')
        .eq('kpi_id', kpiId)
        .gte('week_start_date', thirteenWeeksAgo.toISOString().split('T')[0])
        .order('week_start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    enabled: !!kpiId,
  });
}