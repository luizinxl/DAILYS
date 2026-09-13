import { Card } from '@/components/common/Card';
import { useInvestments } from '../../hooks/useInvestments';
import { useMarketOverview } from '../../hooks/useMarketOverview';
import { useModuleColors, defaultModuleColors } from '@/hooks/useModuleColors';
import { PortfolioAllocationChart } from '../../components/financial/PortfolioAllocationChart';
import { PortfolioEvolutionChart } from '../../components/financial/PortfolioEvolutionChart';
import { PositionHistoryChart } from '../../components/financial/PositionHistoryChart';

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Page() {
  const { positions, portfolioSummary, loading, error, refresh } = useInvestments();
  const { overview, loading: overviewLoading, error: overviewError, refresh: refreshOverview } = useMarketOverview();

  const { colors } = useModuleColors();
  const themeColor = colors['investimentos'] || defaultModuleColors['investimentos'] || '#3B82F6';

  const handleRefresh = () => {
    refresh();
    refreshOverview();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: themeColor }}>
            Investimentos
          </h1>
          <p className="text-[#8E95A5] text-sm mt-1">Carteira em tempo real (brapi & Google Finance) e insights de mercado.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || overviewLoading}
          className="px-4 py-2 rounded-xl disabled:opacity-50 text-white text-sm font-medium transition-all shadow-lg active:scale-95"
          style={{ backgroundColor: themeColor, boxShadow: `0 4px 14px -4px ${themeColor}80` }}
        >
          {loading || overviewLoading ? 'Atualizando...' : 'Atualizar cotações'}
        </button>
      </div>

      <Card variant="financial" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Visão geral do mercado</h2>
          <span className="text-xs text-[#8E95A5]">via brapi & Google Finance</span>
        </div>

        {overviewError && (
          <p className="text-sm text-[#F43F5E]">{overviewError}</p>
        )}

        {!overviewError && overviewLoading && !overview && (
          <p className="text-sm text-[#8E95A5]">Carregando cotações...</p>
        )}

        {!overviewError && overview && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#1D2029] border border-[#232735] p-4">
                <p className="text-xs text-[#8E95A5] mb-1">Ibovespa</p>
                {overview.index ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">{formatPrice(overview.index.regularMarketPrice)}</span>
                    <span className={`text-sm font-semibold ${overview.index.regularMarketChangePercent >= 0 ? 'text-[#2ECC71]' : 'text-[#F43F5E]'}`}>
                      {formatPercent(overview.index.regularMarketChangePercent)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-[#8E95A5]">Indisponível</p>
                )}
              </div>
              <div className="rounded-xl bg-[#1D2029] border border-[#232735] p-4">
                <p className="text-xs text-[#8E95A5] mb-1">Dólar (USD/BRL)</p>
                {overview.usdBrl ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">R$ {formatPrice(overview.usdBrl.regularMarketPrice)}</span>
                    <span className={`text-sm font-semibold ${overview.usdBrl.regularMarketChangePercent >= 0 ? 'text-[#2ECC71]' : 'text-[#F43F5E]'}`}>
                      {formatPercent(overview.usdBrl.regularMarketChangePercent)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-[#8E95A5]">Indisponível</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#8E95A5] mb-2 uppercase tracking-wide">Maiores altas</p>
                <div className="space-y-2">
                  {overview.topGainers.length === 0 && (
                    <p className="text-sm text-[#8E95A5]">Sem dados no momento.</p>
                  )}
                  {overview.topGainers.map((q) => (
                    <div key={q.symbol} className="flex items-center justify-between rounded-lg bg-[#1D2029] border border-[#232735] px-3 py-2">
                      <span className="text-sm text-white font-medium">{q.symbol}</span>
                      <span className="text-sm font-semibold text-[#2ECC71]">{formatPercent(q.regularMarketChangePercent)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#8E95A5] mb-2 uppercase tracking-wide">Maiores baixas</p>
                <div className="space-y-2">
                  {overview.topLosers.length === 0 && (
                    <p className="text-sm text-[#8E95A5]">Sem dados no momento.</p>
                  )}
                  {overview.topLosers.map((q) => (
                    <div key={q.symbol} className="flex items-center justify-between rounded-lg bg-[#1D2029] border border-[#232735] px-3 py-2">
                      <span className="text-sm text-white font-medium">{q.symbol}</span>
                      <span className="text-sm font-semibold text-[#F43F5E]">{formatPercent(q.regularMarketChangePercent)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <Card variant="financial" className="p-6">
          <p className="text-sm text-[#F43F5E]">{error}</p>
        </Card>
      )}

      {!error && positions.length === 0 && !loading && (
        <Card variant="financial" className="p-6">
          <p className="text-sm text-[#8E95A5] leading-relaxed">
            Nenhum investimento cadastrado ainda na tabela <code className="bg-[#1D212F] text-[#9B82FF] px-1.5 py-0.5 rounded text-xs">investments</code>. Assim que houver posições, a carteira aparece aqui automaticamente.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioAllocationChart summary={portfolioSummary} />
        <PortfolioEvolutionChart currentSummary={portfolioSummary} />
      </div>

      {positions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Histórico da maior posição ({positions[0].ticker})</h2>
          <PositionHistoryChart ticker={positions[0].ticker} averagePrice={positions[0].average_price} />
        </div>
      )}
    </div>
  );
}
