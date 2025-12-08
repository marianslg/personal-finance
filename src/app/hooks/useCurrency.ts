import { useState, useEffect, useCallback } from 'react';
import { Currency } from '@prisma/client';

export function useCurrency() {
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrencies = useCallback(() => {
    setIsLoading(true);
    fetch('/api/currency').then((res) => res.json() as Promise<Currency[]>)
      .then((currencies) => {
        setCurrencies(currencies);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  return { currencies, isLoading, refetch: fetchCurrencies };
}