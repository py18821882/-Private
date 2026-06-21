import { notFound } from "next/navigation";
import { ClientActions } from "@/components/client-actions";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";
import { agentTypeLabels } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const infoRows = [
  ["bossName", "老板姓名"],
  ["phone", "电话"],
  ["wechat", "微信"],
  ["city", "所在城市"],
  ["industry", "行业"],
  ["revenue", "年营收"],
  ["profit", "年利润"],
  ["cashflow", "现金流"],
  ["fixedAssets", "固定资产"],
  ["debt", "银行负债"],
  ["receivables", "应收账款"],
  ["employeeCount", "员工人数"],
  ["stage", "当前沟通阶段"]
] as const;

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await db.client.findUnique({
    where: { id: params.id },
    include: {
      followUps: { orderBy: { followUpDate: "desc" } },
      agentRuns: { orderBy: { createdAt: "desc" }, take: 8 }
    }
  });

  if (!client) notFound();

  const nextFollowup = client.followUps.find((item) => item.status === "未跟进");

  return (
    <div>
      <PageHeader title={client.companyName} description="客户资料、跟进记录、生成记录和下一步动作。" />

      <div className="grid gap-4 xl:grid-cols-[1fr,420px]">
        <div className="space-y-4">
          <section className="card p-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded bg-wine px-3 py-1 text-sm font-bold text-white">等级 {client.level}</span>
              <span className="rounded bg-gold/15 px-3 py-1 text-sm font-semibold text-amber-800">成交概率 {client.closeProbability}%</span>
              <span className="rounded bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">下一步：{nextFollowup?.nextAction || "待添加跟进动作"}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {infoRows.map(([key, label]) => (
                <div key={key} className="rounded-md bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="mt-1 font-semibold text-slate-900">{client[key] || "-"}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <TextBlock title="客户结构" text={client.customerStructure} />
              <TextBlock title="老板诉求" text={client.bossDemand} />
              <TextBlock title="备注" text={client.notes} />
            </div>
          </section>

          <ClientActions clientId={client.id} />
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <div className="mb-3 font-semibold text-slate-950">跟进记录</div>
            <div className="space-y-3">
              {client.followUps.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">{item.status}</span>
                    <span className="text-xs text-slate-400">{item.followUpDate.toLocaleString("zh-CN")}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">{item.content}</div>
                  {item.nextAction ? <div className="mt-1 text-xs text-slate-500">下一步：{item.nextAction}</div> : null}
                </div>
              ))}
              {!client.followUps.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无跟进记录</div> : null}
            </div>
          </section>

          <section className="card p-4">
            <div className="mb-3 font-semibold text-slate-950">生成记录</div>
            <div className="space-y-3">
              {client.agentRuns.map((run) => (
                <div key={run.id} className="rounded-md border border-slate-100 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">{agentTypeLabels[run.agentType] || run.agentType}</div>
                    <CopyButton text={run.output} />
                  </div>
                  <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-600">{run.output}</pre>
                </div>
              ))}
              {!client.agentRuns.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无生成记录</div> : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text?: string | null }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{text || "-"}</div>
    </div>
  );
}
