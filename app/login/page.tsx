"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { TopBar } from "@/components/TopBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useUIMode } from "@/components/UIModeProvider";

export default function LoginPage() {
  const { mode } = useUIMode();
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace("/dashboard"); });
  }, [router, supabase.auth]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("注册成功：回到 Dashboard。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setMsg(err?.message ?? "出错了");
    } finally { setBusy(false); }
  }

  return (
    <Shell>
      <TopBar />
      <div className={mode === "glass" ? "mt-6 glass-card rounded-3xl p-6" : "mt-6 senior-card rounded-2xl p-6"}>
        <h1 className={mode === "glass" ? "text-2xl font-semibold" : "text-2xl font-bold"}>
          {isSignUp ? "创建账号" : "登录"}
        </h1>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-sm opacity-80">邮箱</label>
            <input className={inputClass(mode)} value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm opacity-80">密码（>= 6 位）</label>
            <input className={inputClass(mode)} value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} />
          </div>
          <button disabled={busy} className={primaryBtn(mode)}>{busy ? "处理中..." : (isSignUp ? "注册" : "登录")}</button>
          <button type="button" className={secondaryBtn(mode)} onClick={() => setIsSignUp(v => !v)}>
            {isSignUp ? "已有账号？去登录" : "没有账号？去注册"}
          </button>
          {msg ? <div className="text-sm opacity-85">{msg}</div> : null}
        </form>
      </div>
    </Shell>
  );
}

function inputClass(mode: "glass" | "senior") {
  return mode === "glass"
    ? "rounded-2xl bg-white/10 px-4 py-3 text-sm outline-none border border-white/15 focus:border-white/30"
    : "rounded-xl bg-white px-4 py-4 text-lg outline-none border border-slate-200 focus:border-slate-400";
}
function primaryBtn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "w-full rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/20 border border-white/15"
    : "w-full rounded-xl bg-red-600 px-5 py-4 text-lg font-bold text-white hover:bg-red-700";
}
function secondaryBtn(mode: "glass" | "senior") {
  return mode === "glass"
    ? "w-full rounded-2xl bg-transparent px-4 py-3 text-sm font-semibold hover:bg-white/10 border border-white/15"
    : "w-full rounded-xl bg-white px-5 py-4 text-lg font-bold text-slate-900 border border-slate-200 hover:bg-slate-50";
}
