import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const setting = await db.userSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!setting) return NextResponse.json({});
  return NextResponse.json({
    ...setting,
    openaiApiKey: setting.openaiApiKey ? "" : null
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const existing = await db.userSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  const data = {
    openaiApiKey: body.openaiApiKey || existing?.openaiApiKey || null,
    openaiBaseUrl: body.openaiBaseUrl || "https://api.openai.com/v1",
    openaiModel: body.openaiModel || "gpt-4o-mini"
  };

  const setting = existing
    ? await db.userSetting.update({ where: { id: existing.id }, data })
    : await db.userSetting.create({ data });

  return NextResponse.json(setting);
}
