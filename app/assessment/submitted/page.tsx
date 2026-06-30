import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams
  const ref = params.ref

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-6 py-10">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2 size={34} />
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          资料已收到
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          我们会根据你提交的企业情况和项目诉求进行人工初步判断，后续由顾问与你沟通下一步。
        </p>

        {ref && (
          <div className="mt-5 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-left">
            <div className="text-xs text-[var(--text-tertiary)]">提交编号</div>
            <div className="mt-1 break-all font-mono text-sm text-[var(--text-primary)]">
              {ref}
            </div>
          </div>
        )}

        <Link
          href="/"
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-navy-700 to-navy-800 py-4 text-base font-semibold text-white shadow-lg shadow-navy-900/20"
        >
          返回首页
        </Link>
      </div>
    </main>
  )
}
