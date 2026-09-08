import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { getHistory, HistoryPoint } from '../../services/integrations/brapiService';

interface Props {
  ticker: string;
  averagePrice?: number;
  className?: string;
}

type RangeOption = '1mo' | '3mo' | '6mo' | '1y' | 'max';

const RANGE_LABELS: { label: string; value: RangeOption }[] = [
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1A', value: '1y' },
  { label: 'MAX', value: 'max' },
];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const PositionHistoryChart: React.FC<Props> = ({ ticker, averagePrice, className = '' }) => {
  const [range, setRange] = useState<RangeOption>('3mo');
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!ticker) return;
      setLoading(true);
      const data = await getHistory(ticker, range, range === '1mo' ? '1d' : '1wk');
      if (mounted) {
        setHistory(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [ticker, range]);

  const firstClose = history[0]?.close || 0;
  const lastClose = history[history.length - 1]?.close || 0;
  const periodReturn = firstClose > 0 ? ((lastClose - firstClose) / firstClose) * 100 : 0;
  const isPositive = periodReturn >= 0;
  const chartColor = isPositive ? '#10B981' : '#EF4444';

  const chartData = history.map((item) => ({
    date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    fullDate: new Date(item.date * 1000).toLocaleDateString('pt-BR'),
    close: item.close,
  }));

  return (
    <div className={`p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{ticker.toUpperCase()}</h3>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              }`}
            >
              {periodReturn > 0 ? `+${periodReturn.toFixed(2)}%` : `${periodReturn.toFixed(2)}%`}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {lastClose > 0 ? formatCurrency(lastClose) : '--'}
            </span>
            {!!averagePrice && averagePrice > 0 && (
              <span className="text-xs text-zinc-500">
                PM: <strong className="text-zinc-700 dark:text-zinc-300">{formatCurrency(averagePrice)}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          {RANGE_LABELS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === r.value
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">Carregando…</div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
            Histórico não disponível para {ticker}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$${val.toFixed(0)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d: any = payload[0].payload;
                    return (
                      <div className="bg-zinc-900 text-white text-xs p-3 rounded-lg shadow-xl border border-zinc-700">
                        <p className="text-zinc-400 mb-1">{d.fullDate}</p>
                        <p className="font-bold text-sm">{formatCurrency(d.close)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {!!averagePrice && averagePrice > 0 && (
                <ReferenceLine
                  y={averagePrice}
                  stroke="#6366F1"
                  strokeDasharray="4 4"
                  label={{ value: `PM ${formatCurrency(averagePrice)}`, fill: '#6366F1', fontSize: 10, position: 'top' }}
                />
              )}
              <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${ticker})`} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PositionHistoryChart;
