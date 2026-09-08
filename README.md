# dailyS

Hub pessoal que reúne, num só lugar: **acadêmico**, **financeiro**,
**investimentos**, **doméstico** e **desenvolvimento pessoal**.

Stack: React 18 + TypeScript + Vite + Tailwind + Framer Motion + Supabase.
Integrações: Pluggy (Open Finance), brapi (bolsa B3), Gmail, Antigravity.

---

## 🚀 Runbook — do zero ao ar

### 1. Rodar localmente
```bash
npm install
cp .env.example .env.local   # preencher as chaves (ver passo 4)
npm run dev                  # http://localhost:5173
```

### 2. Criar o repositório no GitHub
```bash
git init
git add .
git commit -m "chore: scaffold inicial do dailyS"
git branch -M main
# crie um repo vazio em github.com/new (nome: dailys), depois:
git remote add origin https://github.com/SEU_USUARIO/dailys.git
git push -u origin main
```

### 3. Conectar ao Supabase
1. Crie um projeto em https://supabase.com
2. Em **SQL Editor**, rode na ordem:
   - `supabase/01-schema-base.sql`
   - `supabase/02-schema-expansao.sql`
3. Em **Authentication → Providers**: ative Email/Password e Google
4. Em **Project Settings → API**: copie `Project URL` e `anon key`

### 4. Pegar as chaves (colar no .env.local)
- **Supabase**: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (passo 3.4)
- **brapi**: gere o token em https://brapi.dev/dashboard → `VITE_BRAPI_TOKEN`
- **Pluggy** (só backend / Edge Functions — NÃO vai no .env.local do front):
  1. Conecte seus bancos em https://meu.pluggy.ai (uso pessoal, grátis)
  2. Pegue `CLIENT_ID` e `CLIENT_SECRET` no Dashboard da Pluggy
  3. Configure como secrets nas Edge Functions:
     `supabase secrets set PLUGGY_CLIENT_ID=... PLUGGY_CLIENT_SECRET=...`

### 5. Deploy na Vercel
1. https://vercel.com → **Add New → Project** → importe o repo do GitHub
2. Framework: **Vite** (autodetecta)
3. Em **Environment Variables**, adicione:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BRAPI_TOKEN`
4. **Deploy**. Pronto — cada push na `main` atualiza automático.

### 6. Entregar pro Antigravity
1. Abra o repositório clonado no Antigravity
2. Selecione o modelo por tarefa (ver `docs/divisao-tarefas-antigravity.md`)
3. Cole cada bloco de prompt. Sugestão de paralelismo: A + C + E, depois B + D + F
4. Aprove os passos conforme o agente trabalha

---

## 📁 Estrutura
```
src/
  components/   layout, common, e por módulo
  contexts/     AuthContext
  hooks/        useMobileDetect, (demais criados pelo agente)
  pages/        Dashboard + 1 página por módulo
  services/     integrations (brapi), api, ai
  types/        tipos centrais
  styles/       design system (dark)
supabase/
  01-schema-base.sql
  02-schema-expansao.sql
  functions/    Edge Functions (Pluggy sync, email cron)
docs/
  divisao-tarefas-antigravity.md   ← prompts prontos por modelo
  servicos-referencia.ts.txt       ← Pluggy/insights/email (referência)
  design-system.md
```

## ⚠️ Notas
- Cotações da brapi no plano grátis têm pequeno atraso — ok para dashboard pessoal.
- Insights de IA são **educativos, não recomendação de investimento**.
- `CLIENT_SECRET` da Pluggy nunca vai pro frontend — só em Edge Function.
