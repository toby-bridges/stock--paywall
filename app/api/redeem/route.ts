import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    if (!code) return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });

    const allow = (process.env.PAYWALL_CODES || "").split(",").map(s => s.trim()).filter(Boolean);
    const demo = process.env.DEMO_MODE === "true";
    const ok = demo ? (String(code).trim().toUpperCase() === "DEMO") : allow.includes(String(code).trim());

    if (!ok) return NextResponse.json({ ok: false, error: "解锁码不正确" }, { status: 400 });

    const paidAt = new Date();
    const unlockAt = new Date(paidAt.getTime() + 24 * 60 * 60 * 1000);

    const admin = supabaseAdmin();
    const { error } = await admin.from("profiles").upsert({ id: userId, paid_at: paidAt.toISOString(), unlock_at: unlockAt.toISOString() });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, paid_at: paidAt.toISOString(), unlock_at: unlockAt.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Redeem error" }, { status: 500 });
  }
}
