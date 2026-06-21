import { NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST() {
  try {
    const output = await generateChatCompletion([
      { role: "system", content: "你是连接测试助手，只回复 OK。" },
      { role: "user", content: "测试连接" }
    ], 0);
    return NextResponse.json({ ok: true, output });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "测试失败" }, { status: 500 });
  }
}
