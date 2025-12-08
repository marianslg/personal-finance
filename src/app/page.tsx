"use client";

import React, { useState, useEffect } from "react";
import { useAccounts } from "./hooks/useAccount";
import { useCurrency } from "./hooks/useCurrency";
import { Sidebar } from "@/components/Sidebar";
import { SnapshotsTable } from "@/components/SnapshotsTable";
import { SnapshotSettingsEditor } from "@/components/SnapshotSettingsEditor";
import { OverviewTable } from "@/components/OverviewTable";

interface Snapshot {
  id: number;
  accountId: number;
  currencyId: number;
  quantity: string;
  pricePerUnitUSD: string;
  notes: string | null;
  account: { name: string };
  currency: { code: string };
}

function useSnapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/snapshot")
      .then((res) => res.json())
      .then((data) => setSnapshots(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { snapshots, isLoading };
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<"overview" | "snapshots" | "accounts" | "currencies">("overview");
  
  const { accounts, isLoading: accountLoading, refetch: refetchAccounts } = useAccounts();
  const { currencies, isLoading: currencyLoading, refetch: refetchCurrencies } = useCurrency();
  const { snapshots, isLoading: snapshotLoading } = useSnapshots();

  const handleSaveAccounts = async (items: { id: number; snapshotPosition: number | null; snapshotVisible: boolean }[]) => {
    try {
      await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items.map(a => ({
          id: a.id,
          snapshotPosition: a.snapshotPosition,
          snapshotVisible: a.snapshotVisible,
        }))),
      });
      refetchAccounts();
    } catch (error) {
      console.error("Error saving accounts:", error);
    }
  };

  const handleSaveCurrencies = async (items: { id: number; snapshotPosition: number | null; snapshotVisible: boolean }[]) => {
    try {
      await fetch("/api/currency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items.map(c => ({
          id: c.id,
          snapshotPosition: c.snapshotPosition,
          snapshotVisible: c.snapshotVisible,
        }))),
      });
      refetchCurrencies();
    } catch (error) {
      console.error("Error saving currencies:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <main className="flex-1 p-6 overflow-auto bg-muted/30">
        {activeView === "overview" && accounts && currencies && (
          <OverviewTable
            accounts={accounts}
            currencies={currencies}
            isLoading={accountLoading || currencyLoading}
          />
        )}

        {activeView === "snapshots" && (
          <SnapshotsTable snapshots={snapshots} isLoading={snapshotLoading} />
        )}
        
        {activeView === "accounts" && accounts && (
          <div className="flex justify-center">
            <SnapshotSettingsEditor
              title="Cuentas - Configuración de Snapshot"
              items={accounts}
              isLoading={accountLoading}
              getLabel={(a) => a.name}
              onSave={handleSaveAccounts}
            />
          </div>
        )}

        {activeView === "currencies" && currencies && (
          <div className="flex justify-center">
            <SnapshotSettingsEditor
              title="Monedas - Configuración de Snapshot"
              items={currencies}
              isLoading={currencyLoading}
              getLabel={(c) => c.code}
              getSubLabel={(c) => c.name}
              onSave={handleSaveCurrencies}
            />
          </div>
        )}
      </main>
    </div>
  );
}
