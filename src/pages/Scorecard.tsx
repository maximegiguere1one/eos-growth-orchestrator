import { useState, useMemo, useCallback } from "react";
import { Plus, TrendingUp, TrendingDown, Target, Edit, Archive } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEOSKPIs, useCreateKPI, useUpdateKPI, useKPIValuesForWeek, useUpsertKPIValue, useKPITrends } from "@/hooks/useEOS";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import debounce from "lodash/debounce";

const kpiFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  unit: z.string().optional(),
  target: z.number().optional(),
  direction: z.enum(["up", "down"]),
  position: z.number().min(0),
});

type KPIFormData = z.infer<typeof kpiFormSchema>;

interface KPIInputCellProps {
  kpiId: string;
  weekStartDate: string;
  initialValue?: number;
  onValueChange: (value: number | null) => void;
}

const KPIInputCell = ({ kpiId, weekStartDate, initialValue, onValueChange }: KPIInputCellProps) => {
  const [value, setValue] = useState(initialValue?.toString() || "");
  const upsertKPIValue = useUpsertKPIValue();

  const debouncedSave = useCallback(
    debounce((val: string) => {
      if (val === "") {
        onValueChange(null);
        return;
      }
      
      const numValue = parseFloat(val);
      if (!isNaN(numValue)) {
        onValueChange(numValue);
        upsertKPIValue.mutate({
          kpi_id: kpiId,
          week_start_date: weekStartDate,
          value: numValue,
        });
      }
    }, 500),
    [kpiId, weekStartDate, onValueChange, upsertKPIValue]
  );

  const handleChange = (newValue: string) => {
    setValue(newValue);
    debouncedSave(newValue);
  };

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full text-center border-0 bg-transparent focus:bg-background transition-colors"
      placeholder="--"
      step="0.01"
    />
  );
};

const KPITrendChart = ({ kpiId, direction }: { kpiId: string; direction: string }) => {
  const { data: trendData } = useKPITrends(kpiId);

  const chartData = useMemo(() => {
    return trendData?.map(item => ({
      week: format(new Date(item.week_start_date), 'dd/MM', { locale: fr }),
      value: Number(item.value)
    })) || [];
  }, [trendData]);

  if (!chartData.length) {
    return <div className="h-12 flex items-center justify-center text-muted-foreground text-sm">Pas de données</div>;
  }

  const isPositiveTrend = chartData.length >= 2 ? 
    chartData[chartData.length - 1].value > chartData[chartData.length - 2].value : false;
  
  const trendColor = direction === "up" ? 
    (isPositiveTrend ? "hsl(var(--success))" : "hsl(var(--destructive))") :
    (isPositiveTrend ? "hsl(var(--destructive))" : "hsl(var(--success))");

  return (
    <ChartContainer
      config={{
        value: {
          label: "Valeur",
          color: trendColor,
        },
      }}
      className="h-12 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={trendColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: trendColor }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const KPIStatusBadge = ({ current, target, direction }: { current?: number; target?: number; direction: string }) => {
  if (!current || !target) return null;

  const isOnTrack = direction === "up" ? current >= target : current <= target;
  
  return (
    <Badge variant={isOnTrack ? "default" : "destructive"} className={cn(
      isOnTrack && "bg-success text-success-foreground"
    )}>
      {isOnTrack ? "Objectif atteint" : "Hors objectif"}
    </Badge>
  );
};

export default function Scorecard() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    return format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<any>(null);

  const { data: kpis = [], isLoading } = useEOSKPIs();
  const { data: kpiValues = [] } = useKPIValuesForWeek(selectedWeek);
  const createKPI = useCreateKPI();
  const updateKPI = useUpdateKPI();

  const form = useForm<KPIFormData>({
    resolver: zodResolver(kpiFormSchema),
    defaultValues: {
      name: "",
      unit: "",
      direction: "up",
      position: kpis.length,
    },
  });

  const weekNavigation = useMemo(() => {
    const currentWeek = new Date(selectedWeek);
    return {
      previous: format(subWeeks(currentWeek, 1), 'yyyy-MM-dd'),
      next: format(addWeeks(currentWeek, 1), 'yyyy-MM-dd'),
      current: format(currentWeek, "'Semaine du' dd MMMM yyyy", { locale: fr }),
    };
  }, [selectedWeek]);

  const kpiValuesMap = useMemo(() => {
    return kpiValues.reduce((acc, value) => {
      acc[value.kpi_id] = value;
      return acc;
    }, {} as Record<string, any>);
  }, [kpiValues]);

  const onSubmit = useCallback(async (data: KPIFormData) => {
    try {
      if (editingKPI) {
        await updateKPI.mutateAsync({ id: editingKPI.id, ...data });
        setEditingKPI(null);
      } else {
        await createKPI.mutateAsync({ 
          name: data.name,
          unit: data.unit || null,
          target: data.target || null,
          direction: data.direction,
          position: data.position,
          is_active: true 
        });
      }
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving KPI:', error);
    }
  }, [editingKPI, updateKPI, createKPI, form]);

  const handleEditKPI = useCallback((kpi: any) => {
    setEditingKPI(kpi);
    form.reset({
      name: kpi.name,
      unit: kpi.unit || "",
      target: kpi.target || undefined,
      direction: kpi.direction,
      position: kpi.position,
    });
    setIsCreateDialogOpen(true);
  }, [form]);

  const handleArchiveKPI = useCallback(async (kpi: any) => {
    try {
      await updateKPI.mutateAsync({
        id: kpi.id,
        archived_at: new Date().toISOString(),
        is_active: false,
      });
    } catch (error) {
      console.error('Error archiving KPI:', error);
    }
  }, [updateKPI]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Scorecard EOS" subtitle="Tableau de bord des indicateurs clés" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-16 animate-pulse bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 motion-safe:animate-fade-in">
      <PageHeader 
        title="Scorecard EOS" 
        subtitle="Suivi des indicateurs clés de performance"
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingKPI(null);
                form.reset({
                  name: "",
                  unit: "",
                  direction: "up",
                  position: kpis.length,
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau KPI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingKPI ? "Modifier le KPI" : "Créer un nouveau KPI"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du KPI</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Chiffre d'affaires" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unité (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: €, %, unités" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectif (optionnel)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="Valeur cible"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direction souhaitée</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la direction" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="up">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Plus c'est haut, mieux c'est
                              </div>
                            </SelectItem>
                            <SelectItem value="down">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" />
                                Plus c'est bas, mieux c'est
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createKPI.isPending || updateKPI.isPending}
                    >
                      {editingKPI ? "Modifier" : "Créer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>Navigation des semaines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedWeek(weekNavigation.previous)}
              >
                ← Semaine précédente
              </Button>
              
              <div className="text-lg font-medium text-foreground">
                {weekNavigation.current}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setSelectedWeek(weekNavigation.next)}
              >
                Semaine suivante →
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section>
        {kpis.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucun KPI configuré
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Créez votre premier indicateur pour commencer le suivi de vos performances
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un KPI
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Indicateurs de performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {kpis.map((kpi, index) => {
                const currentValue = kpiValuesMap[kpi.id];
                
                return (
                  <div key={kpi.id}>
                    <div className="grid grid-cols-12 gap-4 items-center py-4">
                      {/* KPI Name & Info */}
                      <div className="col-span-3">
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">{kpi.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {kpi.direction === "up" ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {kpi.target && (
                              <span>Objectif: {kpi.target}{kpi.unit && ` ${kpi.unit}`}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Current Value Input */}
                      <div className="col-span-2">
                        <KPIInputCell
                          kpiId={kpi.id}
                          weekStartDate={selectedWeek}
                          initialValue={currentValue?.value}
                          onValueChange={() => {}} // Value updates handled internally
                        />
                      </div>

                      {/* Unit */}
                      <div className="col-span-1 text-sm text-muted-foreground">
                        {kpi.unit || ""}
                      </div>

                      {/* Status Badge */}
                      <div className="col-span-2">
                        <KPIStatusBadge
                          current={currentValue?.value}
                          target={kpi.target}
                          direction={kpi.direction}
                        />
                      </div>

                      {/* Trend Chart */}
                      <div className="col-span-3">
                        <KPITrendChart kpiId={kpi.id} direction={kpi.direction} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditKPI(kpi)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveKPI(kpi)}
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < kpis.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </Section>
    </div>
  );
}