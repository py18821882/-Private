"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { agentTypeLabels } from "@/lib/types";

type Run = {
  id: string;
  agentType: string;
  input: string;
  output: string;
  createdAt: string;
  client: { companyName: string } | null;
};

export function RecordsClient({ records }: { records: Run[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [agentType, setAgentType] = useState("");

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const text = `${record.output} ${record.input} ${record.client?.companyName || ""}`.toLowerCase();
      return (!keyword || text.includes(keyword.toLowerCase())) && (!agentType || record.agentType === agentType);
    });
  }, [records, keyword, agentType]);

  async function remove(id: string) {
    await fetch(`/api/agent-runs/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card grid gap-3 p-4 md:grid-cols-2">
        <label>
          <span className="label">搜索关键词</span>
          <input className="field" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索生成内容、输入、客户" />
        </label>
        <label>
          <span className="label">智能体类型</span>
          <select className="field" value={agentType} onChange={(event) => setAgentType(event.target.value)}>
            <option value="">全部</option>
            {Object.entries(agentTypeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {filtered.map((record) => (
          <article key={record.id} className="card p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-slate-950">{agentTypeLabels[record.agentType] || record.agentType}</div>
                <div className="text-xs text-slate-500">
                  {record.client?.companyName || "未关联客户"} · {new Date(record.createdAt).toLocaleString("zh-CN")}
                </div>
              </div>
              <div className="flex gap-2">
                <CopyButton text={record.output} />
                <button type="button" onClick={() => remove(record.id)} className="btn-secondary text-red-700">
                  <Trash2 size={15} />
                  删除
                </button>
              </div>
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-7 text-slate-800">{record.output}</pre>
          </article>
        ))}
        {!filtered.length ? <div className="card p-8 text-center text-sm text-slate-500">暂无生成记录</div> : null}
      </div>
    </div>
  );
}
