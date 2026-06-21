"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const textFields = [
  ["companyName", "企业名称", "必填"],
  ["bossName", "老板姓名", ""],
  ["phone", "电话", ""],
  ["wechat", "微信", ""],
  ["city", "所在城市", ""],
  ["industry", "行业", "如：精密制造、建材、食品加工"],
  ["revenue", "年营收", "如：3000万 / 1.2亿"],
  ["profit", "年利润", "如：300万"],
  ["cashflow", "现金流", ""],
  ["fixedAssets", "固定资产", ""],
  ["debt", "银行负债", ""],
  ["receivables", "应收账款", ""],
  ["employeeCount", "员工人数", ""],
  ["stage", "当前沟通阶段", "初次接触 / 已沟通 / 已邀约"]
];

const checkFields = [
  ["financingNeed", "有融资需求"],
  ["maNeed", "有并购/转让/入股想法"],
  ["summitInterest", "愿意参加峰会"],
  ["paidAssessmentInterest", "接受付费评估"]
];

export function ClientForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, FormDataEntryValue | boolean> = {};

    textFields.forEach(([name]) => {
      payload[name] = formData.get(name) || "";
    });
    ["customerStructure", "bossDemand", "notes"].forEach((name) => {
      payload[name] = formData.get(name) || "";
    });
    checkFields.forEach(([name]) => {
      payload[name] = formData.get(name) === "on";
    });

    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "保存失败");
      return;
    }
    router.push(`/clients/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {textFields.map(([name, label, placeholder]) => (
          <label key={name}>
            <span className="label">{label}</span>
            <input name={name} required={name === "companyName"} placeholder={placeholder} className="field" />
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <label>
          <span className="label">客户结构</span>
          <textarea name="customerStructure" className="field min-h-28" placeholder="大客户依赖、渠道结构、区域市场等" />
        </label>
        <label>
          <span className="label">老板诉求</span>
          <textarea name="bossDemand" className="field min-h-28" placeholder="融资、转让、接班、利润下滑、转型焦虑等" />
        </label>
        <label>
          <span className="label">备注</span>
          <textarea name="notes" className="field min-h-28" placeholder="聊天记录、关键判断、下一步动作" />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {checkFields.map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input name={name} type="checkbox" className="h-4 w-4 accent-wine" />
            {label}
          </label>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <div className="mt-6 flex justify-end">
        <button disabled={loading} className="btn-primary">
          {loading ? "保存中..." : "保存客户"}
        </button>
      </div>
    </form>
  );
}
