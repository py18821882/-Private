import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreClient } from "@/lib/scoring";

export const runtime = "nodejs";

export async function GET() {
  const clients = await db.client.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.companyName?.trim()) {
    return NextResponse.json({ error: "企业名称不能为空" }, { status: 400 });
  }

  const scoring = scoreClient(body);
  const client = await db.client.create({
    data: {
      companyName: body.companyName.trim(),
      bossName: body.bossName || null,
      phone: body.phone || null,
      wechat: body.wechat || null,
      city: body.city || null,
      industry: body.industry || null,
      revenue: body.revenue || null,
      profit: body.profit || null,
      cashflow: body.cashflow || null,
      fixedAssets: body.fixedAssets || null,
      debt: body.debt || null,
      receivables: body.receivables || null,
      employeeCount: body.employeeCount || null,
      customerStructure: body.customerStructure || null,
      bossDemand: body.bossDemand || null,
      financingNeed: Boolean(body.financingNeed),
      maNeed: Boolean(body.maNeed),
      summitInterest: Boolean(body.summitInterest),
      paidAssessmentInterest: Boolean(body.paidAssessmentInterest),
      stage: body.stage || "初次接触",
      notes: body.notes || null,
      ...scoring
    }
  });

  return NextResponse.json(client, { status: 201 });
}
