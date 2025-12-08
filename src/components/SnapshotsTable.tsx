"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";

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

interface SnapshotsTableProps {
  snapshots: Snapshot[];
  isLoading: boolean;
}

export function SnapshotsTable({ snapshots, isLoading }: SnapshotsTableProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Snapshots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cuenta</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Moneda</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cantidad</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio USD</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total USD</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notas</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No hay snapshots disponibles
                  </td>
                </tr>
              ) : (
                snapshots.map((snapshot) => {
                  const quantity = parseFloat(snapshot.quantity);
                  const pricePerUnit = parseFloat(snapshot.pricePerUnitUSD);
                  const total = quantity * pricePerUnit;

                  return (
                    <tr key={snapshot.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">{snapshot.account.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {snapshot.currency.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        ${pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{snapshot.notes || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
