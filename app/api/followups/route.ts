import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const followups = await db.followUp.findMany({
    include: { client: true },
    orderBy: { followUpDate: "asc" }
  });
  return NextResponse.json(followups);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.clientId || !body.content || !body.followUpDate) {
    return NextResponse.json({ error: "客户、跟进内容、跟进时间不能为空" }, { status: 400 });
  }

  const followup = await db.followUp.create({
    data: {
      clientId: body.clientId,
      content: body.content,
      nextAction: body.nextAction || null,
      followUpDate: new Date(body.followUpDate),
      status: body.status || "未跟进"
    }
  });

  return NextResponse.json(followup, { status: 201 });
}
