
import { Currency } from "@prisma/client";
import { useEffect, useState } from "react";

export function useCreateCurrency(name: string, code: string) {
   const [data, setData] = useState<{ currency: Currency | null }>({ currency: null });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
        fetch('/api/currencies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, code }),
        })
          .then((res) => res.json())
          .then((currency) => {
            setData({ currency });
          })
          .catch((err) => console.error(err))
          .finally(() => setIsLoading(false));
   }, []);

   return { data, isLoading };
}