import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreClient } from "@/lib/scoring";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const client = await db.client.findUnique({
    where: { id: params.id },
    include: {
      followUps: { orderBy: { followUpDate: "asc" } },
      agentRuns: { orderBy: { createdAt: "desc" }, take: 20 }
    }
  });

  if (!client) return NextResponse.json({ error: "客户不存在" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const scoring = scoreClient(body);
  const client = await db.client.update({
    where: { id: params.id },
    data: {
      companyName: body.companyName,
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
      stage: body.stage || null,
      notes: body.notes || null,
      ...scoring
    }
  });

  return NextResponse.json(client);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
