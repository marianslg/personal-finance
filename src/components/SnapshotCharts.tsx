"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Currency {
  id: number;
  code: string;
  name: string;
  snapshotVisible: boolean;
  [key: string]: unknown;
}

interface Snapshot {
  id: number;
  accountId: number;
  currencyId: number;
  quantity: string;
  pricePerUnitUSD: string;
  snapshotDate: string;
}

interface SnapshotChartsProps {
  snapshots: Snapshot[];
  currencies: Currency[];
  prices: { BTC: number; ETH: number };
}

const USD_PRICES: Record<string, number> = { USD: 1, USDT: 1, USDC: 1, DAI: 1, Pesos: 0.001 };

// Colores para el gráfico de torta
const COLORS = [
  "#f7931a", // Bitcoin orange
  "#627eea", // Ethereum blue
  "#26a17b", // Tether green
  "#2775ca", // USDC blue
  "#f5ac37", // DAI yellow
  "#16c784", // Green
  "#ea3943", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
};

const formatNumber = (value: number) =>
  value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatInteger = (value: number) =>
  Math.round(value).toLocaleString("de-DE");

const getPrice = (code: string, prices: { BTC: number; ETH: number }) => 
  code === "BTC" ? prices.BTC : code === "ETH" ? prices.ETH : USD_PRICES[code] || 1;

export function SnapshotCharts({ snapshots, currencies, prices }: SnapshotChartsProps) {
  const [activeTab, setActiveTab] = useState<"general" | number>("general");

  const visibleCurrencies = currencies.filter(c => c.snapshotVisible);

  // Datos para el gráfico de torta (último snapshot o datos actuales)
  const pieData = useMemo(() => {
    // Obtener la fecha más reciente
    const dates = [...new Set(snapshots.map(s => s.snapshotDate.split("T")[0]))].sort().reverse();
    const latestDate = dates[0];
    
    if (!latestDate) return [];

    const latestSnapshots = snapshots.filter(s => s.snapshotDate.split("T")[0] === latestDate);
    
    // Agrupar por currency y sumar
    const currencyTotals: Record<number, { code: string; total: number; totalUSD: number }> = {};
    
    latestSnapshots.forEach(s => {
      const currency = currencies.find(c => c.id === s.currencyId);
      if (!currency || !currency.snapshotVisible) return;
      
      const qty = parseFloat(s.quantity) || 0;
      const priceUSD = getPrice(currency.code, prices);
      
      if (!currencyTotals[s.currencyId]) {
        currencyTotals[s.currencyId] = { code: currency.code, total: 0, totalUSD: 0 };
      }
      currencyTotals[s.currencyId].total += qty;
      currencyTotals[s.currencyId].totalUSD += qty * priceUSD;
    });

    return Object.entries(currencyTotals)
      .map(([id, data]) => ({
        id: parseInt(id),
        name: data.code,
        value: data.totalUSD,
        total: data.total,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [snapshots, currencies, prices]);

  // Datos para gráficos de línea por currency
  const lineData = useMemo(() => {
    const dates = [...new Set(snapshots.map(s => s.snapshotDate.split("T")[0]))].sort();
    
    const dataByDate: Record<string, Record<number, number>> = {};
    
    dates.forEach(date => {
      dataByDate[date] = {};
      const dateSnapshots = snapshots.filter(s => s.snapshotDate.split("T")[0] === date);
      
      dateSnapshots.forEach(s => {
        const qty = parseFloat(s.quantity) || 0;
        if (!dataByDate[date][s.currencyId]) {
          dataByDate[date][s.currencyId] = 0;
        }
        dataByDate[date][s.currencyId] += qty;
      });
    });

    return dates.map(date => ({
      date,
      dateFormatted: formatDate(date),
      ...dataByDate[date],
    }));
  }, [snapshots]);

  // Calcular min/max por currency para el eje Y
  const getYDomain = (currencyId: number): [number, number] => {
    const values = lineData.map(d => d[currencyId] as number || 0).filter(v => v > 0);
    if (values.length === 0) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Agregar un pequeño margen (5%)
    const margin = (max - min) * 0.05 || max * 0.05;
    return [Math.max(0, min - margin), max + margin];
  };

  const totalValue = pieData.reduce((sum, d) => sum + d.value, 0);

  if (snapshots.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No hay snapshots para mostrar gráficos</p>
        </CardContent>
      </Card>
    );
  }

  const selectedCurrency = typeof activeTab === "number" 
    ? visibleCurrencies.find(c => c.id === activeTab) 
    : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análisis de Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-sm rounded-md whitespace-nowrap transition-colors ${
              activeTab === "general" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            General
          </button>
          {visibleCurrencies.map(currency => (
            <button
              key={currency.id}
              onClick={() => setActiveTab(currency.id)}
              className={`px-4 py-2 text-sm rounded-md whitespace-nowrap transition-colors ${
                activeTab === currency.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {currency.code}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        {activeTab === "general" ? (
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Gráfico de torta */}
            <div className="w-full lg:w-1/2 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`$${formatInteger(value)}`, name]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda y detalles */}
            <div className="w-full lg:w-1/2">
              <div className="text-center lg:text-left mb-4">
                <p className="text-sm text-muted-foreground">Total del Portfolio</p>
                <p className="text-3xl font-bold font-mono">${formatInteger(totalValue)}</p>
              </div>
              <div className="space-y-3">
                {pieData.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">${formatInteger(entry.value)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(entry.total)} {entry.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedCurrency ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="dateFormatted" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                  domain={getYDomain(selectedCurrency.id)}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), selectedCurrency.code]}
                  labelFormatter={(label) => `Fecha: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedCurrency.id}
                  name={selectedCurrency.code}
                  stroke={COLORS[visibleCurrencies.findIndex(c => c.id === selectedCurrency.id) % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[visibleCurrencies.findIndex(c => c.id === selectedCurrency.id) % COLORS.length] }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
