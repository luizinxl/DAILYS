// Supabase Edge Function: google-finance
// Busca dados de mercado global via Yahoo Finance (endpoint público, sem key).
// Roda no servidor — evita CORS e expõe apenas o necessário ao frontend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Símbolos que representam "Google Finance-like" market overview
// Yahoo Finance usa os mesmos tickers que o Google Finance
const DEFAULT_SYMBOLS = {
  // Índices globais
  indices: [
    '^GSPC',    // S&P 500
    '^IXIC',    // Nasdaq
    '^DJI',     // Dow Jones
    '^FTSE',    // FTSE 100 (UK)
    '^N225',    // Nikkei 225 (JP)
  ],
  // Moedas
  currencies: [
    'USDBRL=X',   // Dólar → Real
    'EURBRL=X',   // Euro → Real
    'BTCUSD=X',   // Bitcoin em USD
  ],
};

interface Quote {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  currency: string;
  marketState: string;
}

async function fetchYahooQuotes(symbols: string[]): Promise<Quote[]> {
  const joined = symbols.join('%2C');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}&fields=shortName,longName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,currency,marketState`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Modus/1.0)',
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance error: ${res.status}`);
  }

  const json = await res.json();
  const results: Quote[] = json?.quoteResponse?.result ?? [];
  return results.map((q: any) => ({
    symbol: q.symbol,
    shortName: q.shortName ?? q.symbol,
    longName: q.longName ?? q.shortName ?? q.symbol,
    regularMarketPrice: q.regularMarketPrice ?? 0,
    regularMarketChange: q.regularMarketChange ?? 0,
    regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
    currency: q.currency ?? 'USD',
    marketState: q.marketState ?? 'CLOSED',
  }));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const allSymbols = [
      ...DEFAULT_SYMBOLS.indices,
      ...DEFAULT_SYMBOLS.currencies,
    ];

    const quotes = await fetchYahooQuotes(allSymbols);

    // Organizar por categoria
    const indicesSymbols = new Set(DEFAULT_SYMBOLS.indices);
    const currenciesSymbols = new Set(DEFAULT_SYMBOLS.currencies);

    const indices = quotes.filter((q) => indicesSymbols.has(q.symbol));
    const currencies = quotes.filter((q) => currenciesSymbols.has(q.symbol));

    const payload = {
      indices,
      currencies,
      fetchedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Erro interno' }),
      {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
