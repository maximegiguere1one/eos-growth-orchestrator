
-- 1) Enum pour le statut des vidéos (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_status') THEN
    CREATE TYPE public.video_status AS ENUM ('idea','script','shoot','edit','published');
  END IF;
END$$;

-- 2) Table clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  monthly_quota INTEGER NOT NULL DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'clients_select_own'
  ) THEN
    CREATE POLICY "clients_select_own" ON public.clients
      FOR SELECT USING (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'clients_insert_own'
  ) THEN
    CREATE POLICY "clients_insert_own" ON public.clients
      FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'clients_update_own'
  ) THEN
    CREATE POLICY "clients_update_own" ON public.clients
      FOR UPDATE USING (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'clients_delete_own'
  ) THEN
    CREATE POLICY "clients_delete_own" ON public.clients
      FOR DELETE USING (created_by = auth.uid());
  END IF;
END$$;

-- Index + trigger
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients(is_active);

DROP TRIGGER IF EXISTS set_updated_at_on_clients ON public.clients;
CREATE TRIGGER set_updated_at_on_clients
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) Table videos
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status public.video_status NOT NULL DEFAULT 'idea',
  due_date DATE,
  published_at TIMESTAMPTZ,
  performance JSONB, -- MVP: stockage simple des métriques (ex: {"views": 12500, "engagement": "8.2%"})
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'videos' AND policyname = 'videos_select_own'
  ) THEN
    CREATE POLICY "videos_select_own" ON public.videos
      FOR SELECT USING (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'videos' AND policyname = 'videos_insert_own'
  ) THEN
    CREATE POLICY "videos_insert_own" ON public.videos
      FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'videos' AND policyname = 'videos_update_own'
  ) THEN
    CREATE POLICY "videos_update_own" ON public.videos
      FOR UPDATE USING (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'videos' AND policyname = 'videos_delete_own'
  ) THEN
    CREATE POLICY "videos_delete_own" ON public.videos
      FOR DELETE USING (created_by = auth.uid());
  END IF;
END$$;

-- Index + trigger
CREATE INDEX IF NOT EXISTS idx_videos_created_by ON public.videos(created_by);
CREATE INDEX IF NOT EXISTS idx_videos_client_id ON public.videos(client_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_due_date ON public.videos(due_date);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON public.videos(published_at);

DROP TRIGGER IF EXISTS set_updated_at_on_videos ON public.videos;
CREATE TRIGGER set_updated_at_on_videos
BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) Realtime
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER TABLE public.videos  REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime (idempotent)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END$$;
