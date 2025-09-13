
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Video {
  id: string;
  created_by: string;
  client_id: string;
  title: string;
  status: 'idea' | 'script' | 'shoot' | 'edit' | 'published';
  due_date?: string;
  published_at?: string;
  performance?: {
    views?: string;
    engagement?: string;
  };
  created_at: string;
  updated_at: string;
  archived_at?: string;
  clients?: {
    name: string;
  };
}

export interface VideoStats {
  totalVideos: number;
  published: number;
  inProduction: number;
  pending: number;
  quotaUsage: number;
  overdueTasks: number;
}

// Hook pour récupérer les statistiques
export const useVideoStats = () => {
  return useQuery({
    queryKey: ['video-stats'],
    queryFn: async (): Promise<VideoStats> => {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('status, published_at')
        .is('archived_at', null);
      
      if (error) throw error;
      
      const published = videos.filter(v => v.status === 'published').length;
      const inProduction = videos.filter(v => 
        ['script', 'shoot', 'edit'].includes(v.status)
      ).length;
      const pending = videos.filter(v => v.status === 'idea').length;
      
      // Calcul approximatif du quota mensuel (144 = 12 clients * 12 vidéos)
      const quotaTarget = 144;
      const quotaUsage = Math.round((published / quotaTarget) * 100);
      
      return {
        totalVideos: videos.length,
        published,
        inProduction,
        pending,
        quotaUsage,
        overdueTasks: 0 // À implémenter avec les dates d'échéance
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Hook pour récupérer les vidéos récentes
export const useRecentVideos = (limit = 10) => {
  return useQuery({
    queryKey: ['recent-videos', limit],
    queryFn: async (): Promise<Video[]> => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          clients(name)
        `)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Video[];
    },
    staleTime: 1 * 60 * 1000,
  });
};

// Hook pour récupérer les vidéos par statut (pipeline)
export const useVideosByStatus = () => {
  return useQuery({
    queryKey: ['videos-by-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('status')
        .is('archived_at', null);
      
      if (error) throw error;
      
      const statusCounts = {
        idea: 0,
        script: 0,
        shoot: 0,
        edit: 0,
        published: 0
      };
      
      data.forEach(video => {
        statusCounts[video.status as keyof typeof statusCounts]++;
      });
      
      return [
        { label: "Idée", status: "idea", count: statusCounts.idea, color: "bg-muted" },
        { label: "Script", status: "script", count: statusCounts.script, color: "bg-info" },
        { label: "Tournage", status: "shoot", count: statusCounts.shoot, color: "bg-warning" },
        { label: "Montage", status: "edit", count: statusCounts.edit, color: "bg-primary" },
        { label: "Publié", status: "published", count: statusCounts.published, color: "bg-success" }
      ];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (videoData: { 
      title: string; 
      client_id: string; 
      due_date?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          title: videoData.title,
          client_id: videoData.client_id,
          due_date: videoData.due_date || null,
          status: (videoData.status as any) || 'idea',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos-by-status'] });
    },
  });
};
