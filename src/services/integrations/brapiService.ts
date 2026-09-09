// Cotações da B3 via brapi.dev (frontend-safe).
// Token em VITE_BRAPI_TOKEN. Alguns tickers de teste funcionam sem token.

const BASE = 'https://brapi.dev/api';
const TOKEN = import.meta.env.VITE_BRAPI_TOKEN ?? '';

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  return null;
}

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

export interface MarketOverview {
  index?: Quote | null; // IBOV
  usdBrl?: Quote | null; // USD-BRL exchange rate
  topGainers: Quote[]; // Highest positive change percent
  topLosers: Quote[]; // Highest negative change percent
}

/** Helper to perform a fetch with simple retry on 429 (rate limiting). */
async function fetchWithRetryForMarket(url: string, attempts = 2): Promise<any> {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if (res.status === 429 && attempts > 1) {
    await new Promise((r) => setTimeout(r, 500));
    return fetchWithRetryForMarket(url, attempts - 1);
  }
  return null;
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const indexUrl = `${BASE}/quote/%5EBVSP?token=${TOKEN}`;
  const usdUrl = `${BASE}/quote/USD-BRL?token=${TOKEN}`;
  const listUrl = `${BASE}/quote/list?limit=200&token=${TOKEN}`;

  const [indexData, usdData, listData] = await Promise.all([
    fetchWithRetryForMarket(indexUrl),
    fetchWithRetryForMarket(usdUrl),
    fetchWithRetryForMarket(listUrl),
  ]);

  const indexQuote = indexData?.results?.[0] ?? null;
  const usdQuote = usdData?.results?.[0] ?? null;
  const allQuotes: Quote[] = listData?.results ?? [];

  const sorted = [...allQuotes].sort(
    (a, b) => (b.regularMarketChangePercent ?? 0) - (a.regularMarketChangePercent ?? 0)
  );
  const topGainers = sorted.slice(0, 5);
  const topLosers = [...sorted].reverse().slice(0, 5);

  return {
    index: indexQuote,
    usdBrl: usdQuote,
    topGainers,
    topLosers,
  };
}

