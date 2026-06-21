import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateChatCompletion } from "@/lib/ai";
import { promptsByAgentType } from "@/lib/prompts";
import { agentTypeLabels } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const runs = await db.agentRun.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = promptsByAgentType[body.agentType];
    if (!prompt) return NextResponse.json({ error: "未知智能体类型" }, { status: 400 });

    const client = body.clientId
      ? await db.client.findUnique({ where: { id: body.clientId } })
      : null;
    const knowledge = await db.knowledgeItem.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5
    });

    const input = [
      client ? `客户资料：\n${JSON.stringify(client, null, 2)}` : "",
      body.input ? `补充输入：\n${body.input}` : "",
      knowledge.length
        ? `可引用的个人知识库摘要：\n${knowledge
            .map((item) => `【${item.category || "未分类"}】${item.title}\n${item.content.slice(0, 1200)}`)
            .join("\n\n")}`
        : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!input.trim()) {
      return NextResponse.json({ error: "请先选择客户或输入生成要求" }, { status: 400 });
    }

    const output = await generateChatCompletion([
      { role: "system", content: prompt },
      {
        role: "user",
        content: `${input}\n\n请按「${agentTypeLabels[body.agentType]}」要求输出，内容可直接复制使用。`
      }
    ]);

    const run = await db.agentRun.create({
      data: {
        clientId: client?.id || null,
        agentType: body.agentType,
        input,
        output
      },
      include: { client: true }
    });

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成失败" }, { status: 500 });
  }
}
