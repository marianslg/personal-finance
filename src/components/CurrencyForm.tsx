"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

interface Currency {
  id: number;
  code: string;
  name: string;
}

interface CurrencyFormProps {
  currencies: Currency[];
  isLoading: boolean;
  onSave: (currency: Currency) => void;
  onCreate: (currency: { code: string; name: string }) => void;
}

export function CurrencyForm({ currencies, isLoading, onSave, onCreate }: CurrencyFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleSelectCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsCreating(false);
    setCode(currency.code);
    setName(currency.name);
  };

  const handleNewCurrency = () => {
    setSelectedCurrency(null);
    setIsCreating(true);
    setCode("");
    setName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      onCreate({ code, name });
      handleCancel();
    } else if (selectedCurrency) {
      onSave({ ...selectedCurrency, code, name });
      handleCancel();
    }
  };

  const handleCancel = () => {
    setSelectedCurrency(null);
    setIsCreating(false);
    setCode("");
    setName("");
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
      {/* Lista de monedas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monedas</CardTitle>
          <Button size="sm" onClick={handleNewCurrency}>
            + Nueva Moneda
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currencies.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay monedas disponibles</p>
            ) : (
              currencies.map((currency) => (
                <div
                  key={currency.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCurrency?.id === currency.id
                      ? "border-primary bg-accent"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleSelectCurrency(currency)}
                >
                  <div>
                    <p className="font-medium font-mono">{currency.code}</p>
                    <p className="text-sm text-muted-foreground">{currency.name}</p>
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

      {/* Formulario de edición/creación */}
      {(selectedCurrency || isCreating) && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? "Nueva Moneda" : "Editar Moneda"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-1">
                  Código
                </label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BTC, ETH, USD..."
                  required
                  disabled={!isCreating && !!selectedCurrency}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nombre
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bitcoin, Ethereum, Dólar..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit">{isCreating ? "Crear" : "Guardar"}</Button>
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
