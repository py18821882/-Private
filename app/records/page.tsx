import { PageHeader } from "@/components/page-header";
import { RecordsClient } from "@/components/records-client";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const records = await db.agentRun.findMany({
    include: { client: { select: { companyName: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <PageHeader title="生成记录" description="查看所有 AI 生成内容，支持搜索、筛选、复制、删除。" />
      <RecordsClient records={JSON.parse(JSON.stringify(records))} />
    </div>
  );
}
