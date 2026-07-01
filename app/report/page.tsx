'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'

function ReportByAssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('正在生成初步评估报告')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAssessment = async () => {
    if (!assessmentId) {
      setStatus('failed')
      setMessage('缺少评估编号')
      return
    }

    try {
      const res = await fetch(`/api/assessments/${assessmentId}`)
      const result = await res.json()

      if (!result.success) {
        setStatus('failed')
        setMessage(result.message || '评估记录不存在')
        return
      }

      setStatus(result.data.status)
      if (result.data.report?.id) {
        router.replace(`/report/${result.data.report.id}`)
      }
    } catch {
      setStatus('failed')
      setMessage('网络错误，请稍后重试')
    }
  }

  useEffect(() => {
    fetchAssessment()
    timerRef.current = setInterval(fetchAssessment, 3000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-wine-50 flex items-center justify-center dark:bg-wine-600/20">
          <RefreshCw className="w-10 h-10 text-wine" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-[var(--text-primary)]">评估生成失败</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] text-center">{message}</p>
        <button onClick={fetchAssessment} className="mt-8 px-8 py-3 rounded-xl bg-navy-700 text-white font-medium">
          重新查看
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 animate-pulse-glow flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
      <h1 className="mt-8 text-xl font-bold text-[var(--text-primary)]">正在生成初步评估报告</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)] text-center leading-relaxed">
        系统正在整理项目价值、并购关注点和后续沟通建议
        <br />预计需要 30-60 秒
      </p>
    </div>
  )
}

export default function ReportByAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-navy-600 animate-spin" />
        </div>
      }
    >
      <ReportByAssessmentContent />
    </Suspense>
  )
}
