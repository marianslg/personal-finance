"use client";

import React from "react";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeView: "overview" | "snapshots" | "accounts" | "currencies";
  onViewChange: (view: "overview" | "snapshots" | "accounts" | "currencies") => void;
}

export function Sidebar({ isOpen, onToggle, activeView, onViewChange }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-screen border-r bg-card text-card-foreground transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Toggle button */}
      <div className="p-4 flex justify-end border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
        >
          {isOpen ? (
            <ChevronLeftIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Button
          variant={activeView === "overview" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onViewChange("overview")}
        >
          <TableIcon className="h-5 w-5" />
          {isOpen && <span className="ml-3">Overview</span>}
        </Button>
        <Button
          variant={activeView === "snapshots" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onViewChange("snapshots")}
        >
          <TableIcon className="h-5 w-5" />
          {isOpen && <span className="ml-3">Snapshots</span>}
        </Button>

        <Button
          variant={activeView === "accounts" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onViewChange("accounts")}
        >
          <WalletIcon className="h-5 w-5" />
          {isOpen && <span className="ml-3">Cuentas</span>}
        </Button>

        <Button
          variant={activeView === "currencies" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onViewChange("currencies")}
        >
          <CoinIcon className="h-5 w-5" />
          {isOpen && <span className="ml-3">Monedas</span>}
        </Button>
      </nav>
    </aside>
  );
}

// Simple icons
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function TableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
