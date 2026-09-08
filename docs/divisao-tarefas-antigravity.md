# 🧠 dailyS — DIVISÃO DE TAREFAS POR MODELO (Antigravity)

## Como usar este documento

Cada bloco abaixo é um **prompt independente e autossuficiente**. Você copia,
cola no modelo indicado dentro do Antigravity, e ele executa aquela parte sem
depender do contexto das outras. No fim, tudo se encaixa no mesmo projeto
Supabase + React.

**Por que dividir?** Modelos diferentes têm forças diferentes, e rodar em
paralelo economiza seu tempo. A sugestão de qual modelo usar é baseada no tipo
de tarefa — mas todos conseguem fazer qualquer bloco; é otimização, não regra.

---

## 🎯 MATRIZ DE ALOCAÇÃO

| Bloco | Tarefa | Modelo sugerido | Por quê |
|-------|--------|----------------|---------|
| A | Backend Pluggy + Edge Functions | **Claude** | Lógica de integração, segurança de secrets, tratamento de erro |
| B | Componentes UI + animações Framer | **GPT** | Geração rápida de JSX, boilerplate visual |
| C | Serviço brapi + gráficos de investimento | **Gemini** | Boa com dados, parsing e visualização |
| D | Insights de IA (prompts internos) | **Claude** | Prompt engineering, structured output |
| E | Área Pessoal (cursos, trilhas, objetivos) | **GPT** | CRUD repetitivo, forms |
| F | Resumo de emails + classificação | **Gemini** | Processamento de texto em volume |

> Você pode rodar A + C + E em paralelo (não conflitam), depois B + D + F.

---

## 🟦 BLOCO A — Backend Pluggy (CLAUDE)

```
Contexto: projeto dailyS, Supabase + React. Preciso do backend para integrar
o Pluggy (Open Finance) de forma SEGURA.

Tarefas:
1. Criar uma Supabase Edge Function `pluggy-sync` (Deno) que:
   - Recebe { userId, connectionId, pluggyItemId }
   - Autentica no Pluggy com CLIENT_ID/CLIENT_SECRET (env, nunca expor)
   - Puxa contas, transações, cartões e investimentos
   - Faz upsert nas tabelas: bank_accounts, credit_cards, investments, transactions
   - Registra em sync_logs
   - Retorna { created, updated }

2. Criar Edge Function `pluggy-connect-token` que gera um connectToken
   para o widget do Pluggy no frontend.

3. Tratamento de erro robusto + retry (3x com backoff exponencial).

Restrições:
- CLIENT_SECRET só no backend (Edge Function secrets)
- Usar a base do pluggyService.ts que já tenho (vou colar junto)
- Deduplicação de transações via campo gmail_message_id = 'pluggy_<id>'

Entregue: código completo das 2 Edge Functions + instruções de deploy
(supabase functions deploy) + quais secrets configurar.
```

---

## 🟩 BLOCO B — Componentes UI + Animações (GPT)

```
Contexto: projeto dailyS, React 18 + TypeScript + Tailwind + Framer Motion.
Dark mode. Cores: fundo #0A0E27, primário #1C64EF (azul), financeiro #2ECC71
(verde), cartões #7080FE.

Crie estes componentes com animações Framer Motion (fadeInUp, stagger, hover):

1. <InvestmentCard /> — mostra ticker, nome, valor atual, lucro/prejuízo (%),
   com cor verde/vermelho conforme resultado. Mini-sparkline opcional.

2. <CreditCardWidget /> — cartão visual (formato de cartão real) com:
   nome, bandeira, últimos 4 dígitos, barra de uso do limite
   (verde <50%, amarelo 50-80%, vermelho >80%), fatura atual e vencimento.

3. <InsightCard /> — card de insight de IA com ícone por severity
   (info/positive/warning/critical), título, conteúdo e SEMPRE um rodapé
   pequeno com disclaimer "Não é recomendação de investimento".

4. <EmailSummaryCard /> — remetente, assunto, resumo curto, badge de categoria
   (pessoal/acadêmico/financeiro), indicador de "ação necessária".

5. <CourseProgressCard /> — título do curso, provider, barra de progresso
   (módulos concluídos/total), status.

Requisitos: componentes desacoplados, props tipadas (TypeScript), mobile-first,
sem libs além de framer-motion, lucide-react (ícones) e clsx.
Entregue cada componente em arquivo separado.
```

---

## 🟨 BLOCO C — Serviço brapi + Gráficos (GEMINI)

```
Contexto: projeto dailyS, React + TypeScript + Supabase. Preciso integrar a
API brapi.dev (cotações da B3) e criar visualizações.

Tarefas:
1. Refinar o brapiService.ts (vou colar) com:
   - Cache inteligente (não chamar API se cotação < 15 min)
   - Batch de tickers em uma chamada só
   - Tratamento quando ticker não existe

2. Criar hook useInvestments() que:
   - Busca carteira do Supabase
   - Atualiza cotações via brapi
   - Retorna { positions, portfolioSummary, loading, refresh }

3. Criar componentes de gráfico com Recharts:
   - <PortfolioAllocationChart /> — donut por tipo (ações/FII/RF/cripto)
   - <PositionHistoryChart /> — linha do histórico de um ativo (getHistory)
   - <PortfolioEvolutionChart /> — evolução do valor total da carteira

Dados: brapi retorna regularMarketPrice, regularMarketChangePercent,
historicalDataPrice[{date, close}]. Token no env VITE_BRAPI_TOKEN.

Entregue: brapiService refinado + hook + 3 componentes de gráfico.
```

---

## 🟦 BLOCO D — Insights de IA (CLAUDE)

```
Contexto: projeto dailyS. Preciso de um serviço que gera insights financeiros
e de investimento via IA, com structured output confiável.

Tarefas:
1. Refinar insightsService.ts (vou colar) garantindo:
   - Prompts que SEMPRE retornam JSON válido
   - Fallback quando o parse falha
   - Disclaimer obrigatório em todo insight de investimento
   - Nunca gerar linguagem de "compre/venda" (só educativo)

2. Criar 3 tipos de insight:
   - Diversificação (analisa concentração da carteira)
   - Padrão de gastos (detecta categorias que cresceram vs mês anterior)
   - Projeção de saldo (média móvel dos últimos 3-6 meses)

3. Criar a lógica de projeção financeira (financial_projections):
   - Média móvel de receita/despesa
   - Nível de confiança baseado na variância dos dados
   - Salvar no Supabase

Restrições: caráter educativo, nunca aconselhamento personalizado de
investimento. Todo output de investimento carrega o disclaimer.

Entregue: insightsService refinado + serviço de projeções + prompts finais.
```

---

## 🟩 BLOCO E — Área Pessoal / Conhecimento (GPT)

```
Contexto: projeto dailyS, React + TypeScript + Supabase. Tabelas já criadas:
learning_courses, course_modules, knowledge_tracks, interests, personal_goals.

Crie o módulo "Pessoal" completo:

1. Hooks CRUD:
   - useCourses() — cursos + módulos, calcular progresso
   - useKnowledgeTracks() — trilhas
   - useInterests() — interesses
   - usePersonalGoals() — objetivos com milestones

2. Páginas/componentes:
   - <CoursesPage /> — lista de cursos com barra de progresso, botão "novo curso"
   - <CourseForm /> — cadastrar curso (título, provider, url, nº módulos)
   - <CourseDetail /> — lista de módulos, marcar como concluído
   - <KnowledgeTracksPage /> — trilhas agrupando cursos
   - <InterestsManager /> — adicionar/remover interesses (tags)
   - <GoalsPage /> — objetivos com milestones (checklist), progresso manual

Requisitos: TypeScript, Tailwind dark mode, Framer Motion. Realtime opcional.
Ao marcar módulo como concluído, atualizar completed_modules do curso.

Entregue: hooks + páginas + forms completos.
```

---

## 🟨 BLOCO F — Resumo de Emails (GEMINI)

```
Contexto: projeto dailyS. Preciso processar a caixa de Gmail e gerar resumos
por IA, classificando em pessoal/acadêmico/financeiro.

Tarefas:
1. Refinar emailSummaryService.ts (vou colar):
   - Processar em lote sem estourar rate limit
   - Pular emails já processados (dedup por gmail_message_id)
   - Decodificação correta de base64url do corpo

2. Criar Edge Function `email-summary-cron` que roda 2x/dia e:
   - Puxa emails não lidos
   - Gera resumos
   - Salva em email_summaries

3. Criar hook useEmailSummaries() com filtro por categoria e componente
   <PersonalInbox /> que mostra os resumos agrupados por categoria (abas:
   Pessoal / Acadêmico / Financeiro), destacando os com action_required.

Dados: Gmail API (já temos OAuth). Salvar em email_summaries.
A parte acadêmica aqui NÃO usa Antigravity — é só resumo dos emails da
faculdade que chegam no Gmail.

Entregue: service refinado + Edge Function + hook + componente de inbox.
```

---

## 🔗 ORDEM DE MONTAGEM (depois que os modelos entregarem)

```
1. Rodar dailys-schema-expansao.sql no Supabase       (banco pronto)
2. Configurar secrets (Pluggy, brapi) no Supabase     (credenciais)
3. Deploy Edge Functions (Bloco A + F)                 (backend)
4. Colar hooks e services (Blocos C, D, E)             (lógica)
5. Colar componentes UI (Blocos B, E, F)               (visual)
6. Adicionar rotas: /investimentos, /pessoal          (navegação)
7. Agendar crons: pluggy-sync (diário), email (2x/dia) (automação)
8. Testar cada módulo isoladamente, depois integrado
```

---

## ⚠️ AVISOS IMPORTANTES

**Sobre investimentos e IA:** os insights são educativos, nunca recomendação.
Todo card de investimento carrega o disclaimer. Você (usuário) decide — o app
só organiza e informa. Eu não sou consultor financeiro certificado e o dailyS
também não deve se apresentar como um.

**Sobre segurança do Pluggy:** o CLIENT_SECRET NUNCA vai pro frontend. Sempre
via Edge Function. O widget do Pluggy usa um connectToken temporário, gerado
no backend, que é seguro expor.

**Sobre cotações "tempo real":** no plano grátis do brapi há um pequeno atraso.
Pra dashboard pessoal é ótimo, mas não serve pra day-trade de alta frequência.
Deixe isso claro na UI (ex: "cotação atualizada há X min").

**Sobre dados bancários:** o Meu Pluggy (uso pessoal) é gratuito e sem prazo.
Se um dia o dailyS virar produto comercial pra outras pessoas, aí sim precisa
do plano pago da Pluggy (a partir de R$ 2.500/mês) — mas isso é decisão futura.
