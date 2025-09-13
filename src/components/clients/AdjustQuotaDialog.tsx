import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUpdateClient } from "@/hooks/useClientsAdvanced";
import { ClientAdvanced } from "@/hooks/useClientsAdvanced";

interface AdjustQuotaDialogProps {
  client: ClientAdvanced | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdjustQuotaDialog({ client, open, onOpenChange }: AdjustQuotaDialogProps) {
  const [formData, setFormData] = useState({
    quota: client?.monthly_quota || 0,
    period: 'current', // 'current' or 'next'
    reason: ''
  });
  
  const { toast } = useToast();
  const updateClient = useUpdateClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      await updateClient.mutateAsync({
        id: client.id,
        updates: {
          monthly_quota: formData.quota
        }
      });
      
      toast({
        title: "Quota ajusté",
        description: `Le quota de ${client.name} a été mis à jour à ${formData.quota} vidéos/mois.`
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du quota.",
        variant: "destructive"
      });
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuster Quota - {client.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Quota actuel</div>
            <div className="text-lg font-bold">{client.monthly_quota} vidéos/mois</div>
            <div className="text-sm text-muted-foreground">
              Utilisé: {client.utilization?.published_count || 0} / {client.monthly_quota} 
              ({client.utilization?.utilization_percent || 0}%)
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quota">Nouveau quota</Label>
            <Input
              id="quota"
              type="number"
              min="1"
              max="100"
              value={formData.quota}
              onChange={(e) => setFormData(prev => ({ ...prev, quota: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Période d'application</Label>
            <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Appliquer dès ce mois</SelectItem>
                <SelectItem value="next">À partir du mois prochain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du changement</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Augmentation suite à de bons résultats..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={updateClient.isPending} className="flex-1">
              {updateClient.isPending ? "Mise à jour..." : "Ajuster Quota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}