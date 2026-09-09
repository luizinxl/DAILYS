import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PortfolioSummary } from '../../hooks/useInvestments';

interface Props {
  summary: PortfolioSummary;
  className?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  STOCK: { label: 'Ações', color: '#7C5CFC' },
  FII: { label: 'FIIs', color: '#10B981' },
  FIXED_INCOME: { label: 'Renda Fixa', color: '#F59E0B' },
  CRYPTO: { label: 'Cripto', color: '#A855F7' },
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
      <div className={`flex flex-col items-center justify-center p-8 bg-[#161924] rounded-2xl border border-[#222736] ${className}`}>
        <p className="text-[#8E95A5] text-sm font-medium">Nenhum ativo alocado na carteira</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-6 bg-[#161924] rounded-2xl border border-[#222736] shadow-lg shadow-black/20 flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-base">Alocação por Classe</h3>
          <p className="text-xs text-[#8E95A5]">Distribuição patrimonial por tipo de ativo</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#6B7280]">Total Carteira</span>
          <p className="font-bold text-white text-sm">
            {formatCurrency(summary.totalCurrentValue)}
          </p>
        </div>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: any = payload[0];
                  return (
                    <div className="bg-[#12141F] text-white text-xs p-2.5 rounded-xl shadow-xl border border-[#2B3145]">
                      <span className="text-[#8E95A5]">{data.payload.name}: </span>
                      <strong>{formatCurrency(data.value)}</strong>
                      <div className="text-[10px] text-[#9B82FF] mt-0.5">{data.payload.percent.toFixed(1)}% da carteira</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.type}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-xs text-[#8E95A5] font-medium">
                  {value} ({entry.payload.percent.toFixed(0)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PortfolioAllocationChart;
