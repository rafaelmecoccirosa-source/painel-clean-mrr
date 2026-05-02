-- Migration: corrigir recursão infinita em admin_read_all_profiles
-- Criada em: 2026-04-30
--
-- Problema: a policy original fazia EXISTS (SELECT 1 FROM profiles ...)
-- dentro da própria SELECT policy de profiles → 42P17 (recursão infinita).
-- Isso quebrava todas as leituras client-side em profiles via createClient().
--
-- Fix: usar auth.jwt() -> 'user_metadata' ->> 'role' em vez de subquery.
-- Conforme orientação do CLAUDE.md: "Admin: usar auth.jwt() -> 'user_metadata'
-- ->> 'role' — nunca subquery em profiles (erro 42P17)".
--
-- Executar no Supabase SQL Editor.

-- 1. Dropar policy recursiva atual
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;

-- 2. Recriar sem subquery em profiles (usa JWT em vez de subquery)
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR auth.uid() = user_id
  );

NOTIFY pgrst, 'reload schema';
