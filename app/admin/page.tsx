"use client";

import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { TopBar } from "@/components/TopBar";
import { useUIMode } from "@/components/UIModeProvider";

type ProofRow = {
  id: number;
  user_id: string;
  memo: string | null;
  image_base64: string | null;
  created_at: string;
  status: "pending" | "approved" | "rejected";
};

export default function AdminPage() {
  const { mode } = useUIMode();
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<ProofRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const pending = useMemo(() => rows.filter(r => r.status === "pending"), [rows]);

  async function load() {
    setMsg(null);
    const r = await fetch("/api/admin/pending", { headers: { "x-admin-token": token } });
    const j = await r.json();
    if (!r.ok) { setMsg(j?.error ?? "加载失败"); return; }
    setRows(j);
  }

  async function approve(userId: string, proofId: number) {
    setMsg(null);
    const r = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ userId, proofId }),
    });
    const j = await r.json();
    if (!r.ok) { setMsg(j?.error ?? "操作失败"); return; }
    setMsg("已批准 ✅");
    await load();
  }

  async function reject(proofId: number) {
    setMsg(null);
    const r = await fetch("/api/admin/reject", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ proofId }),
    });
    const j = await r.json();
    if (!r.ok) { setMsg(j?.error ?? "操作失败"); return; }
    setMsg("已拒绝 ❌");
    await load();
  }

  return (
    <Shell>
      <TopBar />

      <div className={mode === "glass" ? "mt-6 glass-card rounded-3xl p-6" : "mt-6 senior-card rounded-2xl p-6"}>
        <h1 className={mode === "glass" ? "text-2xl font-semibold" : "text-2xl font-bold"}>Admin 审核台</h1>
        <p className="mt-2 text-sm opacity-80">输入 ADMIN_TOKEN 查看待审核列表。</p>

        <div className="mt-4 flex gap-2">
          <input className={input(mode)} value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" />
          <button className={btn(mode)} onClick={load}>加载待审核</button>
        </div>
        {msg ? <div className="mt-3 text-sm opacity-85">{msg}</div> : null}
      </div>

      <div className="mt-5 grid gap-4">
        {pending.map((p) => (
          <div key={p.id} className={mode === "glass" ? "glass-card rounded-3xl p-5" : "senior-card rounded-2xl p-5"}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm opacity-80">
                <div><b>Proof #{p.id}</b> · {new Date(p.created_at).toLocaleString()}</div>
                <div className="opacity-70">User: {p.user_id}</div>
                <div className="opacity-70">Memo: {p.memo ?? "—"}</div>
              </div>
              <div className="flex gap-2">
                <button className={approveBtn(mode)} onClick={() => approve(p.user_id, p.id)}>批准并开始24h</button>
                <button className={rejectBtn(mode)} onClick={() => reject(p.id)}>拒绝</button>
              </div>
            </div>

            {p.image_base64 ? (
              <div className={mode === "glass" ? "mt-3 rounded-2xl border border-white/10 p-3" : "mt-3 rounded-xl border border-slate-200 p-3"}>
                <img src={p.image_base64} alt="proof" className="max-h-[360px] rounded-xl" />
              </div>
            ) : (
              <div className="mt-3 text-sm opacity-70">（无图片）</div>
            )}
          </div>
        ))}

        {pending.length === 0 ? (
          <div className="opacity-70 text-sm">暂无 pending 记录。</div>
        ) : null}
      </div>
    </Shell>
  );
}

function btn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15 border border-white/15"
    : "rounded-xl bg-slate-900 px-4 py-3 text-base font-bold text-white hover:bg-slate-800";
}
function approveBtn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/20 border border-white/15"
    : "rounded-xl bg-red-600 px-4 py-3 text-base font-bold text-white hover:bg-red-700";
}
function rejectBtn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-transparent px-4 py-2 text-sm font-semibold hover:bg-white/10 border border-white/15"
    : "rounded-xl bg-white px-4 py-3 text-base font-bold text-slate-900 border border-slate-200 hover:bg-slate-50";
}
function input(mode: "glass" | "senior") {
  return mode === "glass"
    ? "w-full rounded-2xl bg-white/10 px-4 py-3 text-sm outline-none border border-white/15 focus:border-white/30"
    : "w-full rounded-xl bg-white px-4 py-4 text-lg outline-none border border-slate-200 focus:border-slate-400";
}
