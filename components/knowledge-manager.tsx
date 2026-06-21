"use client";

import { Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type KnowledgeItem = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  updatedAt: string;
};

export function KnowledgeManager({ items }: { items: KnowledgeItem[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => `${item.title} ${item.category || ""} ${item.content}`.toLowerCase().includes(keyword.toLowerCase()));
  }, [items, keyword]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, content })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "保存失败");
      return;
    }
    setTitle("");
    setCategory("");
    setContent("");
    router.refresh();
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError("只支持 txt / md 文件");
      return;
    }
    const text = await file.text();
    setTitle(file.name.replace(/\.(txt|md)$/i, ""));
    setCategory("上传资料");
    setContent(text);
  }

  async function remove(id: string) {
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px,1fr]">
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="font-semibold text-slate-950">新增知识</div>
          <label className="btn-secondary cursor-pointer">
            <Upload size={15} />
            上传 txt/md
            <input type="file" accept=".txt,.md" onChange={upload} className="hidden" />
          </label>
        </div>
        <form onSubmit={save} className="space-y-3">
          <label>
            <span className="label">标题</span>
            <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span className="label">分类</span>
            <input className="field" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="常用话术 / 并购方法论 / 国学模板 / 案例" />
          </label>
          <label>
            <span className="label">内容</span>
            <textarea className="field min-h-72" value={content} onChange={(event) => setContent(event.target.value)} />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button disabled={loading} className="btn-primary w-full">{loading ? "保存中..." : "保存到知识库"}</button>
        </form>
      </section>
      <section className="space-y-3">
        <div className="card p-4">
          <label>
            <span className="label">关键词搜索</span>
            <input className="field" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索话术、案例、方法论" />
          </label>
        </div>
        {filtered.map((item) => (
          <article key={item.id} className="card p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-950">{item.title}</div>
                <div className="text-xs text-slate-500">{item.category || "未分类"} · {new Date(item.updatedAt).toLocaleString("zh-CN")}</div>
              </div>
              <button type="button" className="btn-secondary text-red-700" onClick={() => remove(item.id)}>
                <Trash2 size={15} />
                删除
              </button>
            </div>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-7 text-slate-700">{item.content}</pre>
          </article>
        ))}
        {!filtered.length ? <div className="card p-8 text-center text-sm text-slate-500">暂无知识内容</div> : null}
      </section>
    </div>
  );
}
