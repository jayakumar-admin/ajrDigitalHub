-- =========================================================================
--                     AJR DIGITAL HUB - POSTGRESQL ARCHITECTURE
-- =========================================================================
-- Author: Senior Backend Engineer & PostgreSQL Expert
-- Description: Dynamic JSONB backing schemas, Relational translations, 
--              and highly-optimized enterprise SQL queries across all modules.
-- =========================================================================


-- =========================================================================
-- SETUP & SYSTEM EXTENSIONS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Strong UUID and blowfish Hashing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- Standard UUID Generation algorithms
CREATE EXTENSION IF NOT EXISTS "citext";       -- Case-insensitive string search comparison


-- =========================================================================
-- PARADIGM 1: UNIFIED DYNAMIC PRODUCTION ENGINE (ACTIVE BACKEND TARGET)
-- =========================================================================

-- Main polymorphic backing store utilizing JSONB with fully-indexed searching
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Strategic Indexes for polymorphic lookups and rapid payload querying
CREATE INDEX IF NOT EXISTS idx_records_collection ON records (collection);
CREATE INDEX IF NOT EXISTS idx_records_data_gin ON records USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records (created_at DESC);

-- Automated Timestamp Handler
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON records;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON records
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- =========================================================================
-- PARADIGM 2: FULLY-NORMALIZED ENTERPRISE RELATIONAL SCHEMA
-- =========================================================================

-- 1. USERS & IDENTITY AUTH
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. MARKETPLACE CATALOGUE 
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category VARCHAR(100) DEFAULT 'Uncategorized',
  html_content TEXT,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_status_category ON marketplace_items(status, category);
CREATE INDEX IF NOT EXISTS idx_marketplace_title_search ON marketplace_items USING gin(to_tsvector('english', title));

-- 3. APPS (PROVISION + CLOUD MANAGEMENT)
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  api_key VARCHAR(128) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'deprovisioning')),
  environment VARCHAR(30) DEFAULT 'Sandbox' CHECK (environment IN ('Production', 'Staging', 'Sandbox')),
  cpu_cores NUMERIC(4,2) DEFAULT 0.50,
  memory_mb INTEGER DEFAULT 512,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_apps_domain_status ON apps(domain, status);
CREATE INDEX IF NOT EXISTS idx_apps_api_key ON apps(api_key);

-- 4. SYSTEM-WIDE SETTINGS (KEY-VALUE WITH NESTED CONFIG JSON)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- 5. RATE LIMITS (VOLUMETRIC SLIDING WINDOW FREQUENCY CONTROLS)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key VARCHAR(255) UNIQUE NOT NULL, -- Format: IP-Address or API-Key or User-UUID
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  max_requests INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON rate_limits(rate_key, window_start);

-- 6. SYSTEM LOGS
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method VARCHAR(10) NOT NULL,
  path TEXT NOT NULL,
  status INTEGER NOT NULL,
  response_time INTEGER NOT NULL, -- Latency in milliseconds
  ip_address INET,
  user_agent TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at_status ON logs(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_logs_path ON logs(path);


-- =========================================================================
-- AUTO TIMESTAMP TRIGGERS FOR NORMALIZED SCHEMAS
-- =========================================================================
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_marketplace BEFORE UPDATE ON marketplace_items FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_apps BEFORE UPDATE ON apps FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_settings BEFORE UPDATE ON settings FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_rate_limits BEFORE UPDATE ON rate_limits FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


-- =========================================================================
-- OPTIMIZED SERVER SQL QUERY SCRIPTS [FOR SENIOR AUDITING]
-- =========================================================================

-- -------------------------------------------------------------------------
-- MODULE 1: Users (Auth)
-- -------------------------------------------------------------------------

-- Q1.1: Register New User safely
-- INSERT INTO users (email, password_hash, fullName, role, status) 
-- VALUES ('user@domain.com', '$2b$10$SaltHashGoesHere...', 'Alex Carter', 'user', 'active') 
-- ON CONFLICT (email) DO NOTHING RETURNING id, email, fullName, role;

-- Q1.2: Validate login credentials and retrieve profile
-- SELECT id, email, password_hash, fullName, role, status FROM users WHERE email = 'user@domain.com' AND status = 'active';

-- Q1.3: Update last login execution
-- UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = '8cfd7990-2ff6-42d4-a1ed-c3addefa62b6';


-- -------------------------------------------------------------------------
-- MODULE 2: Marketplace
-- -------------------------------------------------------------------------

-- Q2.1: List Paginated Active Products with full-text english weight matching, category filter, and sorting
-- SELECT id, title, description, price, category, image_url, status, created_at
-- FROM marketplace_items
-- WHERE status = 'active'
--   AND (category = 'Software' OR 'Software' IS NULL)
--   AND (to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', 'Dashboard:*'))
-- ORDER BY price DESC
-- LIMIT 12 OFFSET 0;

-- Q2.2: Retrieve individual items and count visual performance statistics
-- SELECT id, title, description, price, category, html_content FROM marketplace_items WHERE id = '22222222-2222-4222-a222-222222222222';


-- -------------------------------------------------------------------------
-- MODULE 3: Apps (Provisioning & Infrastructure Management)
-- -------------------------------------------------------------------------

-- Q3.1: Provision a dynamic new server instances record
-- INSERT INTO apps (name, domain, api_key, status, environment, cpu_cores, memory_mb)
-- VALUES ('Enterprise Core CRM', 'crm.enterprise.io', 'ajr_api_334466d77e...', 'pending', 'Production', 1.00, 1024)
-- RETURNING id, name, domain, status, created_at;

-- Q3.2: Verify route requests authorization header via key lookup
-- SELECT id, name, domain, environment, status FROM apps WHERE api_key = 'ajr_api_334466d77e...' AND status = 'active';


-- -------------------------------------------------------------------------
-- MODULE 4: Settings (Upserts)
-- -------------------------------------------------------------------------

-- Q4.1: Atomic settings update (ON CONFLICT DO UPDATE pattern)
-- INSERT INTO settings (key, value, description)
-- VALUES ('landing_config', '{"heroTitle": "AJR Dynamic Core", "cta": "Launch Now", "maintenance": false}', 'Web configurations')
-- ON CONFLICT (key) DO
-- UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = NOW()
-- RETURNING id, key, value;


-- -------------------------------------------------------------------------
-- MODULE 5: Rate Limits (Sliding Interval Check)
-- -------------------------------------------------------------------------

-- Q5.1: High-Performance sliding rate window evaluator
-- INSERT INTO rate_limits (rate_key, request_count, window_start, max_requests)
-- VALUES ('192.168.1.100_api_route', 1, CURRENT_TIMESTAMP, 60)
-- ON CONFLICT (rate_key) DO UPDATE
-- SET 
--   request_count = CASE 
--     WHEN rate_limits.window_start < NOW() - INTERVAL '1 minute' THEN 1 
--     ELSE rate_limits.request_count + 1 
--   END,
--   window_start = CASE 
--     WHEN rate_limits.window_start < NOW() - INTERVAL '1 minute' THEN CURRENT_TIMESTAMP 
--     ELSE rate_limits.window_start 
--   END,
--   updated_at = NOW()
-- RETURNING request_count, max_requests, (request_count <= max_requests) AS is_allowed;


-- -------------------------------------------------------------------------
-- MODULE 6: Logs (Request / Response Tracking Engine)
-- -------------------------------------------------------------------------

-- Q6.1: High speed ingestion logging execution
-- INSERT INTO logs (method, path, status, response_time, ip_address, user_agent, user_id)
-- VALUES ('POST', '/api/checkout', 200, 142, '192.168.1.100', 'Mozilla/5.0...', NULL);


-- -------------------------------------------------------------------------
-- MODULE 7: Analytics (Complex Aggregations, Timescale Percentiles, and Rollups)
-- -------------------------------------------------------------------------

-- Q7.1: Global summary metrics dashboard counts
-- SELECT 
--   (SELECT COUNT(*) FROM records WHERE collection = 'marketplace') as total_products,
--   (SELECT COUNT(*) FROM records WHERE collection = 'apps') as total_apps_provisioned,
--   (SELECT COUNT(*) FROM records WHERE collection = 'logs') as total_logged_activities;

-- Q7.2: Logs aggregations - Average latency & P95 / P99 latency percentiles per endpoint
-- SELECT 
--   path,
--   COUNT(*) as hits,
--   ROUND(AVG(response_time)) as avg_latency_ms,
--   PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) AS p95_latency_ms,
--   PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) AS p99_latency_ms,
--   COUNT(CASE WHEN status >= 400 THEN 1 END) as error_count
-- FROM logs
-- GROUP BY path
-- ORDER BY hits DESC
-- LIMIT 10;

-- Q7.3: Time-Series distribution bucket (Activities grouped in 1-hour ticks)
-- SELECT 
--   date_trunc('hour', created_at) AS time_bucket,
--   COUNT(*) as request_volume,
--   COUNT(CASE WHEN status >= 500 THEN 1 END) as server_failures,
--   AVG(response_time) as avg_response_time_ms
-- FROM logs
-- WHERE created_at >= NOW() - INTERVAL '24 hours'
-- GROUP BY time_bucket
-- ORDER BY time_bucket ASC;


-- =========================================================================
-- SYSTEM TEST SEEDING SEQUENCES (ACTIVE PRODUCTION DATA LOAD)
-- =========================================================================

-- Clean up any existing bootstrap seeds from unified storage
DELETE FROM records;

-- Seed Users Collection (Polymorphic JSONB Store)
INSERT INTO records (id, collection, data) VALUES (
  '11111111-1111-4111-a111-111111111111',
  'users',
  '{
    "email": "admin@ajr.com",
    "password": "$2b$10$YourHashedPasswordPlaceholder",
    "role": "admin",
    "fullName": "System Administrator",
    "status": "active"
  }'::jsonb
);

-- Seed Marketplace Collection (Polymorphic JSONB Store)
INSERT INTO records (id, collection, data) VALUES (
  '22222222-2222-4222-a222-222222222222',
  'marketplace',
  '{
    "title": "Premium SaaS Dashboard Template",
    "description": "Enterprise grade dashboard containing clean navigation, pre-configured chart utilities, and dense metrics grids.",
    "price": 149.99,
    "category": "Software",
    "html": "<div class=\"p-12 bg-slate-900 rounded-3xl text-white\"><h1>Master Admin</h1></div>",
    "status": "active",
    "image": "https://picsum.photos/seed/dashboard/800/600"
  }'::jsonb
), (
  '22222222-2222-4222-a222-222222222223',
  'marketplace',
  '{
    "title": "E-Commerce Retail Toolkit",
    "description": "Sleek frontend e-commerce system optimized for digital sales, complete with cart logic and checkout portals.",
    "price": 89.00,
    "category": "E-Commerce",
    "html": "<div class=\"p-12 bg-white rounded-3xl text-slate-900\"><h1>Digital Checkout</h1></div>",
    "status": "active",
    "image": "https://picsum.photos/seed/shop/800/600"
  }'::jsonb
);

-- Seed Apps Collection (Polymorphic JSONB Store)
INSERT INTO records (id, collection, data) VALUES (
  '33333333-3333-4333-a333-333333333333',
  'apps',
  '{
    "name": "AJR Logistics Hub",
    "domain": "logistics.ajr.digital",
    "apiKey": "ajr_sec_991002key",
    "status": "active",
    "environment": "Production",
    "cpu_cores": 1.00,
    "memory_mb": 1024
  }'::jsonb
), (
  '33333333-3333-4333-a333-333333333334',
  'apps',
  '{
    "name": "Beta Workspace CRM",
    "domain": "beta-crm.ajr.internal",
    "apiKey": "ajr_sec_884422sandbox",
    "status": "pending",
    "environment": "Sandbox",
    "cpu_cores": 0.50,
    "memory_mb": 512
  }'::jsonb
);

-- Seed Settings Collection (Polymorphic JSONB Store)
INSERT INTO records (id, collection, data) VALUES (
  '44444444-4444-4444-a444-444444444444',
  'settings',
  '{
    "key": "landing_config",
    "heroTitle": "The Smart Platform for Digital Products",
    "cta": "Get Started Instantly",
    "maintenance": false
  }'::jsonb
), (
  '44444444-4444-4444-a444-444444444445',
  'settings',
  '{
    "key": "company_profile_primary",
    "company_name": "AJR DIGITAL HUB",
    "company_address": "123 Design Blvd, Suite 400\nSan Francisco, CA 94107\nhello@ajrdigital.hub",
    "tax_rate": 8.25
  }'::jsonb
);

-- Seed Rate Limits Collection (Polymorphic JSONB Store)
INSERT INTO records (id, collection, data) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'rate_limits',
  '{
    "rate_key": "127.0.0.1_global_limit",
    "request_count": 12,
    "window_start": "2026-06-16T12:00:00Z",
    "max_requests": 100
  }'::jsonb
);

-- Seed Menus Collection
INSERT INTO records (id, collection, data) VALUES (
  '55555555-5555-4555-a555-555555555551',
  'menus',
  '{
    "id": "menu_marketplace",
    "label": "Marketplace",
    "link": "/marketplace",
    "is_active": true,
    "parent_id": null
  }'::jsonb
), (
  '55555555-5555-4555-a555-555555555552',
  'menus',
  '{
    "id": "menu_solutions",
    "label": "Solutions",
    "link": "#",
    "is_active": true,
    "parent_id": null
  }'::jsonb
), (
  '55555555-5555-4555-a555-555555555553',
  'menus',
  '{
    "label": "SaaS Development",
    "link": "/services/saas",
    "is_active": true,
    "parent_id": "menu_solutions"
  }'::jsonb
), (
  '55555555-5555-4555-a555-555555555554',
  'menus',
  '{
    "label": "WhatsApp Automation",
    "link": "/services/whatsapp",
    "is_active": true,
    "parent_id": "menu_solutions"
  }'::jsonb
), (
  '55555555-5555-4555-a555-555555555555',
  'menus',
  '{
    "label": "Analytics Systems",
    "link": "/services/analytics",
    "is_active": true,
    "parent_id": "menu_solutions"
  }'::jsonb
), (
  '55555555-5555-4555-a555-555555555556',
  'menus',
  '{
    "label": "Invoice Systems",
    "link": "/invoice-builder",
    "is_active": true,
    "parent_id": "menu_solutions"
  }'::jsonb
);

-- Seed Logs Collection (Polymorphic JSONB Store)
INSERT INTO records (id, collection, data) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
  'logs',
  '{
    "method": "GET",
    "path": "/api/marketplace",
    "status": 200,
    "response_time": 45,
    "ip_address": "82.83.84.85",
    "user_agent": "Mozilla/5.0 Chrome..."
  }'::jsonb
), (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
  'logs',
  '{
    "method": "POST",
    "path": "/api/admin/apps",
    "status": 201,
    "response_time": 182,
    "ip_address": "82.83.84.85",
    "user_agent": "Mozilla/5.0 Chrome..."
  }'::jsonb
), (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
  'logs',
  '{
    "method": "PUT",
    "path": "/api/shops/demo-shop-1/invoice-config",
    "status": 200,
    "response_time": 68,
    "ip_address": "90.91.92.93",
    "user_agent": "Mozilla/5.0 Safari..."
  }'::jsonb
);

-- Seed Testimonials Collection
INSERT INTO records (id, collection, data) VALUES (
  '66666666-6666-4666-a666-666666666661',
  'testimonials',
  '{
    "name": "Marcus Aurelius",
    "role": "CEO, Roman Tech",
    "comment": "The Master Dashboard is simply the best in class. Unbelievable response times and design purity.",
    "rating": 5,
    "avatar": "M"
  }'::jsonb
), (
  '66666666-6666-4666-a666-666666666662',
  'testimonials',
  '{
    "name": "Julia Roberts",
    "role": "DevOps Lead",
    "comment": "Scaling our server modules across 5 global hubs was zero-config and painless.",
    "rating": 5,
    "avatar": "J"
  }'::jsonb
);
