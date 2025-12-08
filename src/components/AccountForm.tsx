"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

interface Account {
  id: number;
  name: string;
  position: number | null;
}

interface AccountFormProps {
  accounts: Account[];
  isLoading: boolean;
  onSave: (account: Account) => void;
}

export function AccountForm({ accounts, isLoading, onSave }: AccountFormProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setName(account.name);
    setPosition(account.position?.toString() || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAccount) {
      onSave({
        ...selectedAccount,
        name,
        position: position ? parseInt(position) : null,
      });
    }
  };

  const handleCancel = () => {
    setSelectedAccount(null);
    setName("");
    setPosition("");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Lista de cuentas */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay cuentas disponibles</p>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAccount?.id === account.id
                      ? "border-primary bg-accent"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleSelectAccount(account)}
                >
                  <div>
                    <p className="font-medium">{account.name}</p>
                    {account.position !== null && (
                      <p className="text-sm text-muted-foreground">Posición: {account.position}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de edición */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nombre
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre de la cuenta"
                  required
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium mb-1">
                  Posición (orden)
                </label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Posición (opcional)"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit">Guardar</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
