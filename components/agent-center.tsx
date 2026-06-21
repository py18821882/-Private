"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { agentTypeLabels } from "@/lib/types";

type ClientOption = { id: string; companyName: string; bossName: string | null };

export function AgentCenter({ clients }: { clients: ClientOption[] }) {
  const [agentType, setAgentType] = useState("maAnalysis");
  const [clientId, setClientId] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setOutput("");
    const response = await fetch("/api/agent-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentType, clientId: clientId || null, input })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "生成失败");
      return;
    }
    setOutput(data.output);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px,1fr]">
      <section className="card p-4">
        <div className="space-y-4">
          <label>
            <span className="label">选择智能体</span>
            <select className="field" value={agentType} onChange={(event) => setAgentType(event.target.value)}>
              {Object.entries(agentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="label">关联客户</span>
            <select className="field" value={clientId} onChange={(event) => setClientId(event.target.value)}>
              <option value="">不关联客户，仅按输入生成</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.companyName} {client.bossName ? `- ${client.bossName}` : ""}</option>)}
            </select>
          </label>
          <label>
            <span className="label">输入素材</span>
            <textarea
              className="field min-h-56"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="粘贴客户资料、聊天记录、业务想法、短视频选题，或选择客户后补充具体要求。"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="button" disabled={loading} onClick={generate} className="btn-primary w-full">
            {loading ? "生成中..." : "开始生成并保存记录"}
          </button>
        </div>
      </section>
      <section className="card min-h-[520px] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold text-slate-950">输出结果</div>
          {output ? <CopyButton text={output} /> : null}
        </div>
        {output ? (
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{output}</pre>
        ) : (
          <div className="flex h-80 items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-400">
            选择智能体后生成内容，结果会自动保存到生成记录。
          </div>
        )}
      </section>
    </div>
  );
}
