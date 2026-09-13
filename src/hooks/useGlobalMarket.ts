import { useCallback, useEffect, useState } from 'react';
import {
  getGlobalMarketOverview,
  GlobalMarketOverview,
} from '../services/integrations/googleFinanceService';

export function useGlobalMarket() {
  const [overview, setOverview] = useState<GlobalMarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGlobalMarketOverview();
      setOverview(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar mercado global');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { overview, loading, error, refresh: fetch };
}
