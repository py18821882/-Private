"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

const types = ["并购口播", "国学口播", "朋友圈文案", "短视频标题"];

export function ContentStudio() {
  const router = useRouter();
  const [contentType, setContentType] = useState(types[0]);
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setOutput("");
    const response = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, contentType, input })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "生成失败");
      return;
    }
    setOutput(data.output);
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px,1fr]">
      <section className="card p-4">
        <div className="space-y-4">
          <label>
            <span className="label">内容类型</span>
            <select className="field" value={contentType} onChange={(event) => setContentType(event.target.value)}>
              {types.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            <span className="label">标题</span>
            <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="可选，用于保存记录" />
          </label>
          <label>
            <span className="label">选题 / 素材</span>
            <textarea className="field min-h-60" value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入选题、客户画像、账号定位、你想表达的观点。" />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="button" disabled={loading} onClick={generate} className="btn-primary w-full">{loading ? "生成中..." : "生成并保存内容"}</button>
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
            内容生成后会自动保存，后续可以从本页下方查看。
          </div>
        )}
      </section>
    </div>
  );
}
