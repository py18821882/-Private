import Link from "next/link";
import { Bot, CalendarCheck, FilePlus2, FileText, PenLine, Users, Video } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";
import { agentTypeLabels } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const shortcuts = [
  { href: "/clients/new", label: "新增客户", icon: FilePlus2 },
  { href: "/agents", label: "并购分析", icon: Bot },
  { href: "/agents", label: "生成话术", icon: PenLine },
  { href: "/agents", label: "生成一页纸报告", icon: FileText },
  { href: "/content", label: "生成国学文案", icon: Video },
  { href: "/content", label: "生成短视频脚本", icon: Video }
];

export default async function DashboardPage() {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [todayFollowups, recentClients, recentRuns, highValueCount, clientCount] = await Promise.all([
    db.followUp.findMany({
      where: { followUpDate: { lte: endOfToday }, status: "未跟进" },
      include: { client: true },
      orderBy: { followUpDate: "asc" },
      take: 8
    }),
    db.client.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.agentRun.findMany({ include: { client: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.client.count({ where: { level: "A" } }),
    db.client.count()
  ]);

  return (
    <div>
      <PageHeader title="个人工作台首页" description="每天处理客户、生成话术、推进跟进的入口。" />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4">
          <div className="text-sm text-slate-500">今日待跟进</div>
          <div className="mt-2 text-3xl font-bold text-wine">{todayFollowups.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">客户总数</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{clientCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">高价值客户</div>
          <div className="mt-2 text-3xl font-bold text-gold">{highValueCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">最近生成内容</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{recentRuns.length}</div>
        </div>
      </div>

      <section className="mt-5 card p-4">
        <div className="mb-3 font-semibold text-slate-950">快捷入口</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 hover:border-wine hover:text-wine">
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <section className="card p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950"><CalendarCheck size={18} />今日待跟进客户</div>
          <div className="space-y-3">
            {todayFollowups.map((item) => (
              <Link key={item.id} href={`/clients/${item.clientId}`} className="block rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                <div className="font-semibold text-slate-900">{item.client.companyName}</div>
                <div className="mt-1 text-sm text-slate-600">{item.nextAction || item.content}</div>
                <div className="mt-1 text-xs text-slate-400">{item.followUpDate.toLocaleString("zh-CN")}</div>
              </Link>
            ))}
            {!todayFollowups.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">今天没有待跟进任务</div> : null}
          </div>
        </section>

        <section className="card p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950"><Users size={18} />最近新增客户</div>
          <div className="space-y-3">
            {recentClients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`} className="block rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-900">{client.companyName}</div>
                  <span className="rounded bg-wine px-2 py-1 text-xs font-bold text-white">{client.level}</span>
                </div>
                <div className="mt-1 text-sm text-slate-500">{client.industry || "未填行业"} · {client.bossName || "未填老板"}</div>
              </Link>
            ))}
            {!recentClients.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无客户</div> : null}
          </div>
        </section>

        <section className="card p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950"><FileText size={18} />最近生成内容</div>
          <div className="space-y-3">
            {recentRuns.map((run) => (
              <Link key={run.id} href="/records" className="block rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                <div className="font-semibold text-slate-900">{agentTypeLabels[run.agentType] || run.agentType}</div>
                <div className="mt-1 text-sm text-slate-500">{run.client?.companyName || "未关联客户"}</div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-400">{run.output}</div>
              </Link>
            ))}
            {!recentRuns.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无生成记录</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
