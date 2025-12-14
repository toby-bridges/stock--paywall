"use client";
import React from "react";
import { useUIMode } from "./UIModeProvider";

export function Shell({ children }: { children: React.ReactNode }) {
  const { mode } = useUIMode();
  const isGlass = mode === "glass";

  return (
    <div className={isGlass ? "min-h-screen glass-bg" : "min-h-screen"}>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className={isGlass ? "glass-card rounded-3xl p-5" : "senior-card rounded-2xl p-5"}>
          {children}
        </div>
      </div>
    </div>
  );
}
