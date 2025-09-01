
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ClientFilters } from "@/hooks/useClientsAdvanced";
import { 
  Search, 
  Filter, 
  X, 
  Users, 
  Building, 
  UserCheck, 
  Heart,
  Target,
  Zap,
  Save,
  MoreHorizontal
} from "lucide-react";

interface ClientFiltersBarProps {
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
  onSaveView: () => void;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actif', color: 'bg-green-500' },
  { value: 'paused', label: 'En pause', color: 'bg-yellow-500' },
  { value: 'at_risk', label: 'À risque', color: 'bg-red-500' },
  { value: 'onboarding', label: 'Onboarding', color: 'bg-blue-500' },
  { value: 'archived', label: 'Archivé', color: 'bg-gray-500' },
];

const SEGMENT_OPTIONS = [
  { value: 'ecom', label: 'E-commerce' },
  { value: 'local', label: 'Local Business' },
  { value: 'b2b', label: 'B2B' },
  { value: 'saas', label: 'SaaS' },
  { value: 'other', label: 'Autre' },
];

const INTEGRATION_OPTIONS = [
  { value: 'stripe', label: 'Stripe', icon: DollarSign },
  { value: 'ghl', label: 'GoHighLevel', icon: Users },
  { value: 'ads', label: 'Meta Ads', icon: Target },
  { value: 'ga4', label: 'Google Analytics', icon: TrendingUp },
];

export function ClientFiltersBar({ filters, onFiltersChange, onSaveView }: ClientFiltersBarProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchQuery });
  };

  const updateFilter = (key: keyof ClientFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof ClientFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length) count++;
    if (filters.segment?.length) count++;
    if (filters.account_manager_id?.length) count++;
    if (filters.health_score_min !== undefined) count++;
    if (filters.integrations?.length) count++;
    return count;
  };

  return (
    <Card className="p-4 space-y-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Barre de recherche principale */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom client, domaine, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Filtres et actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtre Statut */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Statut
                {filters.status?.length && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Statut des clients</h4>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status?.includes(option.value) || false}
                        onCheckedChange={() => toggleArrayFilter('status', option.value)}
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtre Segment */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Building className="h-4 w-4 mr-2" />
                Segment
                {filters.segment?.length && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.segment.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="start">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Segments d'activité</h4>
                <div className="space-y-2">
                  {SEGMENT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`segment-${option.value}`}
                        checked={filters.segment?.includes(option.value) || false}
                        onCheckedChange={() => toggleArrayFilter('segment', option.value)}
                      />
                      <label
                        htmlFor={`segment-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtre Santé */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Santé
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Score de santé</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Score minimum</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={filters.health_score_min || ''}
                      onChange={(e) => updateFilter('health_score_min', 
                        e.target.value ? parseInt(e.target.value) : undefined
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Score maximum</label>
                    <Input
                      type="number"
                      placeholder="100"
                      min="0"
                      max="100"
                      value={filters.health_score_max || ''}
                      onChange={(e) => updateFilter('health_score_max',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateFilter('health_score_min', undefined);
                        updateFilter('health_score_max', 59);
                      }}
                      className="w-full justify-start text-destructive"
                    >
                      Comptes à risque (&lt; 60)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateFilter('health_score_min', 80);
                        updateFilter('health_score_max', undefined);
                      }}
                      className="w-full justify-start text-success"
                    >
                      Comptes sains (&gt; 80)
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtre Intégrations */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Intégrations
                {filters.integrations?.length && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.integrations.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="start">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Intégrations connectées</h4>
                <div className="space-y-2">
                  {INTEGRATION_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`integration-${option.value}`}
                        checked={filters.integrations?.includes(option.value) || false}
                        onCheckedChange={() => toggleArrayFilter('integrations', option.value)}
                      />
                      <label
                        htmlFor={`integration-${option.value}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <option.icon className="h-3 w-3" />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Effacer ({getActiveFiltersCount()})
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={onSaveView}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Badges filtres actifs */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtres actifs:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Recherche: {filters.search}
              <button onClick={() => updateFilter('search', undefined)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status?.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              {STATUS_OPTIONS.find(s => s.value === status)?.label}
              <button onClick={() => toggleArrayFilter('status', status)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.segment?.map(segment => (
            <Badge key={segment} variant="secondary" className="gap-1">
              {SEGMENT_OPTIONS.find(s => s.value === segment)?.label}
              <button onClick={() => toggleArrayFilter('segment', segment)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
