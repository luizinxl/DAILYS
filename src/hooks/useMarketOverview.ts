import { useCallback, useEffect, useState } from 'react';
import { getMarketOverview } from '../services/integrations/brapiService';
import type { MarketOverview } from '../services/integrations/brapiService';

export function useMarketOverview() {
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketOverview();
      setOverview(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar visao geral do mercado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refresh: fetchOverview };
}
