"use client";

import { useState } from "react";

type Setting = {
  openaiApiKey?: string | null;
  openaiBaseUrl?: string | null;
  openaiModel?: string | null;
};

export function SettingsForm({ setting }: { setting: Setting }) {
  const [openaiApiKey, setOpenaiApiKey] = useState(setting.openaiApiKey || "");
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(setting.openaiBaseUrl || "https://api.openai.com/v1");
  const [openaiModel, setOpenaiModel] = useState(setting.openaiModel || "gpt-4o-mini");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openaiApiKey, openaiBaseUrl, openaiModel })
    });
    setLoading(false);
    setMessage(response.ok ? "已保存模型配置" : "保存失败");
  }

  async function test() {
    setLoading(true);
    setMessage("");
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openaiApiKey, openaiBaseUrl, openaiModel })
    });
    const response = await fetch("/api/settings/test", { method: "POST" });
    const data = await response.json();
    setLoading(false);
    setMessage(response.ok ? `连接成功：${data.output}` : `连接失败：${data.error}`);
  }

  return (
    <form onSubmit={save} className="card max-w-3xl p-4 sm:p-6">
      <div className="space-y-4">
        <label>
          <span className="label">API Key</span>
          <input className="field" type="password" value={openaiApiKey} onChange={(event) => setOpenaiApiKey(event.target.value)} placeholder="sk-..." />
        </label>
        <label>
          <span className="label">Base URL</span>
          <input className="field" value={openaiBaseUrl} onChange={(event) => setOpenaiBaseUrl(event.target.value)} placeholder="https://api.openai.com/v1" />
        </label>
        <label>
          <span className="label">模型名称</span>
          <input className="field" value={openaiModel} onChange={(event) => setOpenaiModel(event.target.value)} placeholder="gpt-4o-mini / deepseek-chat / kimi..." />
        </label>
      </div>
      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={loading} className="btn-primary">{loading ? "处理中..." : "保存配置"}</button>
        <button disabled={loading} type="button" onClick={test} className="btn-secondary">{loading ? "测试中..." : "测试模型连接"}</button>
      </div>
    </form>
  );
}
