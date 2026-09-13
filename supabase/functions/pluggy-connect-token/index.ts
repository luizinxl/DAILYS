// Deploy: supabase functions deploy pluggy-connect-token
// Chamada (frontend): POST { itemId? } com header Authorization: Bearer <jwt do usuário> -> { connectToken }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getPluggyApiKey, pluggyFetch } from '../_shared/pluggy.ts';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Autenticação: exige um usuário Supabase válido antes de emitir o connect token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header ausente.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token JWT inválido.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'erro' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
