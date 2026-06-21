"use client";

import { Bot, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { agentTypeLabels, followUpStatuses } from "@/lib/types";

const detailAgents = [
  ["maAnalysis", "生成并购分析"],
  ["salesScript", "生成电话话术"],
  ["salesScript", "生成微信跟进"],
  ["objectionHandling", "生成异议处理"],
  ["onePageReport", "生成一页纸报告"],
  ["shortVideoScript", "生成朋友圈文案"]
];

export function ClientActions({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);

  async function generate(agentType: string, label: string) {
    setLoading(label);
    setError("");
    setOutput("");
    const response = await fetch("/api/agent-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, agentType, input: `${label}\n${input}` })
    });
    const data = await response.json();
    setLoading("");
    if (!response.ok) {
      setError(data.error || "生成失败");
      return;
    }
    setOutput(data.output);
    router.refresh();
  }

  async function addFollowup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFollowLoading(true);
    const form = new FormData(event.currentTarget);
    await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        content: form.get("content"),
        nextAction: form.get("nextAction"),
        followUpDate: form.get("followUpDate"),
        status: form.get("status")
      })
    });
    setFollowLoading(false);
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950">
          <Bot size={18} />
          客户智能生成
        </div>
        <textarea
          className="field min-h-24"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="可粘贴聊天记录、客户反应、老板原话。留空也可以直接基于客户资料生成。"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {detailAgents.map(([agentType, label]) => (
            <button key={`${agentType}-${label}`} type="button" className="btn-secondary justify-start" disabled={Boolean(loading)} onClick={() => generate(agentType, label)}>
              {loading === label ? "生成中..." : label}
            </button>
          ))}
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        {output ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-700">最新生成结果</div>
              <CopyButton text={output} />
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{output}</pre>
          </div>
        ) : null}
      </section>

      <section className="card p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950">
          <Plus size={18} />
          添加跟进记录
        </div>
        <form onSubmit={addFollowup} className="grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="label">跟进内容</span>
            <textarea name="content" required className="field min-h-20" placeholder="本次沟通结果、客户态度、关键问题" />
          </label>
          <label>
            <span className="label">下一步动作</span>
            <input name="nextAction" className="field" placeholder="发资料 / 邀约峰会 / 约电话" />
          </label>
          <label>
            <span className="label">跟进时间</span>
            <input name="followUpDate" type="datetime-local" required className="field" />
          </label>
          <label>
            <span className="label">状态</span>
            <select name="status" className="field" defaultValue="未跟进">
              {followUpStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <div className="flex items-end justify-end">
            <button disabled={followLoading} className="btn-primary">{followLoading ? "保存中..." : "保存跟进"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
