import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const items = await db.knowledgeItem.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }
  const item = await db.knowledgeItem.create({
    data: {
      title: body.title.trim(),
      category: body.category || null,
      content: body.content.trim()
    }
  });
  return NextResponse.json(item, { status: 201 });
}
