import { useState, useMemo, useCallback } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useEOSMeetings, useCreateMeeting, useUpdateMeeting } from "@/hooks/useEOS";
import { 
  Calendar, 
  Plus, 
  Play, 
  Square,
  Clock,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Memoized components for performance
const MeetingStatusBadge = ({ status }: { status: string }) => {
  const variants = {
    planned: { variant: "outline" as const, text: "Planifiée" },
    in_progress: { variant: "default" as const, text: "En cours" },
    ended: { variant: "secondary" as const, text: "Terminée" },
  };
  
  const config = variants[status as keyof typeof variants] || variants.planned;
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.text}
    </Badge>
  );
};

const MeetingCard = ({ 
  meeting, 
  onStart, 
  onEnd, 
  onArchive 
}: { 
  meeting: any;
  onStart: (id: string) => void;
  onEnd: (id: string) => void;
  onArchive: (id: string) => void;
}) => {
  const totalMinutes = useMemo(() => 
    meeting.agenda?.reduce((sum: number, item: any) => sum + (item.minutes || 0), 0) || 90,
    [meeting.agenda]
  );

  const handleStart = useCallback(() => onStart(meeting.id), [meeting.id, onStart]);
  const handleEnd = useCallback(() => onEnd(meeting.id), [meeting.id, onEnd]);
  const handleArchive = useCallback(() => onArchive(meeting.id), [meeting.id, onArchive]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">
              Réunion Level 10
            </CardTitle>
            <MeetingStatusBadge status={meeting.status} />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {meeting.status === 'planned' && (
                <DropdownMenuItem onClick={handleStart}>
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer
                </DropdownMenuItem>
              )}
              {meeting.status === 'in_progress' && (
                <DropdownMenuItem onClick={handleEnd}>
                  <Square className="h-4 w-4 mr-2" />
                  Terminer
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleArchive} className="text-muted-foreground">
                Archiver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{totalMinutes} min</span>
          </div>
          <div>
            Créée le {format(new Date(meeting.created_at), 'dd MMM yyyy', { locale: fr })}
          </div>
        </div>
        
        {meeting.started_at && (
          <div className="text-xs text-muted-foreground">
            Démarrée le {format(new Date(meeting.started_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
          </div>
        )}
        
        {meeting.ended_at && (
          <div className="text-xs text-muted-foreground">
            Terminée le {format(new Date(meeting.ended_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {meeting.agenda?.slice(0, 3).map((item: any) => (
            <Badge key={item.key} variant="outline" className="text-xs">
              {item.title}
            </Badge>
          ))}
          {meeting.agenda?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{meeting.agenda.length - 3} autres
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function EOSMeetings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: meetings = [], isLoading, error } = useEOSMeetings();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();

  // Memoized filtered meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchesSearch = searchTerm === "" || 
        meeting.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [meetings, searchTerm, statusFilter]);

  // Memoized meeting groups
  const meetingGroups = useMemo(() => {
    const grouped = {
      planned: filteredMeetings.filter(m => m.status === 'planned'),
      in_progress: filteredMeetings.filter(m => m.status === 'in_progress'),
      ended: filteredMeetings.filter(m => m.status === 'ended'),
    };
    return grouped;
  }, [filteredMeetings]);

  // Handlers
  const handleCreateMeeting = useCallback(() => {
    const defaultAgenda = [
      { key: "segue", title: "Segue", minutes: 5 },
      { key: "scorecard", title: "Scorecard review", minutes: 5 },
      { key: "rocks", title: "Rock review", minutes: 5 },
      { key: "headlines", title: "Customer/employee headlines", minutes: 5 },
      { key: "todos", title: "To-do list", minutes: 5 },
      { key: "ids", title: "Issues solving (IDS)", minutes: 60 },
      { key: "conclude", title: "Conclude", minutes: 5 }
    ];

    createMeeting.mutate({
      status: 'planned',
      agenda: defaultAgenda,
      started_at: null,
      ended_at: null,
      archived_at: null
    });
  }, [createMeeting]);

  const handleStartMeeting = useCallback((id: string) => {
    updateMeeting.mutate({
      id,
      updates: {
        status: 'in_progress',
        started_at: new Date().toISOString()
      }
    });
  }, [updateMeeting]);

  const handleEndMeeting = useCallback((id: string) => {
    updateMeeting.mutate({
      id,
      updates: {
        status: 'ended',
        ended_at: new Date().toISOString()
      }
    });
  }, [updateMeeting]);

  const handleArchiveMeeting = useCallback((id: string) => {
    updateMeeting.mutate({
      id,
      updates: {
        archived_at: new Date().toISOString()
      }
    });
  }, [updateMeeting]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Réunions Level 10" />
        <Section>
          <EmptyState
            icon={Calendar}
            title="Erreur de chargement"
            description="Impossible de charger les réunions"
          />
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Réunions Level 10"
        subtitle="Gestion des réunions EOS hebdomadaires"
        actions={
          <Button onClick={handleCreateMeeting} disabled={createMeeting.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle réunion
          </Button>
        }
      />

      {/* Filters */}
      <Section className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une réunion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter === "all" ? "Tous les statuts" : 
                 statusFilter === "planned" ? "Planifiées" :
                 statusFilter === "in_progress" ? "En cours" : "Terminées"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Tous les statuts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("planned")}>
                Planifiées
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                En cours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("ended")}>
                Terminées
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-6">
          {["Planifiées", "En cours", "Terminées"].map((status) => (
            <Section key={status}>
              <h2 className="text-xl font-semibold mb-4">{status}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </Section>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Planned Meetings */}
          {meetingGroups.planned.length > 0 && (
            <Section className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Réunions planifiées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetingGroups.planned.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onStart={handleStartMeeting}
                    onEnd={handleEndMeeting}
                    onArchive={handleArchiveMeeting}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* In Progress Meetings */}
          {meetingGroups.in_progress.length > 0 && (
            <Section className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Réunions en cours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetingGroups.in_progress.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onStart={handleStartMeeting}
                    onEnd={handleEndMeeting}
                    onArchive={handleArchiveMeeting}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Ended Meetings */}
          {meetingGroups.ended.length > 0 && (
            <Section className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Réunions terminées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetingGroups.ended.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onStart={handleStartMeeting}
                    onEnd={handleEndMeeting}
                    onArchive={handleArchiveMeeting}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Empty State */}
          {filteredMeetings.length === 0 && !isLoading && (
            <Section>
              <EmptyState
                icon={Calendar}
                title="Aucune réunion trouvée"
                description="Créez votre première réunion Level 10 pour commencer"
                action={{
                  label: "Créer une réunion",
                  onClick: handleCreateMeeting
                }}
              />
            </Section>
          )}
        </div>
      )}
    </div>
  );
}