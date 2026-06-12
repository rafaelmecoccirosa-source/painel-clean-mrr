-- Migration: regras de negócio do modelo MRR
-- Criada em: 2026-06-12
-- Execute manualmente no Supabase SQL Editor (bloco inteiro).
--
-- Inclui:
--   1. invoices — faturas (mensalidade, taxa de adesão, saldo de cancelamento)
--   2. subscriptions — desconto de indicação + campos de cancelamento
--   3. profiles.referral_code — código de indicação rastreável (/ref/CODIGO)
--   4. Fix RLS admin UPDATE em profiles (subquery → auth.jwt, evita 42P17)
--   5. service_reports — aceita condição 'excelente' (UI já enviava e o banco rejeitava)
--   6. Storage bucket service-photos — upload real de fotos antes/depois

-- ── 1. invoices ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id  UUID REFERENCES subscriptions(id),
  client_id        UUID REFERENCES auth.users(id) NOT NULL,
  type             VARCHAR(20) NOT NULL DEFAULT 'mensalidade'
    CHECK (type IN ('mensalidade', 'adesao', 'cancelamento')),
  amount           DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  period_month     INTEGER CHECK (period_month BETWEEN 1 AND 12),
  period_year      INTEGER,
  due_date         DATE NOT NULL,
  status           VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'awaiting_confirmation', 'paid', 'cancelled')),
  paid_at          TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Cliente lê as próprias faturas; escrita só via service role / admin
DROP POLICY IF EXISTS "client_view_own_invoices" ON invoices;
CREATE POLICY "client_view_own_invoices" ON invoices
  FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "admin_full_access_invoices" ON invoices;
CREATE POLICY "admin_full_access_invoices" ON invoices
  FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS idx_invoices_client       ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status       ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);

-- ── 2. subscriptions — desconto + cancelamento ───────────────────────────────

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_pct     DECIMAL(5,2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_at     TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS contract_months  INTEGER DEFAULT 12;

-- ── 3. profiles.referral_code ─────────────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

UPDATE profiles
  SET referral_code = UPPER(LEFT(user_id::text, 8))
  WHERE referral_code IS NULL AND user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON profiles(referral_code)
  WHERE referral_code IS NOT NULL;

-- Novos perfis ganham código automaticamente
CREATE OR REPLACE FUNCTION set_referral_code() RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.referral_code := UPPER(LEFT(NEW.user_id::text, 8));
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_referral_code ON profiles;
CREATE TRIGGER trg_profiles_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- ── 4. Fix RLS admin UPDATE em profiles (sem subquery recursiva) ─────────────

DROP POLICY IF EXISTS "admin_update_any_profile" ON profiles;
CREATE POLICY "admin_update_any_profile" ON profiles
  FOR UPDATE
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ── 5. service_reports — condição 'excelente' ────────────────────────────────

ALTER TABLE service_reports DROP CONSTRAINT IF EXISTS service_reports_general_condition_check;
ALTER TABLE service_reports ADD CONSTRAINT service_reports_general_condition_check
  CHECK (general_condition IN ('excelente', 'bom', 'regular', 'necessita_atencao'));

-- ── 6. Storage bucket para fotos de serviço ──────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('service-photos', 'service-photos', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "authenticated_upload_service_photos" ON storage.objects;
CREATE POLICY "authenticated_upload_service_photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "public_read_service_photos" ON storage.objects;
CREATE POLICY "public_read_service_photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-photos');

NOTIFY pgrst, 'reload schema';
