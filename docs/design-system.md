# 🎨 DESIGN SYSTEM UNIFICADO
## Dashboard Financeiro + Tarefas Acadêmicas

---

## 📐 FILOSOFIA DE DESIGN

### Objetivo Principal
Criar um **sistema coeso** onde dois dashboards distintos (financeiro e acadêmico) convivem naturalmente no mesmo produto, sem conflitos visuais ou de navegação.

### Princípios
1. **Modularidade** - Componentes reutilizáveis entre ambos
2. **Hierarquia Clara** - Diferenciar contextos sem fragmentar
3. **Consistência** - Mesmas cores, tipografia, espaçamento
4. **Contexto Visual** - Cores temáticas por seção (azul acadêmico, verde financeiro)
5. **Fluidez** - Transições suaves entre dashboards

---

## 🎨 PALETA DE CORES UNIFICADA

### Core Colors (Aplicadas em Ambos)
```css
/* Backgrounds */
--bg-primary: #0A0E27           /* Preto profundo - ambos */
--bg-secondary: #12172F         /* Cinza muito escuro - ambos */
--bg-tertiary: #1A2244          /* Cinza escuro - ambos */
--bg-card: #161D3A              /* Cards - ambos */

/* Neutrals */
--text-primary: #FFFFFF         /* Branco puro */
--text-secondary: #B8BFCC       /* Cinza claro */
--text-tertiary: #8A92A8        /* Cinza médio */
--border: #2A3355
--border-light: #3A4566

/* Primary (Ações globais) */
--primary: #1C64EF              /* Azul Royal */
--primary-light: #7080FE        /* Azul Picton */
--primary-dark: #1450C1         /* Azul escuro */
```

### Contexto: Academico (Azul)
```css
--academic-primary: #1C64EF     /* Azul Royal (primário) */
--academic-light: #7080FE       /* Azul Picton (accent) */
--academic-dark: #1450C1        /* Azul escuro (hover) */
--academic-bg: rgba(28, 100, 239, 0.05)    /* Fundo tênue */

/* Prioridades acadêmicas */
--academic-critical: #FF6B6B    /* P1 Crítica */
--academic-high: #FFA94D        /* P2 Alta */
--academic-normal: #FFD93D      /* P3 Normal */
--academic-low: #6BCB77         /* P4 Baixa */
```

### Contexto: Financeiro (Verde)
```css
--financial-primary: #2ECC71    /* Verde vibrant */
--financial-light: #58D68D      /* Verde claro */
--financial-dark: #27AE60       /* Verde escuro */
--financial-bg: rgba(46, 204, 113, 0.05)   /* Fundo tênue */

/* Categoria financeira */
--financial-income: #2ECC71     /* Receita / Entrada (verde) */
--financial-expense: #E74C3C    /* Despesa / Saída (vermelho) */
--financial-pending: #F39C12    /* Pendente (laranja) */
--financial-savings: #3498DB    /* Poupança / Meta (azul) */
```

### Status Universais
```css
--status-success: #2ECC71       /* Sucesso (verde) */
--status-warning: #F39C12       /* Aviso (laranja) */
--status-error: #E74C3C         /* Erro (vermelho) */
--status-info: #3498DB          /* Info (azul) */
--status-neutral: #8A92A8       /* Neutro (cinza) */
```

---

## 📐 LAYOUT MESTRADO

### Estrutura de Página Unificada

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Compartilhado)                                 │
│  └─ Logo + Nav contexto + User menu                    │
├────────────┬──────────────────────────────────────────┤
│            │                                            │
│ SIDEBAR    │  MAIN CONTENT                             │
│ Contexto   │  (Dinâmico conforme abas)                 │
│            │                                            │
│ ├─ 📊 Dashboard                                         │
│ │  ├─ Financial                                         │
│ │  └─ Academic                                          │
│ ├─ 💰 Finanças                                          │
│ ├─ 📚 Tarefas                                           │
│ ├─ 📈 Análises                                          │
│ ├─ ⚙️  Configurações                                    │
│ └─ 🚪 Sair                                              │
│                                                          │
└────────────┴──────────────────────────────────────────┘
```

### Contexto Acadêmico (Azul)
```
┌──────────────────────────────────────────────────────────┐
│ 📚 TAREFAS ACADÊMICAS                                    │
│ Sincronizado: há 2 horas                                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ [Todas] [Hoje] [Próximos 7d] [Por Disciplina]          │
│                                                           │
│ ┌─ 🔴 CRÍTICAS (P1) ─────────────────────────────────┐  │
│ │ 3 tarefas                                          │  │
│ │                                                     │  │
│ │ [Cards de tarefas com border-left azul]           │  │
│ │                                                     │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─ 🟠 ALTAS (P2) ────────────────────────────────────┐  │
│ │ 5 tarefas                                          │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─ WIDGETS ─────────────────────────────────────────┐   │
│ │ [18 Total] [3 Hoje] [5 Atrasadas] [88% Em dia]  │   │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Contexto Financeiro (Verde)
```
┌──────────────────────────────────────────────────────────┐
│ 💰 FINANÇAS                                              │
│ Última atualização: hoje às 14:30                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─ RESUMO DO MÊS ────────────────────────────────────┐  │
│ │ [Cards de métricas com border-left verde]         │  │
│ │ ┌──────────┬──────────┬──────────┬──────────┐     │  │
│ │ │ R$ 5.200 │ R$ 3.800 │ R$ 1.400 │   35%   │     │  │
│ │ │ Receita  │ Despesa  │ Saldo    │ Poupança│     │  │
│ │ └──────────┴──────────┴──────────┴──────────┘     │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─ TRANSAÇÕES ────────────────────────────────────────┐  │
│ │ [Listagem com ícones de categoria]                 │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Dashboard Unificado (Hybrid)
```
┌──────────────────────────────────────────────────────────┐
│ 📊 DASHBOARD GERAL                                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─ 📚 PRÓXIMAS TAREFAS ────┐  ┌─ 💰 RESUMO FINANCEIRO ─┐│
│ │ [3 tarefas críticas]    │  │ [Saldo, receita, gasto]││
│ │ [Cards minificados]     │  │ [Mini gráfico]         ││
│ │ [Ver mais →]            │  │ [Ver mais →]           ││
│ └────────────────────────┘  └────────────────────────┘│
│                                                           │
│ ┌─ 📈 GRÁFICOS ─────────────────────────────────────┐   │
│ │ [Gastos vs Tarefas] [Timeline]                   │   │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🧩 COMPONENTES COMPARTILHADOS

### 1. Card Genérico
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.card:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-light);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* Variações de contexto */
.card.academic {
  border-left: 4px solid var(--academic-primary);
}

.card.financial {
  border-left: 4px solid var(--financial-primary);
}

.card.critical {
  border-left: 4px solid var(--academic-critical);
}

.card.expense {
  border-left: 4px solid var(--financial-expense);
}
```

### 2. Badges/Tags
```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

/* Academic Priorities */
.badge.p1 {
  background: rgba(255, 107, 107, 0.15);
  color: #FF6B6B;
  border-color: rgba(255, 107, 107, 0.3);
}

.badge.p2 {
  background: rgba(255, 169, 77, 0.15);
  color: #FFA94D;
  border-color: rgba(255, 169, 77, 0.3);
}

.badge.p3 {
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
  border-color: rgba(255, 217, 61, 0.3);
}

.badge.p4 {
  background: rgba(107, 203, 119, 0.15);
  color: #6BCB77;
  border-color: rgba(107, 203, 119, 0.3);
}

/* Financial Categories */
.badge.income {
  background: rgba(46, 204, 113, 0.15);
  color: #2ECC71;
  border-color: rgba(46, 204, 113, 0.3);
}

.badge.expense {
  background: rgba(231, 76, 60, 0.15);
  color: #E74C3C;
  border-color: rgba(231, 76, 60, 0.3);
}

.badge.pending {
  background: rgba(243, 156, 18, 0.15);
  color: #F39C12;
  border-color: rgba(243, 156, 18, 0.3);
}

.badge.savings {
  background: rgba(52, 152, 219, 0.15);
  color: #3498DB;
  border-color: rgba(52, 152, 219, 0.3);
}
```

### 3. Botões Contextuais
```css
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Primary (Ações globais) */
.btn.primary {
  background: var(--primary);
  color: var(--text-primary);
}

.btn.primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 12px rgba(28, 100, 239, 0.4);
}

/* Academic Context */
.btn.academic {
  background: var(--academic-primary);
  color: var(--text-primary);
}

.btn.academic:hover {
  background: var(--academic-dark);
}

/* Financial Context */
.btn.financial {
  background: var(--financial-primary);
  color: var(--text-primary);
}

.btn.financial:hover {
  background: var(--financial-dark);
}

/* Secondary */
.btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn.secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-light);
}
```

### 4. Section Headers
```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-header:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-light);
}

/* Variações */
.section-header.academic {
  border-left: 4px solid var(--academic-primary);
}

.section-header.financial {
  border-left: 4px solid var(--financial-primary);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-count {
  font-size: 14px;
  color: var(--text-tertiary);
}
```

### 5. Metric Widgets
```css
.widget {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.widget:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-light);
}

.widget-number {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 6px;
}

/* Variações de cor */
.widget.academic .widget-number {
  color: var(--academic-primary);
}

.widget.financial .widget-number {
  color: var(--financial-primary);
}

.widget-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.widget-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 12px;
}
```

---

## 🎭 TEMA ACADÊMICO (Azul)

### Quando Ativar
- Página principal: `/dashboard/academic`
- Seção: `/tasks`
- Nav item ativo
- Qualquer contexto relacionado a tarefas/cursos

### Aplicação
```css
/* Header do contexto */
.context-header.academic {
  background: linear-gradient(135deg, rgba(28, 100, 239, 0.1) 0%, rgba(112, 128, 254, 0.05) 100%);
  border-bottom: 2px solid var(--academic-primary);
}

/* Accent em todo contexto */
.context-academic .accent {
  color: var(--academic-primary);
}

.context-academic .accent-light {
  color: var(--academic-light);
}

/* Cards acadêmicos */
.task-card {
  border-left: 4px solid var(--academic-primary);
}

.task-card:hover {
  background: rgba(28, 100, 239, 0.02);
}

/* Prioridades */
.task-card.p1 { border-left-color: #FF6B6B; }
.task-card.p2 { border-left-color: #FFA94D; }
.task-card.p3 { border-left-color: #FFD93D; }
.task-card.p4 { border-left-color: #6BCB77; }
```

---

## 💳 TEMA FINANCEIRO (Verde)

### Quando Ativar
- Página principal: `/dashboard/financial`
- Seção: `/finances`
- Nav item ativo
- Qualquer contexto relacionado a transações/orçamento

### Aplicação
```css
/* Header do contexto */
.context-header.financial {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(88, 214, 141, 0.05) 100%);
  border-bottom: 2px solid var(--financial-primary);
}

/* Accent em todo contexto */
.context-financial .accent {
  color: var(--financial-primary);
}

.context-financial .accent-light {
  color: var(--financial-light);
}

/* Cards financeiros */
.transaction-card {
  border-left: 4px solid var(--financial-primary);
}

.transaction-card:hover {
  background: rgba(46, 204, 113, 0.02);
}

/* Categorias */
.transaction-card.income { border-left-color: #2ECC71; }
.transaction-card.expense { border-left-color: #E74C3C; }
.transaction-card.pending { border-left-color: #F39C12; }
.transaction-card.savings { border-left-color: #3498DB; }
```

---

## 📱 SIDEBAR NAVEGAÇÃO

```css
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  padding: 12px 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-item.active {
  color: var(--primary);
  background: rgba(28, 100, 239, 0.1);
  border-left: 3px solid var(--primary);
  padding-left: 17px;
}

/* Grupo de navegação */
.nav-group {
  margin-bottom: 8px;
}

.nav-group-title {
  padding: 12px 20px 8px;
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.nav-item.sub {
  padding-left: 32px;
  font-size: 13px;
}
```

---

## 🔄 TRANSIÇÕES ENTRE CONTEXTOS

### Animação de Mudança de Tema
```css
/* Quando muda de contexto */
.context-transition {
  animation: contextSwitch 0.3s ease;
}

@keyframes contextSwitch {
  0% {
    opacity: 0.8;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header mudan de cor suavemente */
.context-header {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
```

---

## 📊 DASHBOARD UNIFICADO (HYBRID VIEW)

### Layout em Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-section {
  grid-column: 1 / -1;
}

.dashboard-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.dashboard-row.full {
  grid-column: 1 / -1;
}

/* Responsivo */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-row {
    grid-template-columns: 1fr;
  }
}
```

### Exemplo de Dashboard Unificado
```html
<div class="dashboard-grid">
  
  <!-- ROW 1: Quick Overview -->
  <div class="dashboard-row">
    
    <div class="card academic">
      <h3 class="section-title">📚 Próximas Tarefas</h3>
      <!-- [3 cards minificados de tarefas críticas] -->
      <a href="/tasks" class="btn secondary">Ver todas →</a>
    </div>
    
    <div class="card financial">
      <h3 class="section-title">💰 Resumo Financeiro</h3>
      <!-- [Gráfico donut de receita/despesa] -->
      <a href="/finances" class="btn secondary">Detalhes →</a>
    </div>
    
  </div>
  
  <!-- ROW 2: Timeline/Análise -->
  <div class="dashboard-section">
    <div class="card">
      <h3 class="section-title">📈 Análise Integrada</h3>
      <!-- [Gráfico: Tarefas vs Gastos ao longo do mês] -->
    </div>
  </div>
  
  <!-- ROW 3: Stats -->
  <div class="dashboard-row">
    
    <div>
      <div class="widget academic">
        <div class="widget-number">18</div>
        <div class="widget-label">Tarefas Totais</div>
      </div>
    </div>
    
    <div>
      <div class="widget financial">
        <div class="widget-number">R$ 5.2k</div>
        <div class="widget-label">Receita Mês</div>
      </div>
    </div>
    
  </div>
  
</div>
```

---

## 🎯 HIERARQUIA VISUAL

```
[PRIMÁRIO - Ações críticas]
│
├─ Botões azuis (ambos contextos)
├─ Prioridade P1 (acadêmico)
├─ Despesas/Saídas (financeiro)
│
[SECUNDÁRIO - Informações importantes]
│
├─ Cards de tarefas/transações
├─ Seção headers
├─ Widgets de métricas
│
[TERCIÁRIO - Suporte]
│
├─ Texto de metadata
├─ Borders e separadores
├─ Ícones informativos
│
[BACKGROUND - Espaço vazio]
│
└─ Fundo preto profundo
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Variáveis CSS do sistema unificado
- [ ] Componentes base (card, badge, btn)
- [ ] Temas acadêmico/financeiro (overlays, borders)
- [ ] Sidebar com navegação dupla
- [ ] Dashboard unificado (hybrid view)
- [ ] Transições suaves entre contextos
- [ ] Responsividade mobile
- [ ] Testes de contraste (WCAG AA)
- [ ] Documentação de componentes
- [ ] Guia de uso para desenvolvedores

---

## 🎨 EXEMPLO DE CÓDIGO (REACT)

```jsx
// App.jsx
import React, { useState } from 'react';
import './design-system.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './pages/Tasks';
import Finances from './pages/Finances';

function App() {
  const [currentContext, setCurrentContext] = useState('dashboard');
  
  const contextClass = currentContext.includes('academic') 
    ? 'context-academic' 
    : currentContext.includes('financial')
    ? 'context-financial'
    : 'context-neutral';
  
  return (
    <div className={`app ${contextClass}`}>
      <Sidebar currentContext={currentContext} setCurrentContext={setCurrentContext} />
      
      <main className="main-content">
        {currentContext === 'dashboard' && <Dashboard />}
        {currentContext === 'tasks' && <Tasks />}
        {currentContext === 'finances' && <Finances />}
      </main>
    </div>
  );
}

export default App;
```

```jsx
// components/Card.jsx
import React from 'react';

function Card({ type = 'neutral', children, className = '' }) {
  const cardClass = `card ${type} ${className}`;
  return <div className={cardClass}>{children}</div>;
}

export default Card;
```

---

## 📖 GUIA DE USO

### Para Desenvolvedores

**Quando usar azul (Acadêmico):**
```jsx
<Card type="academic">
  <h2>Tarefas</h2>
  {/* conteúdo */}
</Card>

<Button className="btn academic">Ir para Tarefas</Button>
```

**Quando usar verde (Financeiro):**
```jsx
<Card type="financial">
  <h2>Finanças</h2>
  {/* conteúdo */}
</Card>

<Button className="btn financial">Ver Gastos</Button>
```

**Quando usar neutro (Compartilhado):**
```jsx
<Card>
  {/* conteúdo genérico */}
</Card>

<Button className="btn primary">Ação Global</Button>
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar variáveis CSS** na aplicação
2. **Criar componentes reutilizáveis** (Card, Button, Badge)
3. **Desenvolver temas contextuais** (Academic, Financial)
4. **Integrar dashboards** em uma página unificada
5. **Testar responsividade** e transições
6. **Validar acessibilidade** (WCAG AA)

---

**O design mantém coerência visual enquanto diferencia claramente os contextos! 🎨**
