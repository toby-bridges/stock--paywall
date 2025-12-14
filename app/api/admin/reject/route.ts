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

  const { proofId } = await req.json();
  if (!proofId) return NextResponse.json({ error: "Missing proofId" }, { status: 400 });

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("sponsor_proofs")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", proofId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
