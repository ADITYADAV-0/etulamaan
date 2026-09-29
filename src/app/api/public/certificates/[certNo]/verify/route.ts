import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { certNo: string } }) {
  const certNo = params.certNo.toUpperCase();
  if (certNo !== "ETM-2026-000001") return NextResponse.json({ error: { code: "NOT_FOUND", message: "Certificate not found" } }, { status: 404 });
  return NextResponse.json({ status: "VALID", category: "Category A (placeholder)", issuedAt: "2026-09-28T00:00:00.000Z", validUntil: "2027-09-28T00:00:00.000Z" });
}
