# 🏗️ ARQUITETURA COMPLETA - HUB ACADÊMICO + FINANCEIRO

## 📋 VISÃO GERAL DO PROJETO

### Módulos Principais
```
HUB (App/Web)
├── 📚 ACADÊMICO
│   ├── Tarefas Acadêmicas (Antigravity + Moodle)
│   ├── Agenda Acadêmica
│   ├── Leitura de Livros
│   └── Disciplinas
│
├── 💰 FINANCEIRO
│   ├── Transações (Gmail + Manual)
│   ├── Orçamento
│   ├── Análises
│   └── Metas de Poupança
│
├── 🏠 DOMÉSTICO
│   ├── Tarefas Domésticas
│   ├── Lista de Compras (integrada com Mercado)
│   └── Agenda Doméstica
│
├── 📅 AGENDA UNIFICADA
│   ├── Acadêmica
│   ├── Doméstica
│   ├── Financeira
│   └── Lembretes
│
└── 🔔 LEMBRETES & NOTIFICAÇÕES
    ├── Push notifications
    ├── Email
    └── WhatsApp (opcional)
```

---

## 🗄️ SCHEMA SUPABASE COMPLETO

```sql
-- ==========================================
-- AUTENTICAÇÃO (Supabase padrão)
-- ==========================================
-- auth.users (fornecido pelo Supabase)

-- ==========================================
-- TABELAS CORE
-- ==========================================

-- Usuários (estendendo auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(10) DEFAULT 'pt-BR',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lembretes Globais
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_date TIMESTAMP NOT NULL,
  reminder_time TIME,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, completed, dismissed
  category VARCHAR(50), -- academic, financial, household, custom
  notify_via TEXT[] DEFAULT '{}', -- email, push, whatsapp
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_date (user_id, reminder_date)
);

-- Agenda Unificada
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type VARCHAR(50), -- academic, financial, household, custom
  category VARCHAR(100),
  color VARCHAR(7) DEFAULT '#1C64EF',
  location VARCHAR(255),
  recurring VARCHAR(50), -- none, daily, weekly, monthly, yearly
  recurring_until DATE,
  notifications JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_date (user_id, event_date)
);

-- ==========================================
-- MÓDULO ACADÊMICO
-- ==========================================

-- Tarefas Acadêmicas (sincronizado com Antigravity)
CREATE TABLE academic_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_moodle VARCHAR(50) UNIQUE, -- ID do Moodle para deduplicação
  
  -- Conteúdo
  title VARCHAR(255) NOT NULL,
  description TEXT,
  summary VARCHAR(200),
  
  -- Contextualização
  course VARCHAR(100) NOT NULL,
  course_code VARCHAR(20),
  professor VARCHAR(100),
  
  -- Classificação
  task_type VARCHAR(50), -- assignment, quiz, forum, reading, presentation, exercise, other
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, overdue, cancelled
  
  -- Prazos
  created_at_moodle TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP,
  days_remaining INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (due_date::date - CURRENT_DATE))
  ) STORED,
  
  -- Priorização
  priority VARCHAR(20), -- P1_critical, P2_high, P3_normal, P4_low
  priority_score INT, -- 0-300
  
  -- Estimativas
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  
  -- Estrutura
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  dependencies UUID[] DEFAULT '{}',
  notes TEXT,
  
  -- Links
  submission_link VARCHAR(500),
  
  -- Sync
  synced_at TIMESTAMP,
  moodle_status VARCHAR(50), -- open, closed, submitted
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- Auditoria
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_course (user_id, course),
  INDEX idx_due_date (user_id, due_date),
  INDEX idx_priority (user_id, priority)
);

-- Disciplinas
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  professor VARCHAR(100),
  schedule VARCHAR(255),
  credits INT,
  color VARCHAR(7) DEFAULT '#1C64EF',
  description TEXT,
  semester INT,
  year INT,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, dropped
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_status (user_id, status)
);

-- Leitura de Livros
CREATE TABLE book_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  total_pages INT,
  current_page INT DEFAULT 0,
  progress DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_pages > 0 THEN (current_page::float / total_pages::float * 100) ELSE 0 END
  ) STORED,
  status VARCHAR(50) DEFAULT 'reading', -- not_started, reading, completed, abandoned
  start_date DATE,
  end_date DATE,
  isbn VARCHAR(20),
  cover_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_status (user_id, status)
);

-- Agenda Acadêmica (Classes)
CREATE TABLE academic_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week INT, -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  professor VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- MÓDULO FINANCEIRO
-- ==========================================

-- Transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_message_id VARCHAR(255), -- Para rastreamento de emails
  
  -- Conteúdo
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Tipo
  transaction_type VARCHAR(50), -- income, expense, transfer, saving
  category VARCHAR(100),
  subcategory VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, cancelled
  payment_method VARCHAR(100), -- card, cash, transfer, pix, etc
  
  -- Datas
  transaction_date DATE NOT NULL,
  transaction_time TIME,
  due_date DATE, -- para expenses pendentes
  paid_date DATE,
  
  -- Recorrência
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_type VARCHAR(50), -- daily, weekly, monthly, yearly, custom
  recurring_until DATE,
  
  -- Attachments (recibos)
  receipts JSONB DEFAULT '[]', -- [{ url, type, date }]
  notes TEXT,
  
  -- Tags para análise
  tags TEXT[] DEFAULT '{}',
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_date (user_id, transaction_date),
  INDEX idx_type (user_id, transaction_type),
  INDEX idx_gmail (gmail_message_id)
);

-- Orçamento (Budget)
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(50) DEFAULT 'monthly', -- monthly, yearly, custom
  start_date DATE,
  end_date DATE,
  alert_percentage INT DEFAULT 80, -- alertar quando atingir 80%
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

-- Metas de Poupança
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  progress DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN target_amount > 0 THEN (current_amount / target_amount * 100) ELSE 0 END
  ) STORED,
  deadline DATE,
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
  color VARCHAR(7) DEFAULT '#2ECC71',
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_status (user_id, status)
);

-- ==========================================
-- MÓDULO DOMÉSTICO
-- ==========================================

-- Tarefas Domésticas
CREATE TABLE household_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- cleaning, shopping, maintenance, cooking, etc
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  due_date DATE,
  due_time TIME,
  assigned_to UUID REFERENCES users(id), -- para tarefas compartilhadas
  recurrence VARCHAR(50), -- none, daily, weekly, monthly
  recurrence_until DATE,
  estimated_time_minutes INT,
  actual_time_minutes INT,
  reminder_days_before INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_status (user_id, status),
  INDEX idx_due_date (user_id, due_date)
);

-- Lista de Compras (Shopping List)
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  list_type VARCHAR(50), -- grocery, household, other
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_user_status (user_id, status)
);

-- Itens da Lista de Compras
CREATE TABLE shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(50), -- kg, l, un, box, etc
  estimated_price DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),
  category VARCHAR(100), -- vegetables, fruits, proteins, dairy, etc
  status VARCHAR(50) DEFAULT 'pending', -- pending, purchased, cancelled
  store VARCHAR(255), -- supermercado, mercadão, etc
  store_url VARCHAR(500), -- link pra produto no site
  barcode VARCHAR(50),
  notes TEXT,
  purchased_at TIMESTAMP,
  INDEX idx_list_status (shopping_list_id, status)
);

-- Integração com Mercado (marketplace)
CREATE TABLE market_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255), -- "Supermercado X", "Carrefour", etc
  store_url VARCHAR(500),
  api_key VARCHAR(500), -- encrypted
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP,
  product_database JSONB DEFAULT '[]', -- cache de produtos
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- SINCRONIZAÇÃO & WEBHOOKS
-- ==========================================

-- Log de Sincronização
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(50), -- moodle, gmail, manual, etc
  module VARCHAR(50), -- academic, financial, household
  sync_type VARCHAR(50), -- full, incremental, update
  status VARCHAR(50), -- success, partial, error
  items_processed INT,
  items_created INT,
  items_updated INT,
  items_deleted INT,
  error_message TEXT,
  sync_date TIMESTAMP DEFAULT NOW(),
  duration_seconds INT,
  INDEX idx_user_date (user_id, sync_date)
);

-- Webhooks (para Antigravity, Gmail, etc)
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  webhook_type VARCHAR(50), -- antigravity_sync, gmail_fetch, market_update
  endpoint_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- NOTIFICAÇÕES & HISTÓRICO
-- ==========================================

-- Histórico de Notificações
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50), -- task_due, budget_alert, reminder, etc
  title VARCHAR(255),
  message TEXT,
  related_to VARCHAR(50), -- academic_task, transaction, household_task, reminder
  related_id UUID,
  channels TEXT[] DEFAULT '{}', -- email, push, whatsapp
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  INDEX idx_user_read (user_id, read_at)
);

-- Preferências de Notificação
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50),
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES ÚTEIS
-- ==========================================

CREATE INDEX idx_reminders_pending ON reminders(user_id, status) WHERE status = 'pending';
CREATE INDEX idx_tasks_due_soon ON academic_tasks(user_id, due_date) WHERE status != 'completed';
CREATE INDEX idx_transactions_current_month ON transactions(user_id, transaction_date) WHERE EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM NOW()) AND EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM NOW());
CREATE INDEX idx_household_tasks_active ON household_tasks(user_id, status) WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_calendar_events_upcoming ON calendar_events(user_id, event_date) WHERE event_date >= CURRENT_DATE;

-- ==========================================
-- VIEWS ÚTEIS
-- ==========================================

-- Dashboard Overview
CREATE VIEW dashboard_overview AS
SELECT 
  u.id,
  u.email,
  -- Acadêmico
  (SELECT COUNT(*) FROM academic_tasks WHERE user_id = u.id AND status != 'completed') as pending_tasks,
  (SELECT COUNT(*) FROM academic_tasks WHERE user_id = u.id AND days_remaining <= 2 AND status != 'completed') as urgent_tasks,
  (SELECT COUNT(*) FROM academic_tasks WHERE user_id = u.id AND days_remaining < 0 AND status != 'completed') as overdue_tasks,
  -- Financeiro
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = u.id AND transaction_type = 'income' AND transaction_date >= DATE_TRUNC('month', NOW())) as monthly_income,
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = u.id AND transaction_type = 'expense' AND transaction_date >= DATE_TRUNC('month', NOW())) as monthly_expenses,
  -- Doméstico
  (SELECT COUNT(*) FROM household_tasks WHERE user_id = u.id AND status = 'pending') as pending_household_tasks,
  (SELECT COUNT(*) FROM shopping_items WHERE shopping_list_id IN (SELECT id FROM shopping_lists WHERE user_id = u.id AND status = 'active') AND status = 'pending') as pending_shopping_items
FROM users u;

-- Próximas Tarefas (Academic + Household + Reminders)
CREATE VIEW upcoming_tasks AS
SELECT 
  'academic_task' as source,
  id,
  title,
  due_date::date as date,
  due_date::time,
  priority,
  user_id
FROM academic_tasks
WHERE status IN ('pending', 'in_progress') AND due_date >= NOW()
UNION ALL
SELECT 
  'household_task',
  id,
  title,
  due_date,
  due_time,
  priority,
  user_id
FROM household_tasks
WHERE status IN ('pending', 'in_progress') AND due_date >= CURRENT_DATE
UNION ALL
SELECT 
  'reminder',
  id,
  title,
  reminder_date::date,
  reminder_time,
  'normal',
  user_id
FROM reminders
WHERE status = 'pending' AND reminder_date >= NOW()
ORDER BY date ASC, "time" ASC;
