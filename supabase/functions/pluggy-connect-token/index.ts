// Edge Function: pluggy-connect-token
// Gera um connectToken temporário para o widget do Pluggy no frontend.
// O frontend chama esta função; ela usa o CLIENT_SECRET (nunca exposto)
// e devolve só o token curto e seguro para abrir o widget.
//
// Deploy: supabase functions deploy pluggy-connect-token
// Chamada (frontend): POST { itemId? } -> { connectToken }

import { getPluggyApiKey, pluggyFetch } from '../_shared/pluggy.ts';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let itemId: string | undefined;
    try {
      const body = await req.json();
      itemId = body?.itemId;
    } catch {
      // sem body é ok (primeira conexão)
    }

    const apiKey = await getPluggyApiKey();

    // itemId opcional: passado quando o usuário está reconectando um Item
    const payload = itemId ? { itemId } : {};
    const data = await pluggyFetch('/connect_token', apiKey, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return new Response(
      JSON.stringify({ connectToken: data.accessToken }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'erro' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
