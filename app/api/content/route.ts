import { NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";
import { db } from "@/lib/db";
import { guoxueContentPrompt } from "@/lib/prompts/guoxue-content";
import { shortVideoScriptPrompt } from "@/lib/prompts/short-video-script";

export const runtime = "nodejs";

const contentPrompts: Record<string, string> = {
  "并购口播": `${shortVideoScriptPrompt}\n主题限定：并购、资本、老板认知、企业转型。`,
  "国学口播": guoxueContentPrompt,
  "朋友圈文案": "你是老板私域朋友圈文案策划，文案要短、有观点、有转化，但不能像硬广告。",
  "短视频标题": "你是短视频标题策划，请输出 20 个标题，要求有钩子、有老板感、有传播性，不低俗。"
};

export async function GET() {
  const items = await db.contentItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.input?.trim()) {
      return NextResponse.json({ error: "请输入选题或素材" }, { status: 400 });
    }
    const contentType = body.contentType || "并购口播";
    const system = contentPrompts[contentType] || contentPrompts["并购口播"];
    const output = await generateChatCompletion([
      { role: "system", content: system },
      { role: "user", content: `选题/素材：\n${body.input}\n\n请输出可直接使用的中文内容。` }
    ]);

    const item = await db.contentItem.create({
      data: {
        title: body.title || body.input.slice(0, 30),
        contentType,
        input: body.input,
        output
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成失败" }, { status: 500 });
  }
}
