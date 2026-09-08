# Edge Functions — dailyS

## Pré-requisitos
```bash
npm install -g supabase       # ou: brew install supabase/tap/supabase
supabase login
supabase link --project-ref SEU_PROJECT_REF
```

## Configurar os secrets (só uma vez)
```bash
supabase secrets set PLUGGY_CLIENT_ID=2b27c4df-172f-4d3b-8ada-0c7460b29fae
supabase secrets set PLUGGY_CLIENT_SECRET=SEU_SECRET_AQUI
```
> SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já são injetados automaticamente
> nas Edge Functions — não precisa setar.

## Deploy
```bash
supabase functions deploy pluggy-connect-token
supabase functions deploy pluggy-sync
```

## Testar
```bash
# gerar connect token
curl -X POST "https://SEU_PROJECT_REF.supabase.co/functions/v1/pluggy-connect-token" \
  -H "Authorization: Bearer SUA_ANON_KEY" -H "Content-Type: application/json" -d '{}'

# sincronizar (depois de conectar um banco no widget)
curl -X POST "https://SEU_PROJECT_REF.supabase.co/functions/v1/pluggy-sync" \
  -H "Authorization: Bearer SUA_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"userId":"UUID","connectionId":"UUID","pluggyItemId":"ITEM_ID"}'
```

## Fluxo completo
1. Frontend chama `getConnectToken()` → abre o widget do Pluggy
2. Usuário conecta o banco no widget → recebe um `itemId`
3. Salva uma linha em `pluggy_connections` com esse `itemId`
4. Frontend chama `syncPluggyItem(userId, connectionId, itemId)`
5. A function puxa tudo e grava contas/cartões/transações/investimentos
