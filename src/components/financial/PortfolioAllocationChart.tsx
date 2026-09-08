import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PortfolioSummary } from '../../hooks/useInvestments';

interface Props {
  summary: PortfolioSummary;
  className?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  STOCK: { label: 'Ações', color: '#3B82F6' },
  FII: { label: 'FIIs', color: '#10B981' },
  FIXED_INCOME: { label: 'Renda Fixa', color: '#F59E0B' },
  CRYPTO: { label: 'Cripto', color: '#8B5CF6' },
  BDR: { label: 'BDRs', color: '#EC4899' },
  ETF: { label: 'ETFs', color: '#06B6D4' },
  FUND: { label: 'Fundos', color: '#6B7280' },
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const PortfolioAllocationChart: React.FC<Props> = ({ summary, className = '' }) => {
  const chartData = useMemo(() => {
    return Object.entries(summary.allocationByType)
      .filter(([, data]) => data.value > 0)
      .map(([type, data]) => ({
        type,
        name: TYPE_CONFIG[type]?.label || type,
        value: data.value,
        percent: data.percent,
        color: TYPE_CONFIG[type]?.color || '#9CA3AF',
      }));
  }, [summary]);

  if (summary.totalCurrentValue === 0 || chartData.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
        <p className="text-zinc-500 text-sm font-medium">Nenhum ativo alocado na carteira</p>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">Alocação por Classe</h3>
          <p className="text-xs text-zinc-500">Distribuição patrimonial por tipo de ativo</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-400">Total Carteira</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            {formatCurrency(summary.totalCurrentValue)}
          </p>
        </div>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number, _name: string, item: any) => [
                `${formatCurrency(value)} (${item.payload.percent.toFixed(1)}%)`,
                item.payload.name,
              ]}
            />
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.type}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {value} ({entry.payload.percent.toFixed(0)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioAllocationChart;
