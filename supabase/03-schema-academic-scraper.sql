-- ============================================================
-- MODUS — EXPANSÃO DO SCHEMA PARA SCRAPER ACADÊMICO
-- ============================================================
-- Atualiza a tabela academic_tasks existente e adiciona
-- as colunas necessárias para sincronização com o AVA Moodle.
-- ============================================================

-- 1. ADICIONAR COLUNAS EM academic_tasks
ALTER TABLE academic_tasks
  ADD COLUMN IF NOT EXISTS id_moodle VARCHAR(100),
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS course VARCHAR(150),
  ADD COLUMN IF NOT EXISTS course_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS task_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS task_subtype VARCHAR(50),
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS has_no_deadline BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS priority_score NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ava_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS submission_link VARCHAR(500),
  ADD COLUMN IF NOT EXISTS peer_review_total INT,
  ADD COLUMN IF NOT EXISTS peer_review_done INT,
  ADD COLUMN IF NOT EXISTS exam_location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS exam_period_start DATE,
  ADD COLUMN IF NOT EXISTS exam_period_end DATE,
  ADD COLUMN IF NOT EXISTS week_number INT,
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS moodle_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS last_change_detected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS raw_scraped_data JSONB;

-- Garante constraint UNIQUE para id_moodle (necessária para upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'academic_tasks_id_moodle_key'
  ) THEN
    ALTER TABLE academic_tasks ADD CONSTRAINT academic_tasks_id_moodle_key UNIQUE (id_moodle);
  END IF;
END $$;

-- 2. FLEXIBILIZAR CONSTRAINTS EXISTENTES DE STATUS E PRIORIDADE
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'academic_tasks'::regclass
      AND contype = 'c'
      AND (conname LIKE '%status%' OR conname LIKE '%priority%')
  ) LOOP
    EXECUTE 'ALTER TABLE academic_tasks DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE academic_tasks ADD CONSTRAINT academic_tasks_priority_check 
  CHECK (priority IN ('P1', 'P2', 'P3', 'P4', 'P1_critical', 'P2_high', 'P3_normal', 'P4_low'));

ALTER TABLE academic_tasks ADD CONSTRAINT academic_tasks_status_check 
  CHECK (status IN ('pending', 'in_progress', 'submitted', 'completed', 'overdue', 'cancelled', 'aberto', 'concluido'));


-- 3. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_academic_tasks_id_moodle ON academic_tasks(id_moodle);
CREATE INDEX IF NOT EXISTS idx_academic_tasks_due ON academic_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_academic_tasks_course ON academic_tasks(course_code);
CREATE INDEX IF NOT EXISTS idx_academic_tasks_subtype ON academic_tasks(task_subtype);

-- 4. TABELA DE CONTROLE DE SINCRONIZAÇÃO
CREATE TABLE IF NOT EXISTS academic_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  last_morning_sync TIMESTAMP WITH TIME ZONE,
  last_evening_sync TIMESTAMP WITH TIME ZONE,
  last_morning_payload JSONB,
  last_login_success BOOLEAN,
  last_error TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE academic_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_sync_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_academic_tasks" ON academic_tasks;
CREATE POLICY "allow_all_academic_tasks" ON academic_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_sync_state" ON academic_sync_state;
CREATE POLICY "allow_all_sync_state" ON academic_sync_state FOR ALL USING (true) WITH CHECK (true);

-- 5. VIEW CLASSIFICADA
CREATE OR REPLACE VIEW academic_tasks_classified AS
SELECT
  at.*,
  CASE
    WHEN at.status IN ('completed', 'concluido', 'cancelled') THEN 'P4_low'
    WHEN at.due_date IS NOT NULL AND at.due_date - NOW() <= INTERVAL '24 hours' THEN 'P1_critical'
    WHEN at.task_subtype = 'exam' AND at.due_date IS NOT NULL AND at.due_date - NOW() <= INTERVAL '48 hours' THEN 'P1_critical'
    WHEN at.due_date IS NOT NULL AND at.due_date - NOW() <= INTERVAL '72 hours' THEN 'P2_high'
    WHEN at.task_subtype = 'exam' AND at.due_date IS NOT NULL AND at.due_date - NOW() <= INTERVAL '7 days' THEN 'P2_high'
    WHEN at.due_date IS NOT NULL AND at.due_date - NOW() <= INTERVAL '14 days' THEN 'P3_normal'
    ELSE 'P4_low'
  END AS computed_priority,
  CASE
    WHEN at.due_date IS NOT NULL THEN EXTRACT(EPOCH FROM (at.due_date - NOW())) / 3600
    ELSE NULL
  END AS hours_remaining
FROM academic_tasks at
WHERE at.status NOT IN ('cancelled');
