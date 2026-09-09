import { Card } from '@/components/common/Card';
import { useInvestments } from '../../hooks/useInvestments';
import { PortfolioAllocationChart } from '../../components/financial/PortfolioAllocationChart';
import { PortfolioEvolutionChart } from '../../components/financial/PortfolioEvolutionChart';
import { PositionHistoryChart } from '../../components/financial/PositionHistoryChart';

export default function Page() {
  const { positions, portfolioSummary, loading, error, refresh } = useInvestments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Investimentos</h1>
          <p className="text-[#8E95A5] text-sm mt-1">Carteira em tempo real (brapi) e insights de mercado.</p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6D4AEF] disabled:opacity-50 text-white text-sm font-medium shadow-md shadow-[#7C5CFC]/25 transition-all"
        >
          {loading ? 'Atualizando…' : 'Atualizar cotações'}
        </button>
      </div>

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
