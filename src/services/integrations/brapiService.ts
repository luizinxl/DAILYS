// Cotações da B3 via brapi.dev (frontend-safe).
// Token em VITE_BRAPI_TOKEN. Alguns tickers de teste funcionam sem token.

const BASE = 'https://brapi.dev/api';
const TOKEN = import.meta.env.VITE_BRAPI_TOKEN ?? '';

export interface Quote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketVolume?: number;
  marketCap?: number;
  shortName?: string;
  longName?: string;
}

export async function getQuotes(tickers: string[]): Promise<Quote[]> {
  if (tickers.length === 0) return [];
  const url = `${BASE}/quote/${tickers.join(',')}?token=${TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`brapi erro ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

export interface HistoryPoint {
  date: number;
  close: number;
}

export async function getHistory(
  ticker: string,
  range = '3mo',
  interval = '1d'
): Promise<HistoryPoint[]> {
  const url = `${BASE}/quote/${ticker}?range=${range}&interval=${interval}&token=${TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`brapi histórico erro ${res.status}`);
  const data = await res.json();
  return data.results?.[0]?.historicalDataPrice ?? [];
}

export async function searchAssets(query: string): Promise<string[]> {
  const url = `${BASE}/available?search=${encodeURIComponent(query)}&token=${TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.stocks ?? [];
}
