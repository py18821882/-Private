import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.contentItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
