import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCreateGrowthMetrics, ClientGrowthMetrics, calculateHealthScore, getHealthStatus } from '@/hooks/useGrowthTracking';

interface MetricsInputFormProps {
  clientId: string;
  onSuccess?: () => void;
}

export const MetricsInputForm: React.FC<MetricsInputFormProps> = ({ clientId, onSuccess }) => {
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [revenue, setRevenue] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<string>('');
  const [conversionRate, setConversionRate] = useState<string>('');
  const [churnRate, setChurnRate] = useState<string>('');
  const [customerSatisfaction, setCustomerSatisfaction] = useState<string>('');

  const createMetrics = useCreateGrowthMetrics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const metricsData: Omit<ClientGrowthMetrics, 'id' | 'created_at' | 'updated_at' | 'growth_score' | 'health_status'> = {
      client_id: clientId,
      week_start_date: weekStartDate.toISOString().split('T')[0],
      revenue: parseFloat(revenue) || 0,
      active_users: parseInt(activeUsers) || 0,
      conversion_rate: parseFloat(conversionRate) || 0,
      churn_rate: parseFloat(churnRate) || 0,
      customer_satisfaction: parseFloat(customerSatisfaction) || 0,
    };

    // Calculer le score de santé
    const tempMetrics = {
      ...metricsData,
      id: '',
      created_at: '',
      updated_at: '',
      growth_score: 0,
      health_status: 'good' as const
    };
    
    const healthScore = calculateHealthScore(tempMetrics);
    const healthStatus = getHealthStatus(healthScore);

    const finalMetrics = {
      ...metricsData,
      growth_score: healthScore,
      health_status: healthStatus
    };

    try {
      await createMetrics.mutateAsync(finalMetrics);
      
      // Reset form
      setRevenue('');
      setActiveUsers('');
      setConversionRate('');
      setChurnRate('');
      setCustomerSatisfaction('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des métriques:', error);
    }
  };

  const previewHealthScore = () => {
    if (!revenue || !activeUsers || !conversionRate || !churnRate || !customerSatisfaction) {
      return null;
    }

    const tempMetrics: ClientGrowthMetrics = {
      id: '',
      client_id: clientId,
      week_start_date: '',
      revenue: parseFloat(revenue) || 0,
      active_users: parseInt(activeUsers) || 0,
      conversion_rate: parseFloat(conversionRate) || 0,
      churn_rate: parseFloat(churnRate) || 0,
      customer_satisfaction: parseFloat(customerSatisfaction) || 0,
      growth_score: 0,
      health_status: 'good',
      created_at: '',
      updated_at: ''
    };

    const score = calculateHealthScore(tempMetrics);
    const status = getHealthStatus(score);

    return { score, status };
  };

  const preview = previewHealthScore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Saisir les métriques de croissance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date de la semaine */}
          <div className="space-y-2">
            <Label htmlFor="week-date">Semaine du</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {weekStartDate ? format(weekStartDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={weekStartDate}
                  onSelect={(date) => date && setWeekStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Métriques financières */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Revenus (€)</Label>
              <Input
                id="revenue"
                type="number"
                step="0.01"
                placeholder="Ex: 15000"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="active-users">Utilisateurs actifs</Label>
              <Input
                id="active-users"
                type="number"
                placeholder="Ex: 1250"
                value={activeUsers}
                onChange={(e) => setActiveUsers(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Métriques de performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conversion-rate">Taux de conversion (%)</Label>
              <Input
                id="conversion-rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ex: 3.5"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="churn-rate">Taux de churn (%)</Label>
              <Input
                id="churn-rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ex: 2.1"
                value={churnRate}
                onChange={(e) => setChurnRate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="satisfaction">Satisfaction client (/100)</Label>
              <Input
                id="satisfaction"
                type="number"
                min="0"
                max="100"
                placeholder="Ex: 85"
                value={customerSatisfaction}
                onChange={(e) => setCustomerSatisfaction(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Aperçu du score de santé */}
          {preview && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Score de santé prévu:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{preview.score}/100</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    preview.status === 'excellent' ? 'bg-green-100 text-green-800' :
                    preview.status === 'good' ? 'bg-blue-100 text-blue-800' :
                    preview.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {preview.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createMetrics.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createMetrics.isPending ? 'Enregistrement...' : 'Enregistrer les métriques'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
