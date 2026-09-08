// Cliente Pluggy compartilhado. Autentica com CLIENT_ID/SECRET (secrets)
// e devolve uma apiKey temporária (válida ~2h) para as chamadas seguintes.

const PLUGGY_BASE = 'https://api.pluggy.ai';

export async function getPluggyApiKey(): Promise<string> {
  const clientId = Deno.env.get('PLUGGY_CLIENT_ID');
  const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    throw new Error('PLUGGY_CLIENT_ID/SECRET não configurados nos secrets');
  }

  const res = await fetch(`${PLUGGY_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao autenticar na Pluggy: ${res.status}`);
  }
  const data = await res.json();
  return data.apiKey as string;
}

export async function pluggyFetch(
  path: string,
  apiKey: string,
  init: RequestInit = {}
) {
  const res = await fetch(`${PLUGGY_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pluggy ${path} erro ${res.status}: ${body}`);
  }
  return res.json();
}

export { PLUGGY_BASE };
