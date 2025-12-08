"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";

interface BaseItem {
  id: number;
  snapshotPosition: number | null;
  snapshotVisible: boolean;
}

interface SnapshotSettingsEditorProps<T extends BaseItem> {
  title: string;
  items: T[];
  isLoading: boolean;
  getLabel: (item: T) => string;
  getSubLabel?: (item: T) => string;
  onSave: (items: T[]) => void;
}

// Iconos
const ChevronUp = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);
const ChevronDown = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const EyeIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export function SnapshotSettingsEditor<T extends BaseItem>({
  title,
  items: initialItems,
  isLoading,
  getLabel,
  getSubLabel,
  onSave,
}: SnapshotSettingsEditorProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Ordenar items por snapshotPosition
  useEffect(() => {
    const sorted = [...initialItems].sort((a, b) => {
      const posA = a.snapshotPosition ?? 999;
      const posB = b.snapshotPosition ?? 999;
      return posA - posB;
    });
    setItems(sorted);
    setHasChanges(false);
  }, [initialItems]);

  const move = (index: number, dir: "up" | "down") => {
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= items.length) return;
    
    const newItems = [...items];
    [newItems[index], newItems[swap]] = [newItems[swap], newItems[index]];
    
    // Actualizar posiciones
    newItems.forEach((item, idx) => {
      item.snapshotPosition = idx + 1;
    });
    
    setItems(newItems);
    setHasChanges(true);
  };

  const toggleVisible = (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], snapshotVisible: !newItems[index].snapshotVisible };
    setItems(newItems);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(items);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay elementos disponibles</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  item.snapshotVisible ? "bg-background" : "bg-muted/30 opacity-60"
                }`}
              >
                {/* Número de posición */}
                <span className="w-8 h-8 flex items-center justify-center text-sm font-mono bg-muted rounded">
                  {index + 1}
                </span>

                {/* Info del item */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${!item.snapshotVisible ? "line-through" : ""}`}>
                    {getLabel(item)}
                  </p>
                  {getSubLabel && (
                    <p className="text-sm text-muted-foreground truncate">{getSubLabel(item)}</p>
                  )}
                </div>

                {/* Controles */}
                <div className="flex items-center gap-1">
                  {/* Toggle visibilidad */}
                  <button
                    onClick={() => toggleVisible(index)}
                    className={`p-2 rounded hover:bg-muted transition-colors ${
                      item.snapshotVisible ? "text-foreground" : "text-muted-foreground"
                    }`}
                    title={item.snapshotVisible ? "Ocultar en snapshot" : "Mostrar en snapshot"}
                  >
                    {item.snapshotVisible ? <EyeIcon /> : <EyeOffIcon />}
                  </button>

                  {/* Mover arriba */}
                  <button
                    onClick={() => move(index, "up")}
                    disabled={index === 0}
                    className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover arriba"
                  >
                    <ChevronUp />
                  </button>

                  {/* Mover abajo */}
                  <button
                    onClick={() => move(index, "down")}
                    disabled={index === items.length - 1}
                    className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover abajo"
                  >
                    <ChevronDown />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
