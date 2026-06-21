import { AgentCenter } from "@/components/agent-center";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const clients = await db.client.findMany({
    select: { id: true, companyName: true, bossName: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div>
      <PageHeader title="智能体中心" description="内置 6 个智能体：并购分析、销售话术、异议处理、一页纸报告、国学引流、短视频脚本。" />
      <AgentCenter clients={JSON.parse(JSON.stringify(clients))} />
    </div>
  );
}
