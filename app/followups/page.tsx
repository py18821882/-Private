import { FollowupsClient } from "@/components/followups-client";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function FollowupsPage() {
  const [clients, followups] = await Promise.all([
    db.client.findMany({ select: { id: true, companyName: true }, orderBy: { updatedAt: "desc" } }),
    db.followUp.findMany({ include: { client: { select: { companyName: true } } }, orderBy: { followUpDate: "asc" } })
  ]);

  return (
    <div>
      <PageHeader title="跟进任务" description="查看今日待跟进、新增任务、更新跟进状态。" />
      <FollowupsClient clients={JSON.parse(JSON.stringify(clients))} followups={JSON.parse(JSON.stringify(followups))} />
    </div>
  );
}
