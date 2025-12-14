"use client";

import Link from "next/link";
import { Shell } from "@/components/Shell";
import { TopBar } from "@/components/TopBar";
import { useUIMode } from "@/components/UIModeProvider";

export default function Home() {
  const { mode } = useUIMode();

  return (
    <Shell>
      <TopBar />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className={mode === "glass" ? "glass-card rounded-3xl p-6" : "senior-card rounded-2xl p-6"}>
          <h1 className={mode === "glass" ? "text-3xl font-semibold" : "text-2xl font-bold"}>
            赞助墙（必选）→ 审核 → 24h 冷却 → 解锁数据
          </h1>
          <p className="mt-3 opacity-80 leading-relaxed">
            这是 vibe coding 作业：不接真实支付 API，但赞助流程必选。
            用户通过 BMC/二维码赞助后上传截图，审核通过后才开始 24 小时倒计时，倒计时结束才能查看当日股票价格与榜单。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className={primaryBtn(mode)} href="/login">登录 / 注册</Link>
            <Link className={ghostBtn(mode)} href="/dashboard">去 Dashboard</Link>
            <Link className={ghostBtn(mode)} href="/sponsor">提交赞助凭证</Link>
          </div>
          <p className="mt-4 text-xs opacity-70">
            视觉规则：玻璃版=美股习惯（绿涨红跌）；长辈版=A股习惯（红涨绿跌）。同一套组件，仅换主题。
          </p>
        </div>

        <div className={mode === "glass" ? "glass-card rounded-3xl p-6" : "senior-card rounded-2xl p-6"}>
          <h2 className={mode === "glass" ? "text-xl font-semibold" : "text-xl font-bold"}>
            Admin 审核台
          </h2>
          <p className="mt-3 opacity-85">
            打开 <code className="px-1 py-0.5 rounded bg-black/20">/admin</code> 审核用户截图（需要 ADMIN_TOKEN）。
            审核通过后写入 paid_at，并计算 unlock_at = paid_at + 24h。
          </p>
        </div>
      </div>
    </Shell>
  );
}

function primaryBtn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/20 border border-white/15"
    : "rounded-xl bg-red-600 px-5 py-3 text-base font-bold text-white hover:bg-red-700";
}

function ghostBtn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-transparent px-4 py-2 text-sm font-semibold hover:bg-white/10 border border-white/15"
    : "rounded-xl bg-white px-5 py-3 text-base font-bold text-slate-900 border border-slate-200 hover:bg-slate-50";
}
