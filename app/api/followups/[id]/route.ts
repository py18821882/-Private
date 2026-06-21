import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const followup = await db.followUp.update({
    where: { id: params.id },
    data: {
      content: body.content,
      nextAction: body.nextAction || null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
      status: body.status
    }
  });
  return NextResponse.json(followup);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.followUp.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
