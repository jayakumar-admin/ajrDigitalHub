-- AJR Digital Hub - PostgreSQL Schema
-- Database: postgres (Supabase)

-- 1. Main Records Table (Modular JSONB Storage)
CREATE TABLE IF NOT EXISTS records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Core Indexes
CREATE INDEX IF NOT EXISTS idx_records_collection ON records(collection);
CREATE INDEX IF NOT EXISTS idx_records_data ON records USING GIN (data);

-- Partial Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_marketplace_active 
ON records ((data->>'status')) 
WHERE collection = 'marketplace' AND data->>'status' = 'active';

CREATE INDEX IF NOT EXISTS idx_apps_status 
ON records ((data->>'status')) 
WHERE collection = 'apps';

CREATE INDEX IF NOT EXISTS idx_settings_key 
ON records ((data->>'key')) 
WHERE collection = 'settings';

-- 2. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_id TEXT,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_records_modtime ON records;
CREATE TRIGGER update_records_modtime
    BEFORE UPDATE ON records
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 4. Applications (SaaS Multitenancy)
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    environment TEXT DEFAULT 'Staging',
    domain TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_integrations (
    app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
    firebase_config JSONB NOT NULL,
    cached_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_app_id UNIQUE (app_id)
);

CREATE TABLE IF NOT EXISTS app_config (
    app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    features JSONB DEFAULT '{}'::jsonb,
    hero_config JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS app_rate_limits (
    app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
    rpm INTEGER DEFAULT 60,
    rph INTEGER DEFAULT 2000,
    burst_limit INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    hits INTEGER DEFAULT 1,
    latency INTEGER DEFAULT 0,
    status_code INTEGER DEFAULT 200,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    usage_json JSONB DEFAULT '{}'::jsonb,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whatsapp_config (
    app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
    phone_number TEXT,
    api_key TEXT,
    enabled BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS email_config (
    app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
    smtp_host TEXT,
    smtp_port INTEGER,
    "user" TEXT,
    pass TEXT,
    enabled BOOLEAN DEFAULT false
);

-- ============================================================
--  Migrations (idempotent - safe to run on existing databases)
-- ============================================================

-- Add cached_metrics column if missing (for older installs)
ALTER TABLE app_integrations ADD COLUMN IF NOT EXISTS cached_metrics JSONB DEFAULT '{}'::jsonb;

-- Ensure firebase_config defaults to empty JSON if missing data
ALTER TABLE app_integrations ALTER COLUMN firebase_config SET DEFAULT '{}'::jsonb;

-- Add firebase_config to apps table for quick access (optional denorm)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS firebase_project_id TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'Spark';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS current_spend NUMERIC(12,4) DEFAULT 0;

-- Index for fast lookup by app_id
CREATE INDEX IF NOT EXISTS idx_usage_logs_app_created ON usage_logs(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_status ON usage_logs(app_id, status_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_method ON usage_logs(app_id, method, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_endpoint ON usage_logs(app_id, endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_latency ON usage_logs(app_id, latency, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_app_created ON analytics_logs(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_app_status ON billing(app_id, status);

