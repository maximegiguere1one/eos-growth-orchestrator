
-- 1) Enum status pour campagnes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ad_campaign_status') THEN
    CREATE TYPE public.ad_campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
  END IF;
END$$;

-- 2) Table des campagnes
CREATE TABLE IF NOT EXISTS public.ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  objective TEXT,
  budget_total NUMERIC NOT NULL DEFAULT 0,
  status public.ad_campaign_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ads_campaigns_created_by ON public.ads_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_ads_campaigns_client_id ON public.ads_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_ads_campaigns_status ON public.ads_campaigns(status);

-- RLS
ALTER TABLE public.ads_campaigns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaigns' AND policyname = 'ads_campaigns_select_own'
  ) THEN
    CREATE POLICY ads_campaigns_select_own
      ON public.ads_campaigns
      FOR SELECT
      USING (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaigns' AND policyname = 'ads_campaigns_insert_own'
  ) THEN
    CREATE POLICY ads_campaigns_insert_own
      ON public.ads_campaigns
      FOR INSERT
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaigns' AND policyname = 'ads_campaigns_update_own'
  ) THEN
    CREATE POLICY ads_campaigns_update_own
      ON public.ads_campaigns
      FOR UPDATE
      USING (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaigns' AND policyname = 'ads_campaigns_delete_own'
  ) THEN
    CREATE POLICY ads_campaigns_delete_own
      ON public.ads_campaigns
      FOR DELETE
      USING (created_by = auth.uid());
  END IF;
END$$;

-- Trigger updated_at
DROP TRIGGER IF EXISTS tg_ads_campaigns_set_updated_at ON public.ads_campaigns;
CREATE TRIGGER tg_ads_campaigns_set_updated_at
BEFORE UPDATE ON public.ads_campaigns
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) Table des stats quotidiennes par campagne
CREATE TABLE IF NOT EXISTS public.ads_campaign_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ads_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ads_campaign_stats_campaign_date ON public.ads_campaign_stats(campaign_id, date);
CREATE INDEX IF NOT EXISTS idx_ads_campaign_stats_date ON public.ads_campaign_stats(date);

-- RLS
ALTER TABLE public.ads_campaign_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaign_stats' AND policyname = 'ads_campaign_stats_select_own'
  ) THEN
    CREATE POLICY ads_campaign_stats_select_own
      ON public.ads_campaign_stats
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.ads_campaigns c
        WHERE c.id = ads_campaign_stats.campaign_id
          AND c.created_by = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaign_stats' AND policyname = 'ads_campaign_stats_insert_own'
  ) THEN
    CREATE POLICY ads_campaign_stats_insert_own
      ON public.ads_campaign_stats
      FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.ads_campaigns c
        WHERE c.id = campaign_id
          AND c.created_by = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaign_stats' AND policyname = 'ads_campaign_stats_update_own'
  ) THEN
    CREATE POLICY ads_campaign_stats_update_own
      ON public.ads_campaign_stats
      FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM public.ads_campaigns c
        WHERE c.id = ads_campaign_stats.campaign_id
          AND c.created_by = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ads_campaign_stats' AND policyname = 'ads_campaign_stats_delete_own'
  ) THEN
    CREATE POLICY ads_campaign_stats_delete_own
      ON public.ads_campaign_stats
      FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM public.ads_campaigns c
        WHERE c.id = ads_campaign_stats.campaign_id
          AND c.created_by = auth.uid()
      ));
  END IF;
END$$;

-- Trigger updated_at
DROP TRIGGER IF EXISTS tg_ads_campaign_stats_set_updated_at ON public.ads_campaign_stats;
CREATE TRIGGER tg_ads_campaign_stats_set_updated_at
BEFORE UPDATE ON public.ads_campaign_stats
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) Vue d’agrégation par campagne (metrics cumulés)
CREATE OR REPLACE VIEW public.ads_campaign_metrics AS
SELECT
  c.id AS campaign_id,
  COALESCE(SUM(s.spend), 0)         AS total_spend,
  COALESCE(SUM(s.revenue), 0)       AS total_revenue,
  COALESCE(SUM(s.clicks), 0)        AS total_clicks,
  COALESCE(SUM(s.leads), 0)         AS total_leads,
  CASE WHEN COALESCE(SUM(s.clicks), 0) > 0 
       THEN COALESCE(SUM(s.spend), 0) / NULLIF(SUM(s.clicks), 0)
       ELSE NULL END                AS cpc,
  CASE WHEN COALESCE(SUM(s.leads), 0) > 0 
       THEN COALESCE(SUM(s.spend), 0) / NULLIF(SUM(s.leads), 0)
       ELSE NULL END                AS cpl,
  CASE WHEN COALESCE(SUM(s.spend), 0) > 0 
       THEN COALESCE(SUM(s.revenue), 0) / NULLIF(SUM(s.spend), 0)
       ELSE NULL END                AS roas
FROM public.ads_campaigns c
LEFT JOIN public.ads_campaign_stats s
  ON s.campaign_id = c.id
GROUP BY c.id;
