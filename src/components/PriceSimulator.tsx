"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";

interface Currency {
  id: number;
  code: string;
  snapshotVisible: boolean;
  [key: string]: unknown;
}

interface Snapshot {
  id: number;
  currencyId: number;
  quantity: string;
  snapshotDate: string;
}

interface PriceSimulatorProps {
  snapshots: Snapshot[];
  currencies: Currency[];
  prices: { BTC: number; ETH: number };
}

const USD_PRICES: Record<string, number> = { USD: 1, USDT: 1, USDC: 1, DAI: 1, Pesos: 0.001 };

const formatInteger = (value: number) =>
  Math.round(value).toLocaleString("de-DE");

// Porcentajes de -30% a 30% en escala de 3%
const PERCENTAGES = [-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30];

export function PriceSimulator({ snapshots, currencies, prices }: PriceSimulatorProps) {
  // Obtener la fecha más reciente
  const dates = [...new Set(snapshots.map(s => s.snapshotDate.split("T")[0]))].sort().reverse();
  const latestDate = dates[0];

  if (!latestDate || prices.BTC === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No hay datos para simular</p>
        </CardContent>
      </Card>
    );
  }

  const latestSnapshots = snapshots.filter(s => s.snapshotDate.split("T")[0] === latestDate);

  // Calcular totales por currency
  const currencyTotals: Record<string, number> = {};
  latestSnapshots.forEach(s => {
    const currency = currencies.find(c => c.id === s.currencyId);
    if (!currency || !currency.snapshotVisible) return;
    
    const qty = parseFloat(s.quantity) || 0;
    if (!currencyTotals[currency.code]) {
      currencyTotals[currency.code] = 0;
    }
    currencyTotals[currency.code] += qty;
  });

  // Calcular total con precios ajustados
  const calculateTotal = (btcPrice: number, ethPrice: number) => {
    let total = 0;
    Object.entries(currencyTotals).forEach(([code, qty]) => {
      let price = USD_PRICES[code] || 1;
      if (code === "BTC") price = btcPrice;
      if (code === "ETH") price = ethPrice;
      total += qty * price;
    });
    return total;
  };

  const rows = PERCENTAGES.map(pct => {
    const factor = 1 + pct / 100;
    const btcPrice = prices.BTC * factor;
    const ethPrice = prices.ETH * factor;
    const total = calculateTotal(btcPrice, ethPrice);
    
    return { pct, btcPrice, ethPrice, total };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Simulador de Precios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-center font-semibold">%</th>
                <th className="px-4 py-3 text-right font-semibold">Precio BTC</th>
                <th className="px-4 py-3 text-right font-semibold">Precio ETH</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isZero = row.pct === 0;
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={row.pct} 
                    className={`border-b ${
                      isZero 
                        ? "bg-primary/10 font-semibold" 
                        : isEven 
                          ? "bg-muted/30" 
                          : ""
                    }`}
                  >
                    <td className={`px-4 py-2 text-center font-mono ${
                      row.pct > 0 ? "text-green-600" : row.pct < 0 ? "text-red-500" : ""
                    }`}>
                      {row.pct > 0 ? "+" : ""}{row.pct}%
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      ${formatInteger(row.btcPrice)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      ${formatInteger(row.ethPrice)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-semibold">
                      ${formatInteger(row.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
