"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { TopBar } from "@/components/TopBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useUIMode } from "@/components/UIModeProvider";

type Proof = { id: number; status: "pending" | "approved" | "rejected"; memo: string | null; created_at: string };

export default function SponsorPage() {
  const { mode } = useUIMode();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [userId, setUserId] = useState<string | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [memo, setMemo] = useState("");
  const [imgData, setImgData] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const latest = useMemo(() => proofs[0] ?? null, [proofs]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) { router.replace("/login"); return; }
      setUserId(session.user.id);
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const { data } = await supabase
      .from("sponsor_proofs")
      .select("id, status, memo, created_at")
      .order("id", { ascending: false });
    setProofs((data as any) ?? []);
  }

  async function onPickFile(file: File | null) {
    setMsg(null);
    if (!file) { setImgData(null); return; }
    if (file.size > 450 * 1024) {
      setMsg("图片太大了（>450KB）。为了 demo 速度，请用截图裁剪一下再上传。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImgData(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!userId) return;
    setBusy(true);
    setMsg(null);

    try {
      if (!imgData) throw new Error("请先上传赞助截图");
      const { error } = await supabase.from("sponsor_proofs").insert({
        user_id: userId,
        memo: memo || null,
        image_base64: imgData,
        status: "pending",
      });

      if (error) throw error;
      setMemo("");
      setImgData(null);
      setMsg("已提交 ✅ 状态：审核中（Pending）");
      await refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "提交失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <TopBar />

      <div className={mode === "glass" ? "mt-6 glass-card rounded-3xl p-6" : "mt-6 senior-card rounded-2xl p-6"}>
        <h1 className={mode === "glass" ? "text-2xl font-semibold" : "text-2xl font-bold"}>赞助墙（必选项）</h1>
        <p className="mt-2 opacity-80 leading-relaxed">
          这是作业/MVP：不接真实支付 API，但“赞助流程”是必选项。
          你完成赞助后上传截图，我们会把状态置为 <b>Pending</b>，审核通过后才开始 <b>24 小时冷却</b>。
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className={box(mode)}>
            <div className="font-semibold">方式 A：Buy Me a Coffee</div>
            <p className="mt-2 text-sm opacity-80">点开链接完成赞助，然后回到这里上传截图。</p>
            <a className={linkBtn(mode)} href={process.env.NEXT_PUBLIC_BMC_URL || "https://buymeacoffee.com/"} target="_blank" rel="noreferrer">
              打开 BMC
            </a>
          </div>

          <div className={box(mode)}>
            <div className="font-semibold">方式 B：微信/支付宝二维码</div>
            <p className="mt-2 text-sm opacity-80">扫码赞助后，上传截图即可。</p>
            <div className={mode === "glass" ? "mt-3 rounded-2xl bg-white/5 p-3 border border-white/10" : "mt-3 rounded-xl bg-slate-50 p-3 border border-slate-200"}>
              {process.env.NEXT_PUBLIC_QR_URL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={process.env.NEXT_PUBLIC_QR_URL} alt="QR" className="w-full max-w-[260px] rounded-xl" />
              ) : (
                <div className="text-sm opacity-70">未配置 QR（NEXT_PUBLIC_QR_URL）</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="grid gap-2">
            <div className="text-sm font-semibold">备注（可选）</div>
            <input className={input(mode)} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="例如：群昵称/订单备注/随便一句话" />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold">上传赞助截图（必填）</div>
            <input
              className={mode === "glass" ? "text-sm" : "text-base"}
              type="file"
              accept="image/*"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            {imgData ? (
              <div className={mode === "glass" ? "rounded-2xl border border-white/10 p-3" : "rounded-xl border border-slate-200 p-3"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgData} alt="proof-preview" className="max-h-[260px] rounded-xl" />
              </div>
            ) : null}
          </div>

          <button disabled={busy} className={primary(mode)} onClick={submit}>
            {busy ? "提交中…" : "提交凭证进入审核"}
          </button>

          {msg ? <div className="text-sm opacity-85">{msg}</div> : null}

          <div className="mt-3 text-xs opacity-70">
            提示：你可以去 Dashboard 查看当前解锁状态。
          </div>
        </div>
      </div>

      {latest ? (
        <div className={mode === "glass" ? "mt-4 glass-card rounded-3xl p-5" : "mt-4 senior-card rounded-2xl p-5"}>
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">最近一次提交</div>
            <button className={btn(mode)} onClick={refresh}>刷新</button>
          </div>
          <div className="mt-2 text-sm opacity-80">
            状态：<b>{latest.status}</b> ｜时间：{new Date(latest.created_at).toLocaleString()}
          </div>
          <div className="mt-1 text-sm opacity-70">备注：{latest.memo ?? "—"}</div>
          <p className="mt-3 text-xs opacity-70">
            只有当状态变为 <b>approved</b>，系统才会开始 24h 倒计时；到点才可看数据。
          </p>
        </div>
      ) : null}
    </Shell>
  );
}

function box(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-3xl border border-white/10 p-4"
    : "rounded-2xl border border-slate-200 p-4";
}
function linkBtn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "mt-3 inline-block rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium border border-white/15 hover:bg-white/15"
    : "mt-3 inline-block rounded-xl bg-slate-900 px-4 py-3 text-base font-bold text-white hover:bg-slate-800";
}
function btn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15 border border-white/15"
    : "rounded-xl bg-slate-900 px-4 py-3 text-base font-bold text-white hover:bg-slate-800";
}
function primary(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/20 border border-white/15"
    : "rounded-xl bg-red-600 px-5 py-4 text-lg font-bold text-white hover:bg-red-700";
}
function input(mode: "glass" | "senior") {
  return mode === "glass"
    ? "w-full rounded-2xl bg-white/10 px-4 py-3 text-sm outline-none border border-white/15 focus:border-white/30"
    : "w-full rounded-xl bg-white px-4 py-4 text-lg outline-none border border-slate-200 focus:border-slate-400";
}
