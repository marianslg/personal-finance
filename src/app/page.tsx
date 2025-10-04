"use client";

import React from "react";
import { useAccounts } from "./hooks/useAccount";
import { useCurrency } from "./hooks/useCurrency";

export default function Home() {
  const { currencies, isLoading: currencyLoading } = useCurrency();
  const { accounts, isLoading: accountLoading } = useAccounts();

  if (currencyLoading || accountLoading) {
    return <div>Loading...</div>;
  }

  if (!currencies || !accounts) {
    return <div>No data available</div>;
  }

  return (
    <div className="flex min-h-screen flex-col  py-2">
<div className="flex min-h-screen flex-col py-2">
      {/* UN SOLO GRID */}
      <div
        className={`grid gap-2 grid-cols-[150px_repeat(${accounts.length},minmax(0,1fr))]`}
      >
        {/* Header */}
        <div className="font-semibold col-span-1">Moneda</div>
        {accounts.map((acc) => (
          <div key={acc.id} className="font-semibold col-span-1">
            {acc.name}
          </div>
        ))}

        {/* Filas */}
        {currencies.map((cur) => (
          <React.Fragment key={cur.id}>
            <div className="col-span-1">{cur.code}</div>
            {accounts.map((acc) => (
              <div key={acc.id} className="col-span-1" />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
      Currencies:
      <ul>
        {currencyLoading ? (
          <li>Loading...</li>
        ) : (
          currencies &&
          currencies.map((currency) => (
            <li key={currency.id}>
              {currency.code} - {currency.name}
            </li>
          ))
        )}
      </ul>
      Accounts:
      <ul>
        {accountLoading ? (
          <li>Loading...</li>
        ) : (
          accounts &&
          accounts.map((account) => <li key={account.id}>{account.name}</li>)
        )}
      </ul>
    </div>
  );
}
