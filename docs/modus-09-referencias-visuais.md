# MODUS — Referências visuais por aba (briefing de design)

> Origem: documento `REFERENCIAS DE DESIGN DE CADA ABA DO SITE.docx` enviado pelo usuário em 2026-09-12, com 4 imagens de referência e comentários diretos dele. Como o projeto não aceita upload de imagem, cada referência está descrita aqui em nível de estrutura/layout — detalhado o bastante para o Antigravity implementar sem ver a imagem.
>
> **Escopo:** este documento é **camada B (layout/design)**. Nada aqui muda hook, query, tabela ou regra de negócio. Ele complementa a seção 4 do documento mestre (`modus-00-visao-geral-e-design-system.md`) — a paleta e os tokens continuam sendo os de lá; o que muda é a **composição das telas**.

---

## Identidade visual — Logo e Splash Screen

> Enviado pelo usuário em 2026-09-12. Duas imagens: o ícone isolado (símbolo circular) e o logotipo completo com wordmark.

### Ícone (símbolo)

- Fundo preto puro (`#000000`).
- Anel circular branco, **espesso**, com **dois cortes verticais** no topo e embaixo — um à esquerda e outro à direita do centro, criando a impressão de um anel partido ao meio de forma simétrica.
- O anel ocupa cerca de 50% da área do quadrado; margens generosas em volta.
- Sem gradiente, sem sombra — vetorial puro, contraste máximo branco sobre preto.
- Arquivo: `/root/.claude/uploads/6f8efee5-6b20-52a5-a0d4-180caebc024f/891c0ab0-image.png`

### Wordmark (logotipo completo)

- Fundo preto puro (`#000000`), formato landscape.
- Texto **MODUS** em caixa alta, fonte geométrica futurista, peso médio, branco (`#FFFFFF`).
- A letra **O** do wordmark incorpora o mesmo ícone de anel partido — dois cortes verticais no topo e embaixo, idênticos ao símbolo isolado. Isso une o símbolo e o texto em uma identidade coesa.
- A letra **M** tem ângulo central levemente diferente do usual — mais angulado, estilo técnico.
- Letras com tracking (espaçamento) generoso, aparência tech/minimalista.
- Sem serifas, sem ornamentos, cantos arredondados nas extremidades das hastes.
- Arquivo: `/root/.claude/uploads/6f8efee5-6b20-52a5-a0d4-180caebc024f/c0d02069-image.jpg`

### Aplicação no app

- **Splash screen / tela de abertura:** fundo `#000000`, ícone centralizado durante o carregamento. Após ~1s, o wordmark completo (MODUS) aparece abaixo do ícone com fade-in suave. Animação opcional: o anel "fecha" os dois cortes girando levemente antes de revelar o wordmark.
- **Sidebar / topbar:** ícone (símbolo pequeno) + wordmark "MODUS" à direita, branco sobre fundo escuro — exatamente como descrito na Referência 1 (sidebar fixa à esquerda).
- **Favicon / ícone do app:** só o símbolo circular (sem o wordmark), fundo preto.
- **Tamanho mínimo do símbolo:** 24×24px — abaixo disso os cortes do anel ficam imperceptíveis.

---

## Referência Sidebar — estilo de barra lateral (app Prody, adaptado para MODUS)

> Enviado pelo usuário em 2026-09-12. Instrução explícita: **"quero esse estilo de barra lateral, claro respeitando os módulos do projeto, não copie os desse print, só use de ref"** — ou seja, a estrutura e a linguagem visual são o alvo; os itens de menu são os módulos do MODUS definidos na seção 4.4 do documento mestre.

### Estrutura geral

- **Sidebar fixa à esquerda**, fundo levemente acima do fundo base (`#12141C` sobre `#000000`), sem bordas visíveis — a separação é feita pela diferença de cor.
- **Largura compacta** — não é a sidebar larga de dashboard com labels extensos; é mais estreita, com ícone + label curto lado a lado. No breakpoint mobile a sidebar recolhe ou vira bottom nav.
- **Topo:** logo MODUS (símbolo circular + wordmark) alinhado à esquerda, com padding generoso abaixo.
- **Seção de módulos:** rotulada com um label pequeno em caps e cinza fraco (ex: `MÓDULOS`) acima da lista, com ícone de lápis/editar alinhado à direita do label — permite reordenar ou renomear módulos.
- **Itens de navegação:** cada item é uma linha com ícone à esquerda + label à direita. Padding vertical confortável entre itens (~12–14px). Sem separadores entre itens comuns.
- **Item ativo:** destaque com **fundo preenchido** em tom levemente mais claro/saturado (NÃO um underline, NÃO só mudança de cor de texto). No Prody é branco-sobre-preto; no MODUS usar o acento roxo do brand (`#7C5CFC` com ~15% de opacidade de fundo + texto/ícone em roxo vibrante), mantendo a identidade visual.
- **Ícones:** estilo outline/stroke, tamanho ~18–20px. Cada módulo tem seu ícone específico (não genérico).
- **Rodapé da sidebar:** avatar do usuário + nome (ex: "luiz") à esquerda, e ícone de configurações/tema à direita. O avatar é circular e pequeno (~28–32px).

### Mapeamento de módulos para a sidebar do MODUS

Ordem conforme seção 4.4 do documento mestre:

| Ícone sugerido | Label | Módulo |
|---|---|---|
| `🏠` / `home` | Início | Dashboard / Home |
| `✅` / `check-square` | Tarefas | Módulo de Tarefas |
| `💰` / `wallet` | Finanças | Módulo Financeiro |
| `📈` / `trending-up` | Invest | Módulo de Investimentos |
| `👤` / `user` | Pessoal | Módulo Pessoal |
| `🏡` / `house` | Casa | Módulo Doméstico |
| `⚙️` / `settings` | Config | Módulo Configurações |

> Os ícones acima são sugestões de estilo; o Antigravity deve usar a biblioteca de ícones já em uso no projeto (ex: Lucide React, Heroicons, ou a que estiver importada no `Layout.tsx`) — o critério é coerência com o que já existe, não mudar a biblioteca.

### Diferenças em relação à referência original que devem ser mantidas

1. **Paleta:** a referência usa verde (`#00C896` aprox.) como cor de marca; o MODUS mantém roxo/violeta (`#7C5CFC`). O item ativo no MODUS é roxo, não verde.
2. **Logo:** a referência tem wordmark "prody" em verde; o MODUS usa o símbolo circular + "MODUS" brancos, conforme a seção de identidade visual acima.
3. **Módulos:** os itens de menu são **exclusivamente os módulos do MODUS** listados no mapeamento acima — não importar os nomes da referência (Hoje, Cadernos, Universidade, Fitness, Compras, Alimentação, etc.).
4. **Botão "Novo espaço":** a referência tem um botão `+ Novo espaço` com borda logo abaixo do logo. **Não replicar** — o MODUS não tem esse conceito de "espaço". Se houver um CTA no topo da sidebar, discutir separadamente.

### Comportamento responsivo

- **Desktop (≥1024px):** sidebar expandida com ícone + label visíveis.
- **Tablet (768–1023px):** sidebar recolhida — só ícones, sem labels; tooltip no hover mostra o nome.
- **Mobile (<768px):** sidebar vira bottom navigation bar com os 5 módulos mais usados, ou um drawer deslizante acionado por hambúrguer.

### Aplicação no MODUS

- Substituir o `Layout.tsx` / componente de sidebar atual por esta composição.
- Manter o logo animado (`LogoDraw`) já existente no topo.
- O item ativo deve persistir o estado via React Router (`useLocation`) — o item cujo path está ativo recebe a classe de destaque.
- Restrição: **NÃO alterar hooks, queries Supabase, nomes de tabelas/colunas ou lógica de negócio** — só JSX/classes Tailwind/Framer Motion.

---

## Referência 1 — Finanças / Investimentos (dashboard fintech "First Bank", dark + roxo)

Duas telas do mesmo produto. A paleta bate quase exatamente com o design system atual do MODUS (fundo quase preto, acento roxo/violeta, verde para positivo, vermelho para negativo) — ou seja, **é a referência mais fácil de adotar, é basicamente evolução de layout, não troca de identidade**.

### 1.1 Estrutura geral (vale para as duas telas)

- **Sidebar fixa à esquerda**, estreita, fundo um tom acima do fundo base, cantos arredondados junto com o shell da aplicação. Logo circular + wordmark no topo; itens de menu com ícone + label; **item ativo destacado com um card preenchido em roxo claro**; "Log out" isolado no rodapé da sidebar.
- **Header da área de conteúdo:** saudação grande ("Hi Leyla 👋") com subtítulo pequeno em cinza logo abaixo ("Welcome back to your dashboard!"), e à direita: campo de busca pill arredondado, sino de notificação com badge numérico vermelho, avatar do usuário.
- **Conteúdo em cards `rounded-2xl`** sobre o fundo base, com respiro generoso entre eles.

### 1.2 Tela A — visão geral (Dashboard)

1. **Linha de 3 KPI cards** no topo: Total Balance / Savings / Credit Card.
   - O **card principal (saldo) é preenchido com o roxo de marca**; os outros dois ficam em fundo de card escuro. Esse contraste é o que dá hierarquia à linha.
   - Cada card: ícone pequeno no canto superior direito, label em cinza, **valor grande em negrito**, e abaixo a variação (`↑ +12.5% from last month` em verde / vermelho) ou um dado secundário (`Available: $7,819.25`).
2. **Quick Actions:** faixa com 3 botões-card horizontais lado a lado (Transfer Money / Pay Bills / Deposit). Cada um: quadrado de ícone colorido arredondado à esquerda (azul, verde, rosa), título em branco, subtítulo pequeno em cinza.
3. **Grade de duas colunas embaixo:**
   - Esquerda (~60%): **"Monthly Spending"** — gráfico de linha suave com área preenchida em degradê, pontos marcados nos vértices, seletor "This month" no canto superior direito do card; eixo Y com valores monetários, eixo X por semana (Week 1–4).
   - Direita (~40%): **"Recent Transactions"** compacto — lista simples (ícone quadrado colorido + nome + horário relativo "Today, 2:30 PM" + valor colorido à direita) com link "View All" no topo.

### 1.3 Tela B — extrato completo (Transações)

1. **"Monthly Transactions"** no topo: 3 cards resumo (Total Balance / Total Income / Total Expenses), cada um com **ícone quadrado colorido à esquerda** (azul, verde com seta pra cima, vermelho com seta pra baixo), label pequeno em cima e valor grande embaixo. Link "View detailed report" no canto do card-container.
2. **"Recent Transactions"** como **tabela** (não lista):
   - Barra de controles no topo: **segmented control** `All | Income | Outcome`, ícone de filtro, dropdown de período ("Month").
   - Colunas: **Transaction** (ícone colorido + nome + subtítulo cinza), **Category** (chip/pill colorido por categoria — laranja p/ alimentação, verde p/ receita, roxo p/ compras, azul p/ transporte, vermelho p/ contas), **Date**, **Account**, **Amount** (com sinal, verde ou vermelho), **Action** (ícones: ver / editar / baixar).
   - Rodapé: "Showing 1-5 of 124 transactions" à esquerda + paginação numérica (`Previous 1 2 3 Next`) à direita, com a página ativa em roxo.

### 1.4 Aplicação no MODUS

- Aba **Finanças**: adotar a Tela B (tabela com chips de categoria, segmented control, paginação) para o extrato, e a Tela A para o topo da aba (KPI cards + gráfico mensal).
- Aba **Invest**: manter a seção "Visão geral do mercado" no topo, mas reformatá-la no padrão dos **KPI cards** da Tela A (Ibovespa como card roxo preenchido, dólar e altas/baixas como cards escuros).
- Os chips de categoria já implicam uma paleta por categoria — derivar das cores já existentes no design system, sem inventar tons novos.

---

## Referência 2 — Acadêmico / Agenda (dashboard de calendário dark azul)

### 2.1 Comentário literal do usuário

> "Quero esse estilo acima, com os dias clicáveis para ver os prazos das atividades, mas não podemos esquecer que **preciso saber quais leituras/atividade foram atribuídas a mim**"

Ou seja: o visual é o alvo, mas o requisito funcional inegociável é **saber o que foi atribuído a ele** — não basta um calendário bonito com datas soltas.

### 2.2 Estrutura

- **Header:** saudação grande contextual ("Morning, Alex!") + subtítulo ("Here's what's on your agenda today."), busca pill e sino à direita.
- **Barra de navegação do calendário:** dropdown de **mês** + dropdown de **ano** à esquerda, setas `‹ ›` de anterior/próximo à direita.
- **Grade mensal 7 colunas** (Sunday → Saturday), células altas e retangulares com cantos arredondados e borda sutil:
  - Número do dia no canto superior esquerdo.
  - Dentro da célula, **mini-chips dos eventos daquele dia**: uma barra/ponto colorido + texto minúsculo (ex. "Weekly Stand-up", "Project Deadline", "Yoga Session"). Até 2–3 por célula, o resto colapsa.
  - **Dia selecionado com preenchimento azul sólido**; dia de hoje com borda/anel azul; dias de outro mês com opacidade reduzida.
- **Ao clicar num dia, abre um painel de detalhe** sobreposto à grade (no referencial é um modal "Brainstorm Session" com campos Date, Type com dropdown, Hour com stepper de início/fim, Note, Members com avatares, e botão **Save** em azul).
- **Coluna lateral direita "Scheduled"** com a agenda do dia selecionado, organizada **por horário** (09:00, 10:00, 13:00…). Cada evento é um card com **barra colorida no topo** (cor = tipo do evento), título, subtítulo, faixa de horário e duração à direita ("45 min", "1 hour", "2 hours"), e, quando aplicável, um botão inline (ex. "Meet Link").
- **Sidebar vertical estreita só de ícones** na borda esquerda, avatar no rodapé.

### 2.3 Aplicação no MODUS (aba Acadêmico e aba Agenda)

- Adotar essa composição como **layout oficial da aba Acadêmico**: grade mensal navegável à esquerda + painel lateral do dia à direita.
- **Cores dos pontos/chips por tipo de item** (unificando com o briefing do agente AVA — ver `modus-01-modulo-academico.md`):
  - 🔴 Vermelho — prazo de entrega de atividade avaliativa
  - 🟣 Roxo/teal — janela de avaliação entre pares
  - 🟢 Verde — início de atividade ou leitura liberada
  - 🔵 Azul — prova presencial (e o **período de provas inteiro destacado em azul na grade**)
- Cor de contexto do módulo continua Royal Blue `#1C64EF` / Picton Blue `#7080FE` — a referência é azul, então há aderência natural.
- **Requisito funcional que a referência não mostra e que é obrigatório:** cada item do painel do dia tem que dizer **disciplina, tipo (prazo / leitura / prova / revisão), status (pendente / entregue) e link direto pra página no AVA**. Leitura sem prazo formal também aparece, marcada como "sem prazo definido".
- A aba **Agenda** (módulo 06) reaproveita o mesmo componente de calendário, com outra fonte de eventos.

---

## Referência 3 — Casa / tarefas domésticas / lembretes (app de tarefas mobile, dark + verde-limão)

### 3.1 Comentário literal do usuário

> "Algo assim, lembrando que **tem o pc tbm**"

Ou seja: a referência é mobile (3 telas de celular), mas a implementação tem que funcionar igualmente bem no desktop — mesma linguagem visual, expandida em colunas, não uma coluna estreita centralizada numa tela de 1440px.

### 3.2 Estrutura

- **Topo:** segmented control em pills `Tasks | Lists`, com o ativo em branco sobre preto; ícones de busca e engrenagem à direita.
- **Lista agrupada por data:** cada grupo tem cabeçalho `26 Sep · Thu` e um botão `+` à direita do cabeçalho (adicionar tarefa direto naquele dia).
  - O grupo do dia atual vira um **card destacado** com título grande ("1 Task for today") e os itens dentro.
  - Itens: checkbox à esquerda + texto; emoji/ícone livre no texto ("Greek yogurt 🥣", "Complete Assignment ⚡").
  - **Estado de conclusão:** quando todas as tarefas do dia são concluídas, o card inteiro fica **destacado em verde-limão** com mensagem de parabéns ("Nice work! You've wrapped up all tasks for today.") e o item aparece riscado. É o momento de recompensa visual do app.
- **Separadores de mês** em texto grande ("October 2024") entre os grupos.
- **Sheet de "Add new task"** subindo de baixo, com **fundo em degradê verde → amarelo** e o formulário num card preto por cima: campo "Enter Task", campo de data com ícone de calendário ("28 Sep, 2024"), dropdown "Add to" (qual lista), dois checkboxes lado a lado — **"Notify Me"** e **"Give Priority"** — e botão branco largo "Add Task".
- **Bottom nav** de 3 itens: Tasks / **botão `+` central em círculo verde** (vira `×` quando o sheet está aberto) / Notes.

### 3.3 Aplicação no MODUS (aba Casa)

- Adotar: agrupamento por data com cabeçalho + `+` por grupo, card destacado do dia atual, estado de conclusão comemorativo, sheet/modal de criação com "notificar" e "prioridade" como toggles, separador de mês.
- **Desktop:** a mesma lista vira **duas colunas** (tarefas domésticas | lista de compras, que já existem no módulo), o bottom nav vira a sidebar existente do MODUS, e o sheet de criação vira um modal centralizado com o mesmo formulário.
- **Decisão de cor (padrão adotado, reversível):** o verde-limão da referência **não** substitui o roxo como cor do módulo Doméstico. O roxo continua sendo a cor de contexto; o verde-limão entra **só no estado "tudo concluído"** (card de comemoração) e no botão de ação primário `+`. Se você preferir trocar de vez o módulo Casa para a paleta lima/amarelo, é uma linha de decisão — diga e eu atualizo a seção 4.2 do documento mestre.

---

## Regra de leitura deste documento

Ao pedir mudança visual de uma aba ao Antigravity, referencie **esta seção + a seção 4.5 do documento mestre**, por exemplo:

```
Contexto: MODUS, dark mode preto puro (#000000), ver seção 4 do documento mestre
e a Referência Sidebar de modus-09-referencias-visuais.md.
Componente afetado: Layout.tsx / sidebar
Mudança pedida: reformatar a sidebar no padrão da Referência Sidebar
(fundo #12141C, ícone+label por módulo, item ativo com fundo roxo ~15% opacidade
+ texto/ícone em #7C5CFC, label "MÓDULOS" em caps cinza no topo da lista,
rodapé com avatar + nome do usuário).
Restrição: NÃO alterar hooks, queries Supabase, nomes de tabelas/colunas ou
lógica de negócio — só JSX/classes Tailwind/props de animação.
```
