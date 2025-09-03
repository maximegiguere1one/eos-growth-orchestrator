import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClientAdvanced } from '@/hooks/useClientsAdvanced';
import { MoreHorizontal, Video, AlertTriangle, Settings } from 'lucide-react';

interface VirtualizedClientTableProps {
  clients: ClientAdvanced[];
  selectedClients: string[];
  onSelectionChange: (clientIds: string[]) => void;
  onClientClick: (client: ClientAdvanced) => void;
  height?: number;
}

interface OptimizedClientTableProps {
  clients: ClientAdvanced[];
  selectedClients: string[];
  onSelectClient: (clientId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onClientClick: (client: ClientAdvanced) => void;
}

const ROW_HEIGHT = 72; // Height of each row in pixels

// Simple pagination-based optimization instead of virtualization
export const OptimizedClientTable: React.FC<OptimizedClientTableProps> = ({
  clients,
  selectedClients,
  onSelectClient,
  onSelectAll,
  onClearSelection,
  onClientClick,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(50); // Show 50 items per page
  
  const isAllSelected = selectedClients.length === clients.length && clients.length > 0;
  const isIndeterminate = selectedClients.length > 0 && selectedClients.length < clients.length;

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'churned': return 'destructive';
      case 'prospect': return 'outline';
      default: return 'secondary';
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('fr-CA');
  }, []);

  // Paginated clients
  const paginatedClients = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return clients.slice(startIndex, startIndex + itemsPerPage);
  }, [clients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(clients.length / itemsPerPage);

  // Memoized row component
  const ClientRow = React.memo<{ client: ClientAdvanced }>(({ client }) => {
    const isSelected = selectedClients.includes(client.id);

    return (
      <TableRow 
        className={`hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
        onClick={() => onClientClick(client)}
      >
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectClient(client.id)}
            aria-label={`Sélectionner ${client.domain}`}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{client.domain}</span>
            <span className="text-sm text-muted-foreground">
              {client.account_manager?.display_name || client.account_manager?.email || 'Non assigné'}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusColor(client.status)}>
            {client.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(client.mrr || 0)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {(client as any).video_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Video className="h-3 w-3" />
                {(client as any).video_count}
              </div>
            )}
            {(client as any).issues_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {(client as any).issues_count}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {formatDate(client.last_activity_at)}
          </span>
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={isAllSelected ? onClearSelection : onSelectAll}
                  aria-label="Sélectionner tous les clients"
                />
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead className="text-right">Activité</TableHead>
              <TableHead>Dernière activité</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, clients.length)} sur {clients.length} clients
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Précédent
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the optimized table as the main component
export const VirtualizedClientTable = OptimizedClientTable;
