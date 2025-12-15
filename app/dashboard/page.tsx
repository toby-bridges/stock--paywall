"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { TopBar } from "@/components/TopBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useUIMode } from "@/components/UIModeProvider";

type Profile = { id: string; paid_at: string | null; unlock_at: string | null; note: string | null };
type Gainer = { symbol: string; name?: string; price?: number; changesPercentage?: number };

export default function Dashboard() {
  const { mode } = useUIMode();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [gainers, setGainers] = useState<Gainer[]>([]);


  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) { router.replace("/login"); return; }

      setUserId(session.user.id);

      const { data: p } = await supabase
        .from("profiles")
        .select("id, paid_at, unlock_at, note")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile((p as any) ?? { id: session.user.id, paid_at: null, unlock_at: null, note: null });
      setLoading(false);
    })();
  }, [router, supabase]);

  const now = Date.now();
  const unlockAtMs = useMemo(() => profile?.unlock_at ? new Date(profile.unlock_at).getTime() : null, [profile?.unlock_at]);
  const locked = useMemo(() => (!profile?.paid_at || !unlockAtMs) ? true : now < unlockAtMs, [profile?.paid_at, unlockAtMs, now]);

  const remaining = useMemo(() => {
    if (!unlockAtMs) return null;
    const ms = Math.max(0, unlockAtMs - now);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { h, m, s };
  }, [unlockAtMs, now]);

  async function refreshProfile() {
    if (!userId) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("id, paid_at, unlock_at, note")
      .eq("id", userId)
      .maybeSingle();
    if (p) setProfile(p as any);
  }

  async function startCooldown() {
    if (!userId) return;
    setBusy(true);
    setErr(null);

    const paidAt = new Date();
    const unlockAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("profiles")
      .update({
        paid_at: paidAt.toISOString(),
        unlock_at: unlockAt.toISOString(),
        note: null,
      })
      .eq("id", userId);

    setBusy(false);
    if (error) { setErr(error.message); return; }
    await refreshProfile();
  }

  async function loadData() {
    setErr(null);
    try {
      const g = await fetch("/api/gainers").then(r => r.json());
      setGainers(Array.isArray(g) ? g : (g?.data ?? []));
    } catch (e: any) { setErr(e?.message ?? "拉取榜单失败"); }
  }



  useEffect(() => {
    if (!loading && profile?.paid_at && !locked) { loadData(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, profile?.paid_at, locked]);

  async function signOut() { await supabase.auth.signOut(); router.replace("/"); }

  return (
    <Shell>
      <TopBar />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm opacity-80">
          {userId ? <>用户：<span className="opacity-90">{userId.slice(0, 8)}…</span></> : null}
        </div>
        <div className="flex items-center gap-2">
          <button className={btn(mode)} onClick={refreshProfile}>刷新状态</button>
          <button className={btn(mode)} onClick={signOut}>退出登录</button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 opacity-80">加载中…</div>
      ) : !profile?.paid_at ? (
        <PaywallGate mode={mode} startCooldown={startCooldown} busy={busy} err={err} />
      ) : locked ? (
        <LockedView mode={mode} remaining={remaining} unlockAt={profile?.unlock_at} />
      ) : (
        <UnlockedView
          mode={mode}
          gainers={gainers}
          quote={quote}
          loadData={loadData}
          err={err}
        />
      )}
    </Shell>
  );
}

function PaywallGate({
  mode,
  startCooldown,
  busy,
  err,
}: {
  mode: "glass" | "senior";
  startCooldown: () => void;
  busy: boolean;
  err: string | null;
}) {
  return (
    <div className={mode === "glass" ? "mt-6 glass-card rounded-3xl p-6" : "mt-6 senior-card rounded-2xl p-6"}>
      <h2 className={mode === "glass" ? "text-xl font-semibold" : "text-2xl font-bold"}>24h 冷却（作业演示）</h2>
      <p className="mt-2 opacity-80 leading-relaxed">
        点击按钮立刻开始 24 小时倒计时。倒计时结束后解锁“涨跌幅龙虎榜”页面。
      </p>

      <button
        className={mode === "glass"
          ? "mt-4 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/20 border border-white/15 disabled:opacity-50"
          : "mt-4 rounded-xl bg-red-600 px-5 py-4 text-lg font-bold text-white hover:bg-red-700 disabled:opacity-50"}
        onClick={startCooldown}
        disabled={busy}
        type="button"
      >
        {busy ? "启动中…" : "开始 24h 冷却"}
      </button>

      {err ? <div className="mt-3 text-sm opacity-90">{err}</div> : null}

      <p className="mt-3 text-xs opacity-70">
        商业逻辑：延迟解锁制造稀缺，倒计时降低不确定性，让奖励可预期。
      </p>
    </div>
  );
}


function LockedView({ mode, remaining, unlockAt }: { mode: "glass" | "senior"; remaining: any; unlockAt: string | null }) {
  return (
    <div className={mode === "glass" ? "mt-6 glass-card rounded-3xl p-6" : "mt-6 senior-card rounded-2xl p-6"}>
      <h2 className={mode === "glass" ? "text-xl font-semibold" : "text-2xl font-bold"}>冷却中（未到解锁时间）</h2>
      <p className="mt-2 opacity-80">解锁时间：{unlockAt ? new Date(unlockAt).toLocaleString() : "—"}</p>
      <div className="mt-4 text-3xl font-semibold tabular-nums">{remaining ? `${pad(remaining.h)}:${pad(remaining.m)}:${pad(remaining.s)}` : "—"}</div>
    </div>
  );
}

function UnlockedView({ mode, gainers, quote, loadData, err }: any) {
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <div className={mode === "glass" ? "glass-card rounded-3xl p-6" : "senior-card rounded-2xl p-6"}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={mode === "glass" ? "text-xl font-semibold" : "text-2xl font-bold"}>明日涨停预测榜（演示）</h2>
          <button className={btn(mode)} onClick={loadData}>刷新</button>
        </div>
        <p className="mt-1 text-xs opacity-70">注：用“今日涨幅榜”数据模拟“明日涨停预测”的展示效果。</p>
        {err ? <div className="mt-3 text-sm">{err}</div> : null}
        <div className="mt-4 overflow-auto">
          <table className={mode === "glass" ? "w-full text-sm" : "w-full text-base"}>
            <thead className="opacity-70">
              <tr className="text-left">
                <th className="py-2 pr-2">代码</th>
                <th className="py-2 pr-2">名称</th>
                <th className="py-2 pr-2">价格</th>
                <th className="py-2">涨跌幅</th>
              </tr>
            </thead>
            <tbody>
              {gainers.slice(0, 20).map((g: any) => {
                const pct = g.changesPercentage ?? 0;
                const cls = pct >= 0 ? "text-up" : "text-down";
                return (
                  <tr key={g.symbol} className={mode === "glass" ? "border-t border-white/10" : "border-t border-slate-200"}>
                    <td className="py-2 pr-2 font-medium">{g.symbol}</td>
                    <td className="py-2 pr-2 opacity-85">{g.name ?? "—"}</td>
                    <td className={"py-2 pr-2 tabular-nums " + cls}>{fmt(g.price)}</td>
                    <td className={"py-2 tabular-nums font-semibold " + cls}>{fmtPct(g.changesPercentage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

     
    </div>
  );
}

function Row({ label, value, delta, emphasize }: any) {
  const cls = delta === undefined ? "" : (delta >= 0 ? "text-up" : "text-down");
  return (
    <div className="flex justify-between">
      <span className="opacity-70">{label}</span>
      <span className={(emphasize ? "font-semibold " : "font-medium ") + "tabular-nums " + cls}>{value}</span>
    </div>
  );
}

function btn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15 border border-white/15"
    : "rounded-xl bg-slate-900 px-4 py-3 text-base font-bold text-white hover:bg-slate-800";
}
function input(mode: "glass" | "senior") {
  return mode === "glass"
    ? "w-full rounded-2xl bg-white/10 px-4 py-3 text-sm outline-none border border-white/15 focus:border-white/30"
    : "w-full rounded-xl bg-white px-4 py-4 text-lg outline-none border border-slate-200 focus:border-slate-400";
}
function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(v: any) { return (v === null || v === undefined) ? "—" : (typeof v === "number" ? v.toLocaleString() : String(v)); }
function fmtPct(v: any) {
  if (v === null || v === undefined) return "—";
  const num = typeof v === "number" ? v : Number(String(v).replace("%",""));
  if (!Number.isFinite(num)) return String(v);
  return `${num.toFixed(2)}%`;
}
