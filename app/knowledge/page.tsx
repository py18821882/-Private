import { KnowledgeManager } from "@/components/knowledge-manager";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const items = await db.knowledgeItem.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <PageHeader title="个人知识库" description="保存常用话术、并购方法论、国学文案模板和案例。生成内容时会引用最近知识。" />
      <KnowledgeManager items={JSON.parse(JSON.stringify(items))} />
    </div>
  );
}
