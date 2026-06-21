import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientsList } from "@/components/clients-list";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await db.client.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="客户列表"
        description="查看、筛选、搜索全部客户。"
        action={<Link href="/clients/new" className="btn-primary"><Plus size={16} />新增客户</Link>}
      />
      <ClientsList clients={JSON.parse(JSON.stringify(clients))} />
    </div>
  );
}
