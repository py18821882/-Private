"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { clientLevels } from "@/lib/types";

type ClientRow = {
  id: string;
  companyName: string;
  bossName: string | null;
  phone: string | null;
  city: string | null;
  industry: string | null;
  stage: string | null;
  level: string;
  closeProbability: number;
  updatedAt: string;
};

export function ClientsList({ clients }: { clients: ClientRow[] }) {
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");

  const industries = Array.from(new Set(clients.map((item) => item.industry).filter(Boolean))) as string[];
  const stages = Array.from(new Set(clients.map((item) => item.stage).filter(Boolean))) as string[];

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const text = `${client.companyName} ${client.bossName || ""} ${client.phone || ""}`.toLowerCase();
      return (
        (!keyword || text.includes(keyword.toLowerCase())) &&
        (!level || client.level === level) &&
        (!industry || client.industry === industry) &&
        (!stage || client.stage === stage)
      );
    });
  }, [clients, keyword, level, industry, stage]);

  return (
    <div className="space-y-4">
      <div className="card grid gap-3 p-4 md:grid-cols-4">
        <label className="md:col-span-1">
          <span className="label">搜索</span>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input className="field pl-9" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="企业 / 老板 / 电话" />
          </div>
        </label>
        <label>
          <span className="label">A/B/C 等级</span>
          <select className="field" value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">全部</option>
            {clientLevels.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="label">行业</span>
          <select className="field" value={industry} onChange={(event) => setIndustry(event.target.value)}>
            <option value="">全部</option>
            {industries.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="label">跟进状态</span>
          <select className="field" value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="">全部</option>
            {stages.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">企业</th>
                <th className="px-4 py-3">老板</th>
                <th className="px-4 py-3">行业/城市</th>
                <th className="px-4 py-3">阶段</th>
                <th className="px-4 py-3">等级</th>
                <th className="px-4 py-3">成交概率</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{client.companyName}</td>
                  <td className="px-4 py-3">{client.bossName || "-"}<div className="text-xs text-slate-400">{client.phone || ""}</div></td>
                  <td className="px-4 py-3">{client.industry || "-"}<div className="text-xs text-slate-400">{client.city || ""}</div></td>
                  <td className="px-4 py-3">{client.stage || "-"}</td>
                  <td className="px-4 py-3"><span className="rounded bg-wine px-2 py-1 text-xs font-bold text-white">{client.level}</span></td>
                  <td className="px-4 py-3">{client.closeProbability}%</td>
                  <td className="px-4 py-3"><Link className="font-semibold text-wine hover:underline" href={`/clients/${client.id}`}>查看详情</Link></td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={7}>暂无客户</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
