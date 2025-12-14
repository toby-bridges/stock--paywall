"use client";
import Link from "next/link";
import { useUIMode } from "./UIModeProvider";

export function TopBar() {
  const { mode, setMode } = useUIMode();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-semibold tracking-tight">24h Stock Wall</Link>
        <span className="text-xs opacity-70">v0.2 QR/BMC</span>
      </div>
      <div className="flex items-center gap-2">
        <button className={buttonClass(mode)} onClick={() => setMode(mode === "glass" ? "senior" : "glass")}>
          {mode === "glass" ? "切到长辈版(A股)" : "切到玻璃版(美股)"}
        </button>
        <Link className={buttonClass(mode)} href="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}

function buttonClass(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15 border border-white/15"
    : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800";
}
