"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
export type UIMode = "glass" | "senior";
type Ctx = { mode: UIMode; setMode: (m: UIMode) => void };
const UIModeContext = createContext<Ctx | null>(null);

export function UIModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<UIMode>("glass");

  useEffect(() => {
    const saved = (localStorage.getItem("ui_mode") as UIMode | null) ?? "glass";
    setModeState(saved);
    document.documentElement.dataset.ui = saved;
  }, []);

  const setMode = (m: UIMode) => {
    setModeState(m);
    localStorage.setItem("ui_mode", m);
    document.documentElement.dataset.ui = m;
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <UIModeContext.Provider value={value}>{children}</UIModeContext.Provider>;
}

export function useUIMode() {
  const ctx = useContext(UIModeContext);
  if (!ctx) throw new Error("useUIMode must be used inside UIModeProvider");
  return ctx;
}
