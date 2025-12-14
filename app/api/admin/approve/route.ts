import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function authAdmin(req: Request) {
  const token = req.headers.get("x-admin-token") || "";
  const expected = process.env.ADMIN_TOKEN || "";
  return expected && token === expected;
}

export async function POST(req: Request) {
  if (!authAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, proofId } = await req.json();
  if (!userId || !proofId) return NextResponse.json({ error: "Missing userId/proofId" }, { status: 400 });

  const paidAt = new Date();
  const unlockAt = new Date(paidAt.getTime() + 24 * 60 * 60 * 1000);

  const admin = supabaseAdmin();

  const { error: pErr } = await admin
    .from("profiles")
    .upsert({ id: userId, paid_at: paidAt.toISOString(), unlock_at: unlockAt.toISOString() });

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const { error: prErr } = await admin
    .from("sponsor_proofs")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", proofId);

  if (prErr) return NextResponse.json({ error: prErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, paid_at: paidAt.toISOString(), unlock_at: unlockAt.toISOString() });
}
