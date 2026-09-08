// Edge Function: pluggy-sync
// Sincroniza contas, cartÃµes, transaÃ§Ãµes e investimentos de um Item
// da Pluggy para o Supabase. Usa a service_role key (backend) para gravar.
//
// Deploy: supabase functions deploy pluggy-sync
// Chamada: POST { userId, connectionId, pluggyItemId }

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { getPluggyApiKey, pluggyFetch } from '../_shared/pluggy.ts';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function mapInvestmentType(t: string): string {
  const map: Record<string, string> = {
    EQUITY: 'STOCK', FUND: 'FUND', FIXED_INCOME: 'FIXED_INCOME',
    ETF: 'ETF', SECURITY: 'FIXED_INCOME', COE: 'FIXED_INCOME',
  };
  return map[t] ?? 'FUND';
}

async function upsertByKey(table: string, keyCol: string, keyVal: string, payload: Record<string, unknown>) {
  const { data: existing } = await supabase
    .from(table).select('id').eq(keyCol, keyVal).maybeSingle();
  if (existing) {
    await supabase.from(table).update(payload).eq('id', existing.id);
    return 'updated';
  }
  await supabase.from(table).insert([payload]);
  return 'created';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const started = Date.now();
  let created = 0, updated = 0;

  try {
    const { userId, connectionId, pluggyItemId } = await req.json();
    if (!userId || !pluggyItemId) throw new Error('userId e pluggyItemId sÃ£o obrigatÃ³rios');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization header ausente.');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authUser) throw new Error('Token JWT inválido.');
    if (authUser.id !== userId) throw new Error('Usuário não autorizado para este userId.');

    const apiKey = await getPluggyApiKey();

    // 1) Contas
    const accounts = (await pluggyFetch(`/accounts?itemId=${pluggyItemId}`, apiKey)).results ?? [];

    for (const acc of accounts) {
      const r = await upsertByKey('bank_accounts', 'pluggy_account_id', acc.id, {
        user_id: userId,
        connection_id: connectionId,
        pluggy_account_id: acc.id,
        account_type: acc.type,
        account_subtype: acc.subtype,
        name: acc.name,
        marketing_name: acc.marketingName,
        number: acc.number,
        balance: acc.balance,
        currency: acc.currencyCode ?? 'BRL',
        updated_at: new Date().toISOString(),
      });
      r === 'created' ? created++ : updated++;

      // 1b) CartÃ£o de crÃ©dito
      if (acc.type === 'CREDIT' && acc.creditData) {
        const cd = acc.creditData;
        await upsertByKey('credit_cards', 'pluggy_account_id', acc.id, {
          user_id: userId,
          pluggy_account_id: acc.id,
          name: acc.name ?? acc.marketingName,
          brand: cd.brand,
          level: cd.level,
          last_four_digits: acc.number ? String(acc.number).slice(-4) : null,
          credit_limit: cd.creditLimit,
          available_limit: cd.availableCreditLimit,
          current_bill_amount: acc.balance,
          minimum_payment: cd.minimumPayment,
          updated_at: new Date().toISOString(),
        });
      }

      // 1c) TransaÃ§Ãµes da conta
      const txs = (await pluggyFetch(
        `/transactions?accountId=${acc.id}&pageSize=500`, apiKey
      )).results ?? [];
      for (const tx of txs) {
        const dedupKey = `pluggy_${tx.id}`;
        const { data: exists } = await supabase
          .from('transactions').select('id').eq('gmail_message_id', dedupKey).maybeSingle();
        if (!exists) {
          await supabase.from('transactions').insert([{
            user_id: userId,
            description: tx.description,
            amount: Math.abs(tx.amount),
            transaction_type: tx.amount < 0 ? 'expense' : 'income',
            category: tx.category ?? 'Outros',
            transaction_date: tx.date,
            status: 'completed',
            payment_method: tx.paymentData?.paymentMethod ?? 'card',
            gmail_message_id: dedupKey,
            notes: 'Importado via Open Finance (Pluggy)',
          }]);
        }
      }
    }

    // 2) Investimentos
    const investments = (await pluggyFetch(`/investments?itemId=${pluggyItemId}`, apiKey)).results ?? [];
    for (const inv of investments) {
      await upsertByKey('investments', 'pluggy_investment_id', inv.id, {
        user_id: userId,
        connection_id: connectionId,
        pluggy_investment_id: inv.id,
        ticker: inv.code,
        name: inv.name,
        investment_type: mapInvestmentType(inv.type),
        quantity: inv.quantity,
        average_price: inv.value,
        current_value: inv.balance,
        invested_amount: inv.amount,
        broker: inv.issuer,
        currency: inv.currencyCode ?? 'BRL',
        updated_at: new Date().toISOString(),
      });
    }

    // 3) Atualiza status da conexÃ£o
    if (connectionId) {
      await supabase.from('pluggy_connections').update({
        status: 'UPDATED',
        last_sync_at: new Date().toISOString(),
      }).eq('id', connectionId);
    }

    // 4) Log
    await supabase.from('sync_logs').insert([{
      user_id: userId, source: 'pluggy', module: 'financial',
      sync_type: 'full', status: 'success',
      items_created: created, items_updated: updated,
      duration_seconds: Math.round((Date.now() - started) / 1000),
    }]);

    return new Response(JSON.stringify({ created, updated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'erro';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
