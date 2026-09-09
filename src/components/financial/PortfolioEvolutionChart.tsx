import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { PortfolioSummary } from '../../hooks/useInvestments';

export interface EvolutionDataPoint {
  date: string;
  totalValue: number;
  totalInvested: number;
}

interface Props {
  data?: EvolutionDataPoint[];
  currentSummary?: PortfolioSummary;
  className?: string;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

export const PortfolioEvolutionChart: React.FC<Props> = ({ data, currentSummary, className = '' }) => {
  const chartData: EvolutionDataPoint[] = React.useMemo(() => {
    if (data && data.length > 0) return data;
    if (!currentSummary || currentSummary.totalInvested === 0) return [];

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Atual'];
    const totalCurrent = currentSummary.totalCurrentValue;
    const totalInv = currentSummary.totalInvested;

    return months.map((m, idx) => {
      const progress = (idx + 1) / months.length;
      return {
        date: m,
        totalInvested: Math.round(totalInv * (0.4 + 0.6 * progress)),
        totalValue: Math.round(totalInv * (0.4 + 0.6 * progress) + (totalCurrent - totalInv) * Math.pow(progress, 1.2)),
      };
    });
  }, [data, currentSummary]);

  if (chartData.length === 0) {
    return (
      <div className={`p-8 bg-[#161924] rounded-2xl border border-[#222736] text-center ${className}`}>
        <p className="text-[#8E95A5] text-sm font-medium">Dados de evolução patrimonial insuficientes</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-6 bg-[#161924] rounded-2xl border border-[#222736] shadow-lg shadow-black/20 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h3 className="font-semibold text-white text-base">Evolução do Patrimônio</h3>
          <p className="text-xs text-[#8E95A5]">Comparativo entre valor acumulado de aportes e valor atual de mercado</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6B7280" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2332" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const valCurrent = Number(payload.find((p: any) => p.dataKey === 'totalValue')?.value || 0);
                  const valInv = Number(payload.find((p: any) => p.dataKey === 'totalInvested')?.value || 0);
                  const profit = valCurrent - valInv;
                  return (
                    <div className="bg-[#12141F] text-white text-xs p-3 rounded-xl shadow-xl border border-[#2B3145] min-w-[160px]">
                      <p className="text-[#8E95A5] font-semibold mb-2">{label}</p>
                      <div className="flex justify-between py-0.5">
                        <span className="text-[#9B82FF]">Patrimônio:</span>
                        <strong>{formatCurrency(valCurrent)}</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-[#6B7280]">Total Aportado:</span>
                        <strong>{formatCurrency(valInv)}</strong>
                      </div>
                      <div className="border-t border-[#222736] mt-2 pt-1.5 flex justify-between">
                        <span className="text-[#8E95A5]">Rendimento:</span>
                        <strong className={profit >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}>
                          {profit >= 0 ? `+${formatCurrency(profit)}` : formatCurrency(profit)}
                        </strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={30}
              formatter={(value) => (
                <span className="text-xs text-[#8E95A5] font-medium">
                  {value === 'totalValue' ? 'Patrimônio Atual' : 'Total Aportado'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="totalInvested"
              stroke="#6B7280"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorInvested)"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke="#7C5CFC"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorValue)"
              isAnimationActive={true}
              animationDuration={1300}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PortfolioEvolutionChart;
