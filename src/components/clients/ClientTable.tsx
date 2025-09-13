
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientAdvanced } from "@/hooks/useClientsAdvanced";
import { useUpdateClient } from "@/hooks/useClientsAdvanced";
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Heart,
  MoreHorizontal,
  Pencil,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientTableProps {
  clients: ClientAdvanced[];
  selectedClients: string[];
  onSelectionChange: (ids: string[]) => void;
  onClientClick: (client: ClientAdvanced) => void;
}

export function ClientTable({ 
  clients, 
  selectedClients, 
  onSelectionChange, 
  onClientClick 
}: ClientTableProps) {
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ClientAdvanced>>({});
  const updateClient = useUpdateClient();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(clients.map(c => c.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedClients, clientId]);
    } else {
      onSelectionChange(selectedClients.filter(id => id !== clientId));
    }
  };

  const startEditing = (client: ClientAdvanced) => {
    setEditingClient(client.id);
    setEditValues({
      monthly_quota: client.monthly_quota,
      status: client.status,
      segment: client.segment,
      account_manager_id: client.account_manager_id,
    });
  };

  const saveEdit = async (clientId: string) => {
    try {
      await updateClient.mutateAsync({ id: clientId, updates: editValues });
      setEditingClient(null);
      setEditValues({});
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const cancelEdit = () => {
    setEditingClient(null);
    setEditValues({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'at_risk': return 'bg-red-500';
      case 'onboarding': return 'bg-blue-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'paused': return 'En pause';
      case 'at_risk': return 'À risque';
      case 'onboarding': return 'Onboarding';
      case 'archived': return 'Archivé';
      default: return status;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getClientAlerts = (client: ClientAdvanced) => {
    const alerts = [];
    
    if (client.utilization && client.utilization.utilization_percent >= 90) {
      alerts.push({ type: 'quota', label: 'Quota 90%', icon: AlertTriangle });
    }
    
    if (client.flags?.includes('no_meeting_14d')) {
      alerts.push({ type: 'meeting', label: 'Aucun RDV 14j', icon: Clock });
    }
    
    if (client.flags?.includes('overdue')) {
      alerts.push({ type: 'overdue', label: 'Impayé', icon: DollarSign });
    }

    return alerts;
  };

  return (
    <div className="border rounded-lg bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedClients.length === clients.length && clients.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Client</TableHead>
            <TableHead>AM</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Quota</TableHead>
            <TableHead>Utilisation</TableHead>
            <TableHead>Santé</TableHead>
            <TableHead>Dernière activité</TableHead>
            <TableHead>MRR</TableHead>
            <TableHead>Alertes</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const isEditing = editingClient === client.id;
            const alerts = getClientAlerts(client);
            
            return (
              <TableRow
                key={client.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedClients.includes(client.id) && "bg-muted/30"
                )}
                onClick={() => !isEditing && onClientClick(client)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) => handleSelectClient(client.id, checked as boolean)}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-xs">
                        {client.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      {client.domain && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {client.domain}
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      )}
                      {client.segment && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {client.segment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editValues.account_manager_id || ''}
                      onValueChange={(value) => setEditValues({ ...editValues, account_manager_id: value })}
                    >
                      <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="AM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
                        {/* TODO: Charger la liste des AM depuis profiles */}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm">
                      {client.account_manager?.display_name || 
                       client.account_manager?.email || 
                       "Non assigné"}
                    </div>
                  )}
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <Select
                      value={editValues.status || client.status}
                      onValueChange={(value) => setEditValues({ ...editValues, status: value as any })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="paused">En pause</SelectItem>
                        <SelectItem value="at_risk">À risque</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="archived">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(client.status)}`} />
                      <span className="text-sm">{getStatusLabel(client.status)}</span>
                    </div>
                  )}
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editValues.monthly_quota || client.monthly_quota}
                      onChange={(e) => setEditValues({ 
                        ...editValues, 
                        monthly_quota: parseInt(e.target.value) || 0 
                      })}
                      className="w-20"
                      min="0"
                    />
                  ) : (
                    <div className="text-sm">{client.monthly_quota} vidéos/mois</div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {client.utilization?.published_count || 0}/{client.monthly_quota}
                      </span>
                      <span className="font-medium">
                        {client.utilization?.utilization_percent || 0}%
                      </span>
                    </div>
                    <Progress 
                      value={client.utilization?.utilization_percent || 0} 
                      className="h-1.5"
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Heart 
                      className={cn("h-4 w-4", getHealthColor(client.health_score))}
                      fill="currentColor"
                    />
                    <span className={cn("text-sm font-medium", getHealthColor(client.health_score))}>
                      {client.health_score}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {client.last_activity_at 
                      ? format(new Date(client.last_activity_at), "dd/MM/yyyy", { locale: fr })
                      : "Jamais"
                    }
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm font-medium">
                    {client.mrr > 0 ? `${client.mrr.toLocaleString('fr-FR')} €` : "-"}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    {alerts.slice(0, 2).map((alert, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="text-xs px-1 py-0 h-5"
                        title={alert.label}
                      >
                        <alert.icon className="h-3 w-3" />
                      </Badge>
                    ))}
                    {alerts.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-5">
                        +{alerts.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveEdit(client.id)}
                        disabled={updateClient.isPending}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(client)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
