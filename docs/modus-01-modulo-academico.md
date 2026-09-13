# MODUS — Módulo Acadêmico v2 (Hub de Estudos Completo)

> Substitui `modus-01-modulo-academico.md`. Pré-requisito: ler `modus-00-visao-geral-e-design-system.md` e `claude/modus-09-referencias-visuais.md` (Referência 2 para o layout do calendário).
>
> **O que mudou nesta versão:** o módulo deixou de ser só "calendário de prazos do AVA" e virou um hub de estudos completo — com caderno por disciplina, quiz gerado pelo agente, acompanhamento de % de conclusão vindo diretamente do Moodle, e integração com Gemini Notebook via MCP.

## Status atual: 🚫 BLOQUEADO (credenciais AVA_USER / AVA_PASS — sem isso nada aqui sobe)

---

## PARTE A — Dados, regras de negócio e integrações

### A.1 Objetivo do módulo (revisado)

Ser o hub acadêmico do MODUS: acompanhar disciplinas, prazos, leituras e progresso real vindos do AVA, gerar quizzes automaticamente dos materiais de cada semana, e organizar os conteúdos em cadernos de estudo por disciplina — tudo em um único lugar, sem precisar abrir o Moodle para saber o que foi feito e o que falta.

**Três perguntas que o módulo responde num olhar:**
1. O que foi atribuído a mim e quando vence?
2. Quanto já concluí em cada disciplina?
3. Estou realmente aprendendo o conteúdo? (quiz)

---

### A.2 Quatro camadas do módulo

```
CAMADA 1 — Sincronização (Antigravity + Puppeteer)
  └─ AVA scraping diário: prazos, leituras, atividades, % de conclusão por curso
  
CAMADA 2 — Organização por disciplina (Supabase)
  └─ Cada disciplina = entidade com caderno, materiais, prazos e progresso
  
CAMADA 3 — Estudo aprofundado (Gemini Notebook via MCP)
  └─ PDFs/URLs das leituras → Notebook por disciplina → resumos e respostas fundamentadas

CAMADA 4 — Quiz e progresso (Antigravity — mesmo agente)
  └─ Agente lê os materiais da semana → gera perguntas → salva no Supabase
  └─ % de conclusão = dado real extraído do card do Moodle, não calculado pelo MODUS
```

---

### A.3 Fluxo completo do agente (diário, 07h Brasília / 10:00 UTC)

#### Passo 1 — Login e extração principal (igual à v1)
- Login em `https://ava.univesp.br` com `AVA_USER` / `AVA_PASS` (variáveis de ambiente, nunca hardcoded)
- Reutilizar `cookies.json` se a sessão ainda for válida

#### Passo 2 — Resumo dos cursos com % de conclusão (NOVO)
- Navegar até a página de resumo dos cursos (URL a confirmar no AVA — provavelmente `/my/` ou `/course/index.php`)
- A tela exibe cards de disciplina com: nome completo, código (ex: `SOC100`), semestre (ex: `2026S2B1`) e **"X% completo"** já calculado pelo Moodle
- O Puppeteer extrai de cada card: nome, código, semestre, `completion_pct` (inteiro 0–100)
- Gravar/atualizar na tabela `disciplines` com timestamp `completion_synced_at`
- **Regra:** o % vem do Moodle sem recalcular — se o Moodle diz 89%, o MODUS exibe 89%. Nunca inferir ou aproximar.

#### Passo 3 — Detalhes por disciplina
Para cada disciplina, abrir `/course/view.php?id=X` e extrair (igual à v1):
- Atividades avaliativas (nome, data início, prazo, status)
- Avaliações entre pares (janela, quantos faltam avaliar)
- Leituras obrigatórias da semana atual (título, URL/PDF, semana, prazo ou "sem prazo definido")
- Provas presenciais (período, polo, horário)

#### Passo 4 — Geração de quiz (NOVO — mesmo agente, logo depois do scraping)
Para cada disciplina que tem leituras novas naquela semana:
- O agente lê o conteúdo de cada leitura (URL → texto, PDF → extração de texto)
- Gera entre 5 e 8 perguntas de múltipla escolha (4 opções, A/B/C/D) com explicação da resposta correta
- As perguntas são específicas ao conteúdo daquela semana — não genéricas
- Gravar em `quiz_questions` marcando `discipline_id`, `week_reference` (ex: "2026-S2-Semana 3") e `source_material` (título/URL de onde veio)
- **Regra:** nunca regenerar questões já existentes para a mesma `(discipline_id, week_reference)` — checar antes de gravar. Se o conteúdo da semana mudou (URL diferente), gerar novas e marcar as antigas como `superseded`

#### Passo 5 — Sync com Gemini Notebook via MCP (NOVO)
- Para cada leitura nova extraída no Passo 3: adicionar como fonte no notebook do Gemini correspondente à disciplina
- Se não existe notebook para a disciplina ainda: criar com nome `"MODUS — [Código da Disciplina]"` e gravar o `notebook_id` em `disciplines.notebook_id`
- Registrar o sync em `notebooklm_sync_log`
- **Regra:** o MCP usa o servidor `notebooklm-mcp` (não oficial, APIs internas do Google). Se o MCP falhar, o agente NÃO aborta — continua os demais passos e registra a falha em log separado. O Gemini Notebook é complementar, não crítico.

#### Passo 6 — Persistência e notificação (igual à v1 com adições)
- Gravar/atualizar tudo no Supabase
- Comparar com execução anterior: atividade nova, prazo alterado, % de conclusão mudou significativamente (delta ≥ 5pp) → incluir no push
- Push consolidado com: atividades pendentes, prazo mais próximo, disciplinas com progresso atualizado, novas perguntas de quiz disponíveis
- Se nada mudou: atualizar silenciosamente, sem push
- Se login falhou: push de erro imediato, não sobrescrever dados existentes

---

### A.4 Schema de dados

#### Tabelas existentes (v1) — mantidas
`academic_tasks`, `academic_subjects`, `academic_sync_log`, `scraper_execution_log`

#### Tabelas novas ou expandidas

**`disciplines`** ← expande `academic_subjects`
```
id uuid PK
code          text          -- "SOC100"
name          text          -- "Ética, cidadania e Sociedade"
full_name     text          -- nome completo como aparece no AVA
semester      text          -- "2026S2B1"
moodle_course_id  integer   -- id do curso no Moodle (para montar a URL)
completion_pct    integer   -- 0–100, vindo diretamente do card do Moodle
completion_synced_at timestamptz
notebook_id   text nullable -- id do notebook no Gemini Notebook (quando criado)
color         text nullable -- cor de destaque escolhida pelo usuário para esta disciplina
created_at    timestamptz
```

**`reading_materials`**
```
id uuid PK
discipline_id uuid FK → disciplines
title         text
url           text nullable
week_reference text   -- ex: "2026-S2-Semana 3"
has_deadline  boolean
deadline      timestamptz nullable
status        text   -- 'pending' | 'reading' | 'done'
estimated_minutes integer nullable
added_to_notebook boolean default false  -- já foi sincronizado ao Gemini Notebook?
created_at    timestamptz
```

**`quiz_questions`**
```
id uuid PK
discipline_id uuid FK → disciplines
week_reference text
question_text text
option_a text
option_b text
option_c text
option_d text
correct_option text  -- 'a' | 'b' | 'c' | 'd'
explanation   text   -- por que esta resposta é correta
source_material text -- título/URL de onde veio o conteúdo
status        text default 'active'  -- 'active' | 'superseded'
generated_at  timestamptz
```

**`quiz_attempts`**
```
id uuid PK
question_id   uuid FK → quiz_questions
selected_option text  -- 'a' | 'b' | 'c' | 'd'
is_correct    boolean
attempted_at  timestamptz
```

**`study_notes`**
```
id uuid PK
discipline_id uuid FK → disciplines
content       text
is_ai_generated boolean default false  -- true = gerado pelo agente via Gemini Notebook
week_reference text nullable
created_at    timestamptz
updated_at    timestamptz
```

**`study_sessions`**
```
id uuid PK
discipline_id uuid FK → disciplines
started_at    timestamptz
ended_at      timestamptz nullable
duration_minutes integer nullable  -- calculado ao encerrar
topic         text nullable  -- o que foi estudado nesta sessão
```

**`notebooklm_sync_log`**
```
id uuid PK
discipline_id uuid FK → disciplines
notebook_id   text
sources_added integer
sources_failed integer
error_detail  text nullable
synced_at     timestamptz
```

---

### A.5 Cálculo de progresso no MODUS

O MODUS exibe **dois números de progresso** por disciplina, claramente separados:

| Indicador | De onde vem | O que mede |
|---|---|---|
| **% Moodle** | `disciplines.completion_pct` (scraping do card) | Progresso oficial reconhecido pela Univesp |
| **% Leituras** | `done / total` de `reading_materials` daquela disciplina | Leituras que o usuário marcou como concluídas no MODUS |

Eles não se mesclam — são exibidos lado a lado. O usuário vê "92% no Moodle · 7 de 9 leituras feitas" e entende imediatamente os dois eixos.

**Nunca inventar um "% geral" combinado** sem deixar explícito como foi calculado.

---

### A.6 Geração de quiz — especificação para o agente

O agente deve gerar as perguntas com o seguinte prompt interno (template — o Antigravity adapta conforme o modelo):

```
Você é um professor da disciplina "[NOME DA DISCIPLINA]". 
Com base no conteúdo abaixo, extraído da semana [REFERÊNCIA DA SEMANA], 
gere exatamente [N] perguntas de múltipla escolha para testar a compreensão 
do estudante.

Regras:
- 4 alternativas por questão (A, B, C, D)
- Apenas uma alternativa correta
- As alternativas erradas devem ser plausíveis (não óbvias)
- Inclua uma explicação de 2-3 frases do por quê a alternativa correta é certa
- As perguntas devem testar COMPREENSÃO, não memorização de datas ou nomes
- Formato de saída: JSON com array de objetos {question_text, option_a, option_b, option_c, option_d, correct_option, explanation}

CONTEÚDO:
[TEXTO EXTRAÍDO DA LEITURA]
```

**Modelo de IA para geração de quiz:** modelo de raciocínio forte (não o econômico) — a qualidade das distratoras (alternativas erradas plausíveis) define se o quiz tem valor real. Perguntas óbvias demais não testam nada.

---

### A.7 Integração Gemini Notebook (MCP)

**Servidor usado:** `notebooklm-mcp` (PleasePrompto/notebooklm-mcp, ~2.3k stars, TypeScript)

**Configuração no Antigravity:**
```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": ["notebooklm-mcp@latest"]
    }
  }
}
```

**Autenticação:** na primeira execução, o MCP abre o Chrome para login Google. Após isso reutiliza o perfil. No Antigravity isso acontece uma única vez via setup manual.

**Ferramentas MCP usadas pelo agente:**
- `create_notebook(title)` — criar notebook por disciplina (uma vez)
- `add_source(notebook_id, url | file | text)` — adicionar leitura da semana
- `query_notebook(notebook_id, question)` — para geração de resumo semanal

**Regra de resiliência:** se o MCP falhar (timeout, sessão expirada, mudança de API interna), o agente registra em `notebooklm_sync_log.error_detail` e continua. O quiz é gerado pelo agente mesmo sem o Gemini Notebook — são caminhos independentes.

---

### A.8 O que NÃO fazer

- Não recalcular o % de conclusão por conta própria — usar sempre o número que o Moodle já mostra no card
- Não gerar quiz de semanas anteriores que já têm questões `active` para a mesma `(discipline_id, week_reference)` — checar antes de inserir
- Não marcar leitura como concluída automaticamente — é ação explícita do usuário
- Não simular dados de disciplinas se o AVA não estiver conectado — estado vazio explícito
- Não misturar o % do Moodle com o % de leituras em um único número
- Não armazenar senha do AVA em texto puro nem no código versionado

---

## PARTE B — Camada visual (Hub de Estudos)

### B.1 Estrutura de navegação do módulo

O módulo Acadêmico tem **dois níveis de navegação**:

**Nível 1 — Visão geral (tela inicial da aba)**
Calendário mensal navegável + painel do dia (Referência 2 de `modus-09-referencias-visuais.md`). Mantido exatamente como especificado na v1.

Adição na lateral direita do calendário: **faixa de progresso por disciplina** — lista vertical compacta com nome abreviado, barra de progresso do % Moodle e badge do % de leituras. Clicar em qualquer disciplina abre o Nível 2.

**Nível 2 — Disciplina (tela de hub de estudos)**
Tela própria com header da disciplina e 5 abas internas (ver B.3).

---

### B.2 Header da disciplina

- Fundo `#12141C` (secundário), não preto puro — para diferenciar do fundo base
- À esquerda: nome completo da disciplina + código + semestre em cinza
- À direita: dois indicadores lado a lado:
  - **`% Moodle`** — número grande em branco, label "Moodle" em cinza abaixo, barra de progresso linear na cor de contexto do módulo (`#1C64EF`)
  - **`X/Y leituras`** — número em branco, label "leituras feitas" em cinza, barra em `#7080FE`
- Badge discreto mostrando a última sincronização ("sync há 3h")
- Botão ghost "Abrir no Gemini Notebook" com ícone externo — abre `notebooklm.google.com` na nova aba, linkando direto pro notebook da disciplina (via URL do `notebook_id`)
- Cor `rounded-2xl`, sem bordas — o contraste de fundo já delimita

---

### B.3 Abas internas da disciplina

#### Aba 1 — Visão Geral
- KPI cards da disciplina: % Moodle (card azul preenchido), leituras feitas (card escuro), atividades pendentes (card escuro), dias até o próximo prazo (card vermelho se ≤ 3 dias)
- Lista compacta dos próximos prazos daquela disciplina (máx. 4 itens)
- Últimas 3 perguntas de quiz respondidas com resultado (✓ ou ✗)
- Botão "Iniciar sessão de estudo" — começa um timer que cria um `study_sessions` ao encerrar

#### Aba 2 — Materiais
- Lista de todas as leituras da disciplina, agrupadas por semana
- Cada item: título, badge de semana, badge "tem prazo" / "sem prazo definido", botão de status (pill clicável: `Pendente → Lendo → Concluída`)
- Itens concluídos ficam mais apagados (opacity 60%), não desaparecem
- Link direto para o material (URL) ao lado do título
- Badge "No Gemini Notebook" se `added_to_notebook = true`
- Estado vazio: "Nenhuma leitura sincronizada ainda" com ícone

#### Aba 3 — Caderno
- Área de texto livre para anotações do usuário (autosave com debounce 1s)
- Separados por semana: cada entrada tem label da semana e data
- Card destacado no topo quando há resumo gerado pelo agente (`is_ai_generated = true`): borda na cor de contexto, badge "Gerado pelo agente · Semana X"
- O resumo AI e as notas manuais coexistem — o usuário pode editar o resumo ou deixar como está
- Estado vazio: área de texto com placeholder "Suas notas para esta disciplina aparecem aqui"

#### Aba 4 — Quiz
- **Modo Praticar:** perguntas uma a uma com as 4 alternativas. Ao responder: feedback imediato (✓ verde / ✗ vermelho com a resposta correta destacada) + explicação abaixo. Botão "Próxima" para avançar.
- **Modo Revisão:** lista de todas as perguntas já respondidas com resultado, filtrável por semana e por resultado (só erros)
- **Painel de desempenho no topo:** total de questões respondidas, % de acerto geral, % de acerto por semana (gráfico de barras compacto, Framer Motion)
- Seletor de semana no topo da aba (todas as semanas / semana específica)
- Estado vazio: "Nenhuma questão gerada ainda — o agente irá criar questões após a próxima sincronização com o AVA"

#### Aba 5 — Prazos
- Calendário compacto só desta disciplina (visualização de lista, não grade)
- Cada item: badge de tipo (atividade avaliativa / avaliação entre pares / leitura / prova presencial), data, status, link direto para a página no AVA
- Ordenado por data, mais próximo no topo
- Filtro rápido: Todos / Pendentes / Concluídos
- Leituras sem prazo aparecem em seção separada no final: "Sem prazo definido"

---

### B.4 Tela de Quiz (modo foco — opcional, Nível 3)

Quando o usuário clica "Iniciar quiz da semana", pode abrir em modo foco (tela cheia do conteúdo):
- Fundo preto puro, sem sidebar, sem distrações
- Progresso no topo: "3 de 8 questões · 2 corretas"
- Pergunta centralizada, alternativas como cards clicáveis
- Transição suave entre questões (Framer Motion slide horizontal)
- Ao finalizar: tela de resultado com % de acerto, destaque das erradas e botão "Revisar erros"

---

### B.5 Cores e estados

- **Cor de contexto do módulo:** Royal Blue `#1C64EF` / Picton Blue `#7080FE` — herda da v1
- **Progresso Moodle:** barra azul `#1C64EF`
- **Progresso leituras:** barra `#7080FE`
- **Quiz correto:** verde `#22C55E`
- **Quiz errado:** vermelho `#F43F5E`
- **Resumo AI:** borda `#7080FE` com fundo `rgba(112, 128, 254, 0.08)`
- **Estado bloqueado (sem credenciais AVA):** card cinza com borda tracejada + "Integração com AVA pendente de autorização" — visível, não escondido
- **Estado vazio (autorizado, sem sync ainda):** ícone simples + texto explicativo em cada aba
