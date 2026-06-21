import { ContentStudio } from "@/components/content-studio";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const items = await db.contentItem.findMany({ orderBy: { createdAt: "desc" }, take: 20 });

  return (
    <div>
      <PageHeader title="内容创作" description="输入选题，一键生成并购口播、国学口播、朋友圈文案、短视频标题。" />
      <ContentStudio />
      <section className="mt-5 space-y-3">
        <div className="font-semibold text-slate-950">最近内容</div>
        {items.map((item) => (
          <article key={item.id} className="card p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-slate-950">{item.title}</div>
                <div className="text-xs text-slate-500">{item.contentType} · {item.createdAt.toLocaleString("zh-CN")}</div>
              </div>
              <CopyButton text={item.output} />
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-7 text-slate-800">{item.output}</pre>
          </article>
        ))}
        {!items.length ? <div className="card p-8 text-center text-sm text-slate-500">暂无内容记录</div> : null}
      </section>
    </div>
  );
}
