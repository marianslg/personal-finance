"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { SnapshotCharts } from "./SnapshotCharts";

interface Account { id: number; name: string; snapshotPosition: number | null; snapshotVisible: boolean; [key: string]: unknown }
interface Currency { id: number; code: string; name: string; snapshotPosition: number | null; snapshotVisible: boolean; [key: string]: unknown }
interface Snapshot {
  id: number;
  accountId: number;
  currencyId: number;
  quantity: string;
  pricePerUnitUSD: string;
  snapshotDate: string;
  account: Account;
  currency: Currency;
}
interface OverviewTableProps { accounts: Account[]; currencies: Currency[]; isLoading: boolean }

const USD_PRICES: Record<string, number> = { USD: 1, USDT: 1, USDC: 1, DAI: 1, Pesos: 0.001 };

const formatNumber = (value: number, min = 2, max?: number) =>
  value === 0 ? "" : value.toLocaleString("de-DE", { minimumFractionDigits: min, maximumFractionDigits: max ?? min });

const formatInteger = (value: number) =>
  Math.round(value).toLocaleString("de-DE");

const parseDecimal = (value: string) => {
  // Manejar formato alemán: quitar puntos de miles, reemplazar coma por punto
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized) || 0;
};

// Formatear número para mostrar en input (con coma como decimal)
const formatForInput = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return "";
  // Convertir a string con punto y reemplazar por coma
  return num.toString().replace(".", ",");
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
};

// Iconos
const Icon = ({ d, className = "h-4 w-4" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const ChevronLeft = ({ className }: { className?: string }) => <Icon d="M15 19l-7-7 7-7" className={className} />;
const ChevronRight = ({ className }: { className?: string }) => <Icon d="M9 5l7 7-7 7" className={className} />;
const RefreshIcon = ({ className }: { className?: string }) => (
  <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className={className} />
);
const SaveIcon = ({ className }: { className?: string }) => (
  <Icon d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" className={className} />
);
const EditIcon = ({ className }: { className?: string }) => (
  <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className={className} />
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className={className} />
);

// Carrusel de snapshots
function SnapshotCarousel({ dates, selected, onSelect, loading }: { dates: string[]; selected: string | null; onSelect: (d: string | null) => void; loading?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Snapshots:</span>
          {loading ? (
            <div className="flex gap-2 flex-1">
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse"></div>
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
            </div>
          ) : (
            <>
              <button onClick={() => scroll("left")} className="p-1 hover:bg-muted rounded" title="Anterior"><ChevronLeft /></button>
              <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            <button
              onClick={() => onSelect(null)}
              className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${!selected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
            >
              Actual
            </button>
            {dates.map(date => (
              <button
                key={date}
                onClick={() => onSelect(date)}
                className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${selected === date ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                {formatDate(date)}
              </button>
            ))}
              </div>
              <button onClick={() => scroll("right")} className="p-1 hover:bg-muted rounded" title="Siguiente"><ChevronRight /></button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewTable({ accounts: allAccounts, currencies: allCurrencies, isLoading }: OverviewTableProps) {
  const [prices, setPrices] = useState({ BTC: 0, ETH: 0 });
  const [pricesLoading, setPricesLoading] = useState(false);
  const [snapshotsLoading, setSnapshotsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState("");

  // Datos filtrados por visibilidad y ordenados por posición
  const accounts = allAccounts
    .filter(a => a.snapshotVisible)
    .sort((a, b) => (a.snapshotPosition ?? 999) - (b.snapshotPosition ?? 999));
  const currencies = allCurrencies
    .filter(c => c.snapshotVisible)
    .sort((a, b) => (a.snapshotPosition ?? 999) - (b.snapshotPosition ?? 999));

  // Fetch precios
  const fetchPrices = useCallback(async () => {
    setPricesLoading(true);
    try {
      const [btc, eth] = await Promise.all([
        fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT").then(r => r.json()),
        fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT").then(r => r.json()),
      ]);
      setPrices({ BTC: parseFloat(btc.price), ETH: parseFloat(eth.price) });
    } catch (e) { console.error(e); }
    finally { setPricesLoading(false); }
  }, []);

  // Fetch snapshots
  const fetchSnapshots = useCallback(async () => {
    setSnapshotsLoading(true);
    try {
      const res = await fetch("/api/snapshot");
      const data = await res.json();
      setSnapshots(data);
    } catch (e) { console.error(e); }
    finally { setSnapshotsLoading(false); }
  }, []);

  useEffect(() => { fetchPrices(); fetchSnapshots(); }, [fetchPrices, fetchSnapshots]);

  // Guardar snapshot
  const saveSnapshot = async () => {
    setSaving(true);
    try {
      const snapshotDate = new Date().toISOString();
      const snapshotsData = [];
      for (const c of currencies) {
        for (const a of accounts) {
          const qty = parseFloat(getCell(c.id, a.id)) || 0;
          if (qty > 0) {
            snapshotsData.push({
              accountId: a.id,
              currencyId: c.id,
              quantity: qty,
              pricePerUnitUSD: getPrice(c.code),
            });
          }
        }
      }
      if (snapshotsData.length === 0) {
        alert("No hay datos para guardar");
        return;
      }
      await fetch("/api/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshots: snapshotsData, snapshotDate }),
      });
      await fetchSnapshots();
      alert("Snapshot guardado!");
    } catch (e) {
      console.error(e);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // Actualizar snapshot existente
  const updateSnapshot = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      const snapshotsData = [];
      for (const c of allCurrencies) {
        for (const a of allAccounts) {
          const qty = parseDecimal(getCell(c.id, a.id));
          if (qty > 0) {
            snapshotsData.push({
              accountId: a.id,
              currencyId: c.id,
              quantity: qty,
              pricePerUnitUSD: getPrice(c.code),
            });
          }
        }
      }
      if (snapshotsData.length === 0) {
        alert("No hay datos para guardar");
        return;
      }
      await fetch("/api/snapshot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshots: snapshotsData, snapshotDate: selectedDate }),
      });
      await fetchSnapshots();
      setIsEditing(false);
      alert("Snapshot actualizado!");
    } catch (e) {
      console.error(e);
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  // Actualizar fecha del snapshot
  const updateSnapshotDate = async () => {
    if (!selectedDate || !newDate) return;
    setSaving(true);
    try {
      await fetch("/api/snapshot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldDate: selectedDate, newDate }),
      });
      await fetchSnapshots();
      setSelectedDate(newDate);
      setEditingDate(false);
      setNewDate("");
      alert("Fecha actualizada!");
    } catch (e) {
      console.error(e);
      alert("Error al actualizar fecha");
    } finally {
      setSaving(false);
    }
  };

  // Cargar snapshot seleccionado o limpiar al volver a Actual
  useEffect(() => {
    if (selectedDate) {
      const dateSnapshots = snapshots.filter(s => s.snapshotDate.split("T")[0] === selectedDate.split("T")[0]);
      const newValues: Record<string, string> = {};
      dateSnapshots.forEach(s => {
        newValues[`${s.currencyId}-${s.accountId}`] = formatForInput(s.quantity);
      });
      setValues(newValues);
      setIsEditing(false);
    } else {
      // Volver a Actual: limpiar valores
      setValues({});
    }
  }, [selectedDate, snapshots]);

  // Fechas únicas de snapshots
  const snapshotDates = [...new Set(snapshots.map(s => s.snapshotDate.split("T")[0]))].sort().reverse();

  const getPrice = (code: string) => code === "BTC" ? prices.BTC : code === "ETH" ? prices.ETH : USD_PRICES[code] || 1;
  const getCell = (cid: number, aid: number) => values[`${cid}-${aid}`] || "";
  const setCell = (cid: number, aid: number, v: string) => setValues(p => ({ ...p, [`${cid}-${aid}`]: v }));
  const rowTotal = (cid: number) => accounts.reduce((s, a) => s + parseDecimal(getCell(cid, a.id)), 0);
  const rowTotalUSD = (code: string, cid: number) => rowTotal(cid) * getPrice(code);
  const grandTotal = () => currencies.reduce((s, c) => s + rowTotalUSD(c.code, c.id), 0);

  if (isLoading) {
    return (
      <Card><CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded" />)}
        </div>
      </CardContent></Card>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="space-y-4 min-w-[70%]">
        {/* Precios */}
        <Card className="w-full"><CardContent className="p-4">
        <div className="flex items-center justify-end gap-6">
          <span className="text-sm text-muted-foreground">BTC: <span className="font-mono font-semibold">{pricesLoading ? "..." : `$${formatInteger(prices.BTC)}`}</span></span>
          <span className="text-sm text-muted-foreground">ETH: <span className="font-mono font-semibold">{pricesLoading ? "..." : `$${formatInteger(prices.ETH)}`}</span></span>
          <Button variant="ghost" size="sm" onClick={fetchPrices} disabled={pricesLoading}>
            <RefreshIcon className={pricesLoading ? "animate-spin h-4 w-4" : "h-4 w-4"} />
          </Button>
        </div>
      </CardContent></Card>

      {/* Carrusel de snapshots */}
      <SnapshotCarousel dates={snapshotDates} selected={selectedDate} onSelect={setSelectedDate} loading={snapshotsLoading} />

      {/* Tabla Overview */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{selectedDate ? `Snapshot - ${formatDate(selectedDate)}` : "Overview - Actual"}</CardTitle>
            {selectedDate && !editingDate && (
              <Button onClick={() => { setEditingDate(true); setNewDate(selectedDate.split("T")[0]); }} size="sm" variant="ghost">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            )}
            {editingDate && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="px-2 py-1 text-sm border rounded"
                  title="Nueva fecha del snapshot"
                />
                <Button onClick={updateSnapshotDate} disabled={saving} size="sm">
                  {saving ? "..." : "OK"}
                </Button>
                <Button onClick={() => { setEditingDate(false); setNewDate(""); }} size="sm" variant="ghost">
                  ✕
                </Button>
              </div>
            )}
          </div>
          {selectedDate ? (
            <div className="flex gap-2">
              {isEditing ? (
                <Button onClick={updateSnapshot} disabled={saving} size="sm">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <EditIcon className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={saveSnapshot} disabled={saving} size="sm">
              <SaveIcon className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar Snapshot"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <table className="text-sm w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left font-semibold w-16">Moneda</th>
                  {accounts.map(a => <th key={a.id} className="px-1 py-2 text-center font-semibold w-24">{a.name}</th>)}
                  <th className="px-2 py-2 text-right font-semibold w-28">Total</th>
                  <th className="px-2 py-2 text-right font-semibold w-28">Total USD</th>
                </tr>
              </thead>
              <tbody>
                {!currencies.length ? (
                  <tr><td colSpan={accounts.length + 3} className="px-4 py-8 text-center text-muted-foreground">No hay monedas seleccionadas</td></tr>
                ) : (
                  <>
                    {currencies.map(c => (
                      <tr key={c.id} className="border-b hover:bg-muted/20">
                        <td className="px-2 py-1 font-medium">{c.code}</td>
                        {accounts.map(a => (
                          <td key={a.id} className="px-1 py-1">
                            <input
                              type="text"
                              value={getCell(c.id, a.id)}
                              onChange={e => setCell(c.id, a.id, e.target.value)}
                              disabled={!!selectedDate && !isEditing}
                              title={`${c.code} en ${a.name}`}
                              className="w-full h-7 px-1 text-right text-sm font-mono bg-transparent focus:outline-none focus:bg-muted/30 rounded disabled:opacity-60"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-1 text-right font-mono">{formatNumber(rowTotal(c.id), 2, 8)}</td>
                        <td className="px-2 py-1 text-right font-mono font-semibold">${formatInteger(rowTotalUSD(c.code, c.id))}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 font-bold">
                      <td className="px-2 py-2">TOTAL</td>
                      {accounts.map(a => <td key={a.id} />)}
                      <td />
                      <td className="px-2 py-2 text-right font-mono text-lg font-bold">${formatInteger(grandTotal())}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <SnapshotCharts 
        snapshots={snapshots} 
        currencies={allCurrencies} 
        prices={prices} 
      />
      </div>
    </div>
  );
}
