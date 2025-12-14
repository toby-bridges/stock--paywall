import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const key = process.env.FMP_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing FMP_API_KEY" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return NextResponse.json({ error: `FMP error: ${r.status}` }, { status: 500 });
  return NextResponse.json(await r.json());
}
