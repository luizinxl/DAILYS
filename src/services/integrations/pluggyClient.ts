// Client-side: fala com as Edge Functions (nunca com a Pluggy direto).
// O CLIENT_SECRET fica só no backend. Aqui só chamamos nossas functions.

import supabase from '@/config/supabase';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// Gera o connectToken para abrir o widget do Pluggy
export async function getConnectToken(itemId?: string): Promise<string> {
  const res = await fetch(`${FUNCTIONS_URL}/pluggy-connect-token`, {
    method: 'POST',
    headers: await authHeader(),
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) throw new Error('Falha ao gerar connect token');
  const data = await res.json();
  return data.connectToken;
}

// Dispara a sincronização completa de um Item
export async function syncPluggyItem(
  userId: string,
  connectionId: string,
  pluggyItemId: string
): Promise<{ created: number; updated: number }> {
  const res = await fetch(`${FUNCTIONS_URL}/pluggy-sync`, {
    method: 'POST',
    headers: await authHeader(),
    body: JSON.stringify({ userId, connectionId, pluggyItemId }),
  });
  if (!res.ok) throw new Error('Falha na sincronização Pluggy');
  return res.json();
}
