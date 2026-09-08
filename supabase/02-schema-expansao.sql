-- ============================================================
-- dailyS — EXPANSÃO DO SCHEMA
-- Adiciona: Investimentos, Cartões, Metas, Projeções,
-- Integração Pluggy (Open Finance), Área Pessoal,
-- Progresso Acadêmico (sem Antigravity), Resumos de Email
-- ============================================================
-- Rodar DEPOIS do supabase-schema-completo.sql
-- ============================================================


-- ============================================================
-- 1. INTEGRAÇÃO PLUGGY / OPEN FINANCE
-- ============================================================

-- Conexões bancárias (Items do Pluggy)
CREATE TABLE pluggy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pluggy_item_id VARCHAR(255) UNIQUE NOT NULL,  -- ID do Item no Pluggy
  connector_id INT,                              -- ID do banco/instituição
  institution_name VARCHAR(255),                 -- "Nubank", "Itaú", etc
  institution_type VARCHAR(50),                  -- PERSONAL_BANK, INVESTMENT, etc
  status VARCHAR(50) DEFAULT 'UPDATING',         -- UPDATING, UPDATED, LOGIN_ERROR, OUTDATED
  execution_status VARCHAR(50),
  last_updated_at TIMESTAMP,
  last_sync_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_pluggy_conn_user ON pluggy_connections(user_id, status);

-- Contas bancárias (Accounts do Pluggy)
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES pluggy_connections(id) ON DELETE CASCADE,
  pluggy_account_id VARCHAR(255) UNIQUE,
  account_type VARCHAR(50),      -- BANK, CREDIT
  account_subtype VARCHAR(50),   -- CHECKING_ACCOUNT, SAVINGS_ACCOUNT, CREDIT_CARD
  name VARCHAR(255),
  marketing_name VARCHAR(255),
  number VARCHAR(50),
  balance DECIMAL(14, 2),
  currency VARCHAR(3) DEFAULT 'BRL',
  is_manual BOOLEAN DEFAULT FALSE,  -- conta cadastrada manualmente (sem Pluggy)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);


-- ============================================================
-- 2. CARTÕES DE CRÉDITO + LIMITES
-- ============================================================

CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  pluggy_account_id VARCHAR(255),

  -- Identificação (NUNCA armazenar número completo — só últimos 4)
  name VARCHAR(255) NOT NULL,          -- "Nubank Roxinho", "Itaú Click"
  brand VARCHAR(50),                   -- VISA, MASTERCARD, ELO
  last_four_digits VARCHAR(4),         -- só os 4 últimos
  level VARCHAR(50),                   -- GOLD, PLATINUM, BLACK

  -- Limites
  credit_limit DECIMAL(14, 2),         -- limite total
  available_limit DECIMAL(14, 2),      -- limite disponível
  used_limit DECIMAL(14, 2) GENERATED ALWAYS AS (
    COALESCE(credit_limit, 0) - COALESCE(available_limit, 0)
  ) STORED,
  usage_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN credit_limit > 0
      THEN ((COALESCE(credit_limit,0) - COALESCE(available_limit,0)) / credit_limit * 100)
      ELSE 0 END
  ) STORED,

  -- Fatura
  current_bill_amount DECIMAL(14, 2),
  bill_due_day INT,                    -- dia de vencimento (1-31)
  bill_closing_day INT,                -- dia de fechamento
  minimum_payment DECIMAL(14, 2),

  color VARCHAR(7) DEFAULT '#7080FE',
  is_manual BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_credit_cards_user ON credit_cards(user_id, status);

-- Faturas históricas dos cartões
CREATE TABLE credit_card_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_month DATE NOT NULL,       -- mês de referência
  total_amount DECIMAL(14, 2),
  minimum_payment DECIMAL(14, 2),
  due_date DATE,
  closing_date DATE,
  paid BOOLEAN DEFAULT FALSE,
  paid_amount DECIMAL(14, 2),
  paid_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(card_id, reference_month)
);
CREATE INDEX idx_bills_user ON credit_card_bills(user_id, due_date);


-- ============================================================
-- 3. INVESTIMENTOS
-- ============================================================

-- Carteira de investimentos (posições)
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES pluggy_connections(id) ON DELETE SET NULL,
  pluggy_investment_id VARCHAR(255),

  -- Identificação do ativo
  ticker VARCHAR(20),                  -- PETR4, HGLG11, BOVA11
  name VARCHAR(255) NOT NULL,
  investment_type VARCHAR(50),         -- STOCK, FII, ETF, BDR, FIXED_INCOME, CRYPTO, FUND
  asset_class VARCHAR(50),             -- renda_variavel, renda_fixa, cripto, fundos

  -- Posição
  quantity DECIMAL(18, 8),
  average_price DECIMAL(14, 4),        -- preço médio de compra
  current_price DECIMAL(14, 4),        -- cotação atual (atualizada via brapi)
  invested_amount DECIMAL(14, 2),      -- total investido
  current_value DECIMAL(14, 2),        -- valor atual da posição
  profit_loss DECIMAL(14, 2) GENERATED ALWAYS AS (
    COALESCE(current_value, 0) - COALESCE(invested_amount, 0)
  ) STORED,
  profit_loss_percentage DECIMAL(8, 2) GENERATED ALWAYS AS (
    CASE WHEN invested_amount > 0
      THEN ((COALESCE(current_value,0) - COALESCE(invested_amount,0)) / invested_amount * 100)
      ELSE 0 END
  ) STORED,

  -- Renda passiva
  dividend_yield DECIMAL(8, 4),
  last_dividend DECIMAL(14, 4),

  broker VARCHAR(100),                 -- corretora
  currency VARCHAR(3) DEFAULT 'BRL',
  is_manual BOOLEAN DEFAULT FALSE,
  price_updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_investments_user ON investments(user_id, investment_type);
CREATE INDEX idx_investments_ticker ON investments(ticker);

-- Histórico de cotações (cache do brapi para gráficos)
CREATE TABLE market_quotes_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(20) NOT NULL,
  price DECIMAL(14, 4),
  change_percent DECIMAL(8, 4),
  volume BIGINT,
  market_cap BIGINT,
  quote_date TIMESTAMP DEFAULT NOW(),
  raw_data JSONB,                      -- resposta completa do brapi
  UNIQUE(ticker, quote_date)
);
CREATE INDEX idx_quotes_ticker ON market_quotes_cache(ticker, quote_date DESC);

-- Insights de IA sobre investimentos
CREATE TABLE investment_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50),            -- diversification, risk, opportunity, alert, summary
  title VARCHAR(255),
  content TEXT,
  related_tickers TEXT[] DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'info', -- info, positive, warning, critical
  ai_model VARCHAR(50),                -- qual modelo gerou (claude, gemini, gpt)
  is_disclaimer_shown BOOLEAN DEFAULT TRUE,  -- sempre mostrar aviso "não é recomendação"
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
CREATE INDEX idx_insights_user ON investment_insights(user_id, dismissed, created_at DESC);


-- ============================================================
-- 4. METAS FINANCEIRAS + PROJEÇÕES
-- ============================================================

-- (savings_goals já existe no schema base; adicionamos projeções)

-- Projeções financeiras
CREATE TABLE financial_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  projection_type VARCHAR(50),         -- monthly_balance, savings_forecast, expense_trend, net_worth
  reference_period DATE,               -- mês/ano projetado
  projected_income DECIMAL(14, 2),
  projected_expense DECIMAL(14, 2),
  projected_balance DECIMAL(14, 2),
  projected_savings DECIMAL(14, 2),
  confidence_level DECIMAL(5, 2),      -- 0-100, confiança da projeção
  based_on_months INT,                 -- baseada em quantos meses de histórico
  methodology VARCHAR(100),            -- media_movel, tendencia_linear, sazonal
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_projections_user ON financial_projections(user_id, reference_period);

-- Insights financeiros gerais (não só investimentos)
CREATE TABLE financial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50),            -- spending_pattern, budget_alert, saving_tip, anomaly
  category VARCHAR(100),
  title VARCHAR(255),
  content TEXT,
  impact_value DECIMAL(14, 2),         -- valor associado (ex: "você gastou R$ X a mais")
  severity VARCHAR(20) DEFAULT 'info',
  ai_model VARCHAR(50),
  action_suggestion TEXT,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_fin_insights_user ON financial_insights(user_id, dismissed, created_at DESC);


-- ============================================================
-- 5. ÁREA PESSOAL — RESUMOS DE EMAIL
-- ============================================================

CREATE TABLE email_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_message_id VARCHAR(255),
  gmail_thread_id VARCHAR(255),

  category VARCHAR(50),                -- personal, academic, financial, other
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  original_subject VARCHAR(500),

  -- Resumo gerado por IA
  summary TEXT,                        -- resumo curto do email
  key_points TEXT[],                   -- pontos principais
  action_required BOOLEAN DEFAULT FALSE,
  suggested_action TEXT,
  priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high
  ai_model VARCHAR(50),

  received_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, gmail_message_id)
);
CREATE INDEX idx_email_summaries_user ON email_summaries(user_id, category, received_at DESC);


-- ============================================================
-- 6. ÁREA PESSOAL — DESENVOLVIMENTO / CONHECIMENTO
-- ============================================================

-- Cursos (próprios, sem depender do Antigravity/Moodle)
CREATE TABLE learning_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(255),               -- Udemy, Alura, YouTube, faculdade, etc
  category VARCHAR(100),
  url VARCHAR(500),
  description TEXT,

  total_modules INT DEFAULT 0,
  completed_modules INT DEFAULT 0,
  progress DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN total_modules > 0
      THEN (completed_modules::float / total_modules::float * 100)
      ELSE 0 END
  ) STORED,

  status VARCHAR(50) DEFAULT 'in_progress',  -- not_started, in_progress, completed, paused
  priority VARCHAR(20) DEFAULT 'medium',
  start_date DATE,
  target_date DATE,
  completed_date DATE,
  color VARCHAR(7) DEFAULT '#7080FE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_courses_user ON learning_courses(user_id, status);

-- Módulos/atividades dos cursos (progresso detalhado)
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0,
  module_type VARCHAR(50),             -- video, reading, exercise, project, quiz
  status VARCHAR(50) DEFAULT 'pending',-- pending, in_progress, completed
  estimated_minutes INT,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_modules_course ON course_modules(course_id, order_index);

-- Trilhas de conhecimento (agrupam cursos/objetivos)
CREATE TABLE knowledge_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,         -- "Front-end Dev", "Ciência de Dados"
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#1C64EF',
  course_ids UUID[] DEFAULT '{}',      -- cursos que compõem a trilha
  target_completion DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tracks_user ON knowledge_tracks(user_id, status);

-- Interesses
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),               -- tech, saude, financas, arte, etc
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_interests_user ON interests(user_id);

-- Objetivos (metas de vida / desenvolvimento — não financeiras)
CREATE TABLE personal_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),               -- carreira, saude, educacao, pessoal
  target_date DATE,
  progress DECIMAL(5, 2) DEFAULT 0,    -- 0-100 (manual ou calculado)
  status VARCHAR(50) DEFAULT 'active', -- active, achieved, paused, abandoned
  priority VARCHAR(20) DEFAULT 'medium',
  milestones JSONB DEFAULT '[]',       -- [{title, done, date}]
  related_track_id UUID REFERENCES knowledge_tracks(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_pgoals_user ON personal_goals(user_id, status);


-- ============================================================
-- 7. VIEWS ÚTEIS DA EXPANSÃO
-- ============================================================

-- Resumo da carteira de investimentos
CREATE VIEW investment_portfolio_summary AS
SELECT
  user_id,
  COUNT(*) as total_positions,
  SUM(invested_amount) as total_invested,
  SUM(current_value) as total_current_value,
  SUM(profit_loss) as total_profit_loss,
  CASE WHEN SUM(invested_amount) > 0
    THEN (SUM(profit_loss) / SUM(invested_amount) * 100)
    ELSE 0 END as total_return_percentage,
  COUNT(*) FILTER (WHERE investment_type = 'STOCK') as stocks_count,
  COUNT(*) FILTER (WHERE investment_type = 'FII') as fiis_count,
  COUNT(*) FILTER (WHERE investment_type = 'FIXED_INCOME') as fixed_income_count,
  COUNT(*) FILTER (WHERE investment_type = 'CRYPTO') as crypto_count
FROM investments
GROUP BY user_id;

-- Saúde financeira dos cartões
CREATE VIEW cards_overview AS
SELECT
  user_id,
  COUNT(*) as total_cards,
  SUM(credit_limit) as total_limit,
  SUM(available_limit) as total_available,
  SUM(used_limit) as total_used,
  CASE WHEN SUM(credit_limit) > 0
    THEN (SUM(used_limit) / SUM(credit_limit) * 100)
    ELSE 0 END as overall_usage_percentage,
  SUM(current_bill_amount) as total_current_bills
FROM credit_cards
WHERE status = 'active'
GROUP BY user_id;

-- Progresso de aprendizado consolidado
CREATE VIEW learning_progress AS
SELECT
  user_id,
  COUNT(*) as total_courses,
  COUNT(*) FILTER (WHERE status = 'in_progress') as active_courses,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_courses,
  AVG(progress) as average_progress
FROM learning_courses
GROUP BY user_id;


-- ============================================================
-- 8. ROW LEVEL SECURITY (aplicar em todas as tabelas novas)
-- ============================================================

ALTER TABLE pluggy_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_goals ENABLE ROW LEVEL SECURITY;

-- Exemplo de policy (repetir para cada tabela, trocando o nome):
-- Usuário só acessa seus próprios dados
CREATE POLICY "users_own_data" ON pluggy_connections
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON bank_accounts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON credit_cards
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON credit_card_bills
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON investments
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON investment_insights
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON financial_projections
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON financial_insights
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON email_summaries
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON learning_courses
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON course_modules
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON knowledge_tracks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON interests
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON personal_goals
  FOR ALL USING (auth.uid() = user_id);

-- market_quotes_cache é público (dados de mercado, não pessoais)
ALTER TABLE market_quotes_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_quotes" ON market_quotes_cache
  FOR SELECT USING (true);
