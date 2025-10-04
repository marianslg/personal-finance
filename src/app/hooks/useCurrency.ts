import { useState, useEffect } from 'react';
import { Currency } from '@prisma/client';

export function useCurrency() {
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/currency').then((res) => res.json() as Promise<Currency[]>)
      .then((currencies) => {
        setCurrencies(currencies);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { currencies, isLoading };
}