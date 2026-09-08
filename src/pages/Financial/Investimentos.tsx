import { Card } from '@/components/common/Card';
import { useInvestments } from '../../hooks/useInvestments';
import { PortfolioAllocationChart } from '../../components/financial/PortfolioAllocationChart';
import { PortfolioEvolutionChart } from '../../components/financial/PortfolioEvolutionChart';
import { PositionHistoryChart } from '../../components/financial/PositionHistoryChart';

export default function Page() {
  const { positions, portfolioSummary, loading, error, refresh } = useInvestments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-[#8A92A8] mt-1">Carteira em tempo real (brapi) e insights de mercado.</p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition"
        >
          {loading ? 'Atualizando…' : 'Atualizar cotações'}
        </button>
      </div>

      {error && (
        <Card variant="financial">
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      )}

      {!error && positions.length === 0 && !loading && (
        <Card variant="financial">
          <p className="text-sm text-[#8A92A8]">
            Nenhum investimento cadastrado ainda na tabela <code>investments</code>. Assim que houver posições, a carteira aparece aqui automaticamente.
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
