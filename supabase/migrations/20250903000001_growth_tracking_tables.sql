-- Migration pour les tables de suivi de croissance
-- Créé le 2025-09-03

-- Table pour les métriques de croissance des clients
CREATE TABLE IF NOT EXISTS client_growth_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    week_start_date DATE NOT NULL,
    revenue DECIMAL(12,2) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0,
    customer_satisfaction INTEGER DEFAULT 0,
    growth_score INTEGER DEFAULT 0,
    health_status TEXT CHECK (health_status IN ('excellent', 'good', 'warning', 'critical')) DEFAULT 'good',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, week_start_date)
);

-- Table pour les alertes de croissance
CREATE TABLE IF NOT EXISTS growth_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    alert_type TEXT CHECK (alert_type IN ('revenue_decline', 'churn_spike', 'satisfaction_drop', 'growth_stagnation')) NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    message TEXT NOT NULL,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les recommandations de croissance
CREATE TABLE IF NOT EXISTS growth_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    recommendation_type TEXT CHECK (recommendation_type IN ('eos_issue', 'eos_rock', 'kpi_focus', 'meeting_action')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    estimated_impact TEXT CHECK (estimated_impact IN ('low', 'medium', 'high')) DEFAULT 'medium',
    implementation_effort TEXT CHECK (implementation_effort IN ('easy', 'moderate', 'complex')) DEFAULT 'moderate',
    is_implemented BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    implemented_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les règles de workflow automatisé
CREATE TABLE IF NOT EXISTS workflow_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT CHECK (trigger_type IN ('metric_threshold', 'trend_analysis', 'time_based', 'manual')) NOT NULL,
    trigger_conditions JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    client_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique d'exécution des workflows
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_rule_id UUID REFERENCES workflow_rules(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL,
    trigger_data JSONB DEFAULT '{}'::jsonb,
    execution_status TEXT CHECK (execution_status IN ('success', 'failed', 'partial')) DEFAULT 'success',
    actions_executed JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_client_growth_metrics_client_date ON client_growth_metrics(client_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_growth_alerts_client_unresolved ON growth_alerts(client_id, is_resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_recommendations_client_active ON growth_recommendations(client_id, is_implemented, priority DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_active ON workflow_rules(is_active, client_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_rule_date ON workflow_executions(workflow_rule_id, executed_at DESC);

-- Triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_growth_metrics_updated_at 
    BEFORE UPDATE ON client_growth_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_rules_updated_at 
    BEFORE UPDATE ON workflow_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer automatiquement le score de santé
CREATE OR REPLACE FUNCTION calculate_health_score(
    p_revenue DECIMAL,
    p_active_users INTEGER,
    p_conversion_rate DECIMAL,
    p_churn_rate DECIMAL,
    p_customer_satisfaction INTEGER
) RETURNS INTEGER AS $$
DECLARE
    normalized_revenue DECIMAL;
    normalized_users DECIMAL;
    normalized_conversion DECIMAL;
    normalized_churn DECIMAL;
    normalized_satisfaction DECIMAL;
    final_score INTEGER;
BEGIN
    -- Normalisation des métriques (0-100)
    normalized_revenue := LEAST(100, (p_revenue / 10000.0) * 100);
    normalized_users := LEAST(100, (p_active_users / 1000.0) * 100);
    normalized_conversion := p_conversion_rate;
    normalized_churn := GREATEST(0, 100 - (p_churn_rate * 10)); -- Inversé car plus bas = mieux
    normalized_satisfaction := p_customer_satisfaction;
    
    -- Calcul pondéré
    final_score := ROUND(
        normalized_revenue * 0.3 +
        normalized_users * 0.2 +
        normalized_conversion * 0.2 +
        normalized_churn * 0.15 +
        normalized_satisfaction * 0.15
    );
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour déterminer le statut de santé
CREATE OR REPLACE FUNCTION get_health_status(score INTEGER) 
RETURNS TEXT AS $$
BEGIN
    IF score >= 80 THEN
        RETURN 'excellent';
    ELSIF score >= 65 THEN
        RETURN 'good';
    ELSIF score >= 50 THEN
        RETURN 'warning';
    ELSE
        RETURN 'critical';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement le score et statut de santé
CREATE OR REPLACE FUNCTION auto_calculate_health_metrics()
RETURNS TRIGGER AS $$
BEGIN
    NEW.growth_score := calculate_health_score(
        NEW.revenue,
        NEW.active_users,
        NEW.conversion_rate,
        NEW.churn_rate,
        NEW.customer_satisfaction
    );
    
    NEW.health_status := get_health_status(NEW.growth_score);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_health_metrics_trigger
    BEFORE INSERT OR UPDATE ON client_growth_metrics
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_health_metrics();

-- Fonction pour générer automatiquement des alertes
CREATE OR REPLACE FUNCTION generate_growth_alerts()
RETURNS TRIGGER AS $$
DECLARE
    previous_metrics RECORD;
    revenue_change DECIMAL;
BEGIN
    -- Récupérer les métriques de la semaine précédente
    SELECT * INTO previous_metrics
    FROM client_growth_metrics
    WHERE client_id = NEW.client_id 
    AND week_start_date < NEW.week_start_date
    ORDER BY week_start_date DESC
    LIMIT 1;
    
    -- Alerte baisse de revenus
    IF previous_metrics.revenue IS NOT NULL AND previous_metrics.revenue > 0 THEN
        revenue_change := ((NEW.revenue - previous_metrics.revenue) / previous_metrics.revenue) * 100;
        
        IF revenue_change < -10 THEN
            INSERT INTO growth_alerts (client_id, alert_type, severity, message, recommended_actions)
            VALUES (
                NEW.client_id,
                'revenue_decline',
                CASE WHEN revenue_change < -25 THEN 'critical'
                     WHEN revenue_change < -20 THEN 'high'
                     ELSE 'medium' END,
                'Baisse significative des revenus détectée: ' || ROUND(revenue_change, 1) || '%',
                '["Analyser les causes de la baisse", "Créer un issue EOS prioritaire", "Planifier une réunion d''urgence"]'::jsonb
            );
        END IF;
    END IF;
    
    -- Alerte taux de churn élevé
    IF NEW.churn_rate > 5 THEN
        INSERT INTO growth_alerts (client_id, alert_type, severity, message, recommended_actions)
        VALUES (
            NEW.client_id,
            'churn_spike',
            CASE WHEN NEW.churn_rate > 10 THEN 'critical'
                 WHEN NEW.churn_rate > 7 THEN 'high'
                 ELSE 'medium' END,
            'Taux de churn critique: ' || NEW.churn_rate || '%',
            '["Analyser les raisons de départ", "Mettre en place un plan de rétention", "Créer un Rock de réduction du churn"]'::jsonb
        );
    END IF;
    
    -- Alerte satisfaction faible
    IF NEW.customer_satisfaction < 70 THEN
        INSERT INTO growth_alerts (client_id, alert_type, severity, message, recommended_actions)
        VALUES (
            NEW.client_id,
            'satisfaction_drop',
            CASE WHEN NEW.customer_satisfaction < 50 THEN 'critical'
                 WHEN NEW.customer_satisfaction < 60 THEN 'high'
                 ELSE 'medium' END,
            'Satisfaction client faible: ' || NEW.customer_satisfaction || '/100',
            '["Enquête de satisfaction approfondie", "Plan d''amélioration de l''expérience client", "Formation équipe support"]'::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_growth_alerts_trigger
    AFTER INSERT OR UPDATE ON client_growth_metrics
    FOR EACH ROW EXECUTE FUNCTION generate_growth_alerts();

-- RLS (Row Level Security) pour sécuriser les données
ALTER TABLE client_growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques (à adapter selon votre système d'auth)
CREATE POLICY "Users can manage their own growth metrics" ON client_growth_metrics
    FOR ALL USING (auth.uid()::text = client_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can manage their own alerts" ON growth_alerts
    FOR ALL USING (auth.uid()::text = client_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can manage their own recommendations" ON growth_recommendations
    FOR ALL USING (auth.uid()::text = client_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can manage their own workflows" ON workflow_rules
    FOR ALL USING (auth.uid()::text = client_id OR client_id IS NULL OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own workflow executions" ON workflow_executions
    FOR SELECT USING (auth.uid()::text = client_id OR auth.jwt() ->> 'role' = 'admin');
