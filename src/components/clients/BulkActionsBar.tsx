import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserCheck, 
  Pause, 
  Play, 
  Settings, 
  Mail, 
  Download, 
  X,
  Archive
} from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAssignAM: () => void;
  onToggleStatus: (action: 'pause' | 'activate') => void;
  onAdjustQuota: () => void;
  onSendReport: () => void;
  onExportCsv: () => void;
  onArchive: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onAssignAM,
  onToggleStatus,
  onAdjustQuota,
  onSendReport,
  onExportCsv,
  onArchive
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[600px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-medium">
              {selectedCount} client{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAssignAM}>
              <UserCheck className="h-4 w-4 mr-1" />
              Assigner AM
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="outline" size="sm" onClick={() => onToggleStatus('pause')}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => onToggleStatus('activate')}>
              <Play className="h-4 w-4 mr-1" />
              Activer
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="outline" size="sm" onClick={onAdjustQuota}>
              <Settings className="h-4 w-4 mr-1" />
              Ajuster Quota
            </Button>
            
            <Button variant="outline" size="sm" onClick={onSendReport}>
              <Mail className="h-4 w-4 mr-1" />
              Envoyer Rapport
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="outline" size="sm" onClick={onExportCsv}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            
            <Button variant="destructive" size="sm" onClick={onArchive}>
              <Archive className="h-4 w-4 mr-1" />
              Archiver
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}