-- C&E Reporting Platform - Database Schema
-- PostgreSQL 17
-- This script initializes all necessary tables for the healthcare dashboard

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (for future authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'user', 'viewer'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- 2. DASHBOARD_CONFIGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL DEFAULT 'Healthcare Client',
  plan_year VARCHAR(10) NOT NULL DEFAULT '2024',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_loss_ratio DECIMAL(5, 4) DEFAULT 0.8500,
  currency VARCHAR(3) DEFAULT 'USD',
  date_format VARCHAR(50) DEFAULT 'YYYY-MM',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dashboard_configs_user ON dashboard_configs(user_id);
CREATE INDEX idx_dashboard_configs_active ON dashboard_configs(is_active);

-- =====================================================
-- 3. EXPERIENCE_DATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS experience_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  domestic_medical_ip DECIMAL(12, 2) DEFAULT 0,
  domestic_medical_op DECIMAL(12, 2) DEFAULT 0,
  non_domestic_medical DECIMAL(12, 2) DEFAULT 0,
  prescription_drugs DECIMAL(12, 2) DEFAULT 0,
  dental DECIMAL(12, 2) DEFAULT 0,
  vision DECIMAL(12, 2) DEFAULT 0,
  mental_health DECIMAL(12, 2) DEFAULT 0,
  preventive_care DECIMAL(12, 2) DEFAULT 0,
  emergency_room DECIMAL(12, 2) DEFAULT 0,
  urgent_care DECIMAL(12, 2) DEFAULT 0,
  specialty_care DECIMAL(12, 2) DEFAULT 0,
  lab_diagnostic DECIMAL(12, 2) DEFAULT 0,
  physical_therapy DECIMAL(12, 2) DEFAULT 0,
  dme DECIMAL(12, 2) DEFAULT 0, -- Durable Medical Equipment
  home_health DECIMAL(12, 2) DEFAULT 0,
  enrollment INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE INDEX idx_experience_data_user ON experience_data(user_id);
CREATE INDEX idx_experience_data_month ON experience_data(month);
CREATE INDEX idx_experience_data_user_month ON experience_data(user_id, month);

-- =====================================================
-- 4. HIGH_COST_CLAIMANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS high_cost_claimants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  member_id VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
  primary_diagnosis_code VARCHAR(20) NOT NULL,
  primary_diagnosis_description TEXT NOT NULL,
  total_paid_amount DECIMAL(12, 2) NOT NULL,
  claim_count INTEGER NOT NULL,
  enrollment_months INTEGER NOT NULL,
  risk_score DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_high_cost_claimants_user ON high_cost_claimants(user_id);
CREATE INDEX idx_high_cost_claimants_member ON high_cost_claimants(member_id);
CREATE INDEX idx_high_cost_claimants_total ON high_cost_claimants(total_paid_amount DESC);
CREATE INDEX idx_high_cost_claimants_diagnosis ON high_cost_claimants(primary_diagnosis_code);

-- =====================================================
-- 5. FEE_STRUCTURES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('flat', 'pepm', 'pmpm', 'tiered', 'annual', 'manual')),
  amount DECIMAL(12, 2) NOT NULL,
  enrollment INTEGER,
  calculated_total DECIMAL(12, 2) NOT NULL,
  effective_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structures_user ON fee_structures(user_id);
CREATE INDEX idx_fee_structures_month ON fee_structures(month);
CREATE INDEX idx_fee_structures_type ON fee_structures(fee_type);
CREATE INDEX idx_fee_structures_effective ON fee_structures(effective_date);

-- =====================================================
-- 6. FEE_STRUCTURES_V2 TABLE (Enhanced version)
-- =====================================================
CREATE TABLE IF NOT EXISTS fee_structures_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('flat', 'pepm', 'pmpm', 'tiered', 'annual', 'percentage')),
  base_amount DECIMAL(12, 2),
  percentage DECIMAL(5, 4),
  tiers JSONB, -- For tiered pricing structure
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structures_v2_user ON fee_structures_v2(user_id);
CREATE INDEX idx_fee_structures_v2_type ON fee_structures_v2(fee_type);
CREATE INDEX idx_fee_structures_v2_active ON fee_structures_v2(is_active);
CREATE INDEX idx_fee_structures_v2_dates ON fee_structures_v2(effective_start_date, effective_end_date);

-- =====================================================
-- 7. MONTHLY_SUMMARIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS monthly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  claims DECIMAL(12, 2) NOT NULL,
  fees DECIMAL(12, 2) NOT NULL,
  premiums DECIMAL(12, 2) NOT NULL,
  total_cost DECIMAL(12, 2) NOT NULL, -- claims + fees
  monthly_loss_ratio DECIMAL(5, 4) NOT NULL, -- (claims + fees) / premiums
  rolling_12_loss_ratio DECIMAL(5, 4),
  variance DECIMAL(6, 4), -- percentage variance from target
  member_months INTEGER NOT NULL,
  pmpm DECIMAL(10, 2) NOT NULL, -- per member per month
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE INDEX idx_monthly_summaries_user ON monthly_summaries(user_id);
CREATE INDEX idx_monthly_summaries_month ON monthly_summaries(month);
CREATE INDEX idx_monthly_summaries_user_month ON monthly_summaries(user_id, month);
CREATE INDEX idx_monthly_summaries_loss_ratio ON monthly_summaries(monthly_loss_ratio);

-- =====================================================
-- 8. FILE_UPLOADS TABLE (Track upload history)
-- =====================================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'experience_data', 'high_cost_claimants'
  file_size INTEGER NOT NULL, -- in bytes
  row_count INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'completed', 'failed', 'processing'
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_file_uploads_user ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_type ON file_uploads(file_type);
CREATE INDEX idx_file_uploads_status ON file_uploads(status);
CREATE INDEX idx_file_uploads_created ON file_uploads(created_at DESC);

-- =====================================================
-- 9. AUDIT_LOG TABLE (Track all data changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'EXPORT'
  entity_type VARCHAR(50) NOT NULL, -- 'experience_data', 'fee_structure', etc.
  entity_id UUID,
  changes JSONB, -- Store the actual changes
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- =====================================================
-- 10. CALCULATED_METRICS TABLE (Cache for expensive calculations)
-- =====================================================
CREATE TABLE IF NOT EXISTS calculated_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'kpis', 'trend_data', 'category_breakdown'
  time_period VARCHAR(7), -- YYYY-MM for monthly metrics
  data JSONB NOT NULL, -- Store calculated results
  calculated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(user_id, metric_type, time_period)
);

CREATE INDEX idx_calculated_metrics_user ON calculated_metrics(user_id);
CREATE INDEX idx_calculated_metrics_type ON calculated_metrics(metric_type);
CREATE INDEX idx_calculated_metrics_expires ON calculated_metrics(expires_at);

-- =====================================================
-- TRIGGERS for auto-updating 'updated_at' timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_configs_updated_at BEFORE UPDATE ON dashboard_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_data_updated_at BEFORE UPDATE ON experience_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_high_cost_claimants_updated_at BEFORE UPDATE ON high_cost_claimants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_structures_v2_updated_at BEFORE UPDATE ON fee_structures_v2 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_summaries_updated_at BEFORE UPDATE ON monthly_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS for common queries
-- =====================================================

-- View for latest monthly summary per user
CREATE OR REPLACE VIEW latest_monthly_summaries AS
SELECT DISTINCT ON (user_id) *
FROM monthly_summaries
ORDER BY user_id, month DESC;

-- View for total experience data by month
CREATE OR REPLACE VIEW experience_data_totals AS
SELECT
  user_id,
  month,
  (domestic_medical_ip + domestic_medical_op + non_domestic_medical +
   prescription_drugs + dental + vision + mental_health + preventive_care +
   emergency_room + urgent_care + specialty_care + lab_diagnostic +
   physical_therapy + dme + home_health) AS total_claims,
  enrollment,
  created_at
FROM experience_data;

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert a default user for testing (can be removed in production)
INSERT INTO users (id, email, name, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert default dashboard config
INSERT INTO dashboard_configs (user_id, client_name, plan_year, start_date, end_date, target_loss_ratio)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Healthcare Client', '2024', '2024-01-01', '2024-12-31', 0.85)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PERMISSIONS (Optional - adjust based on your needs)
-- =====================================================

-- Grant permissions to the database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Database schema initialized successfully!';
  RAISE NOTICE 'Tables created: 10';
  RAISE NOTICE 'Indexes created: 30+';
  RAISE NOTICE 'Triggers created: 7';
  RAISE NOTICE 'Views created: 2';
END $$;
