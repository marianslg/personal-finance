import { Account } from '@prisma/client';
import { useState, useEffect } from 'react';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/account').then((res) => res.json() as Promise<Account[]>)
      .then((accounts) => {
        setAccounts(accounts);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { accounts, isLoading };
}