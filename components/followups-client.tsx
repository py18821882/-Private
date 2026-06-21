"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { followUpStatuses } from "@/lib/types";

type ClientOption = { id: string; companyName: string };
type FollowUpRow = {
  id: string;
  clientId: string;
  content: string;
  nextAction: string | null;
  followUpDate: string;
  status: string;
  client: { companyName: string };
};

export function FollowupsClient({ clients, followups }: { clients: ClientOption[]; followups: FollowUpRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const filtered = useMemo(() => {
    return followups.filter((item) => !status || item.status === status);
  }, [followups, status]);

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: form.get("clientId"),
        content: form.get("content"),
        nextAction: form.get("nextAction"),
        followUpDate: form.get("followUpDate"),
        status: form.get("status")
      })
    });
    setLoading(false);
    event.currentTarget.reset();
    router.refresh();
  }

  async function updateStatus(id: string, nextStatus: string) {
    await fetch(`/api/followups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px,1fr]">
      <section className="card p-4">
        <div className="mb-3 font-semibold text-slate-950">新增跟进任务</div>
        <form onSubmit={add} className="space-y-3">
          <label>
            <span className="label">客户</span>
            <select name="clientId" required className="field">
              <option value="">选择客户</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.companyName}</option>)}
            </select>
          </label>
          <label>
            <span className="label">跟进内容</span>
            <textarea name="content" required className="field min-h-24" />
          </label>
          <label>
            <span className="label">下一步动作</span>
            <input name="nextAction" className="field" />
          </label>
          <label>
            <span className="label">跟进时间</span>
            <input name="followUpDate" required type="datetime-local" className="field" />
          </label>
          <label>
            <span className="label">状态</span>
            <select name="status" className="field" defaultValue="未跟进">
              {followUpStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button disabled={loading} className="btn-primary w-full">{loading ? "保存中..." : "保存任务"}</button>
        </form>
      </section>
      <section className="space-y-3">
        <div className="card flex items-center justify-between gap-3 p-4">
          <div>
            <div className="font-semibold text-slate-950">跟进列表</div>
            <div className="text-xs text-slate-500">今日到期会在卡片上标红</div>
          </div>
          <select className="field max-w-40" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">全部状态</option>
            {followUpStatuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        {filtered.map((item) => {
          const due = new Date(item.followUpDate) <= todayEnd && item.status === "未跟进";
          return (
            <article key={item.id} className={`card p-4 ${due ? "border-wine" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/clients/${item.clientId}`} className="font-semibold text-slate-950 hover:text-wine">{item.client.companyName}</Link>
                  <div className="mt-1 text-sm text-slate-700">{item.content}</div>
                  {item.nextAction ? <div className="mt-2 text-sm text-slate-500">下一步：{item.nextAction}</div> : null}
                  <div className="mt-2 text-xs text-slate-400">{new Date(item.followUpDate).toLocaleString("zh-CN")}</div>
                </div>
                <select className="field max-w-32" value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>
                  {followUpStatuses.map((statusItem) => <option key={statusItem}>{statusItem}</option>)}
                </select>
              </div>
            </article>
          );
        })}
        {!filtered.length ? <div className="card p-8 text-center text-sm text-slate-500">暂无跟进任务</div> : null}
      </section>
    </div>
  );
}
