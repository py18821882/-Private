'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, FileSearch, Loader2, Lock, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { formatAmount } from '@/lib/utils/order'

export default function AssessmentResultPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [manualPayOrder, setManualPayOrder] = useState<any>(null)
  const [pollingOrder, setPollingOrder] = useState(false)
  const analyzeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const payTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/assessments/${params.id}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
        if (result.data.paid && result.data.report) {
          router.push(`/report/${result.data.report.id}`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  useEffect(() => {
    if (data?.status === 'pending' || data?.status === 'analyzing') {
      analyzeTimerRef.current = setInterval(fetchData, 3000)
    }
    return () => {
      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status])

  useEffect(() => {
    return () => {
      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current)
      if (payTimerRef.current) clearInterval(payTimerRef.current)
    }
  }, [])

  const checkPayment = async (orderId: string) => {
    if (payTimerRef.current) clearInterval(payTimerRef.current)
    payTimerRef.current = setInterval(async () => {
      const res = await fetch(`/api/orders/${orderId}`)
      const result = await res.json()
      if (result.success && result.data.paid) {
        if (payTimerRef.current) clearInterval(payTimerRef.current)
        setPollingOrder(false)
        setManualPayOrder(null)
        fetchData()
      }
    }, 3000)
  }

  const handleCreateOrder = async () => {
    setCreatingOrder(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: params.id }),
      })
      const result = await res.json()

      if (result.success) {
        setManualPayOrder(result.data)
        setPollingOrder(true)
        checkPayment(result.data.orderId)
      } else {
        alert(result.message || '创建订单失败')
      }
    } catch {
      alert('网络错误，请重试')
    } finally {
      setCreatingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="w-8 h-8 text-navy-600 animate-spin" />
      </div>
    )
  }

  if (data?.status === 'pending' || data?.status === 'analyzing') {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 animate-pulse-glow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
        <h2 className="mt-8 text-xl font-bold text-[var(--text-primary)]">正在生成初步评估报告</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] text-center leading-relaxed">
          系统正在整理项目价值、并购关注点和后续沟通建议
          <br />预计需要 30-60 秒
        </p>
      </div>
    )
  }

  if (data?.status === 'failed') {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-wine-50 flex items-center justify-center dark:bg-wine-600/20">
          <RefreshCw className="w-10 h-10 text-wine" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-[var(--text-primary)]">评估生成失败</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] text-center">请稍后刷新重试，或直接联系项目顾问。</p>
        <button onClick={fetchData} className="mt-8 px-8 py-3 rounded-xl bg-navy-700 text-white font-medium">
          重新查看
        </button>
      </div>
    )
  }

  const preview = data?.reportPreview
  const price = data?.price || 19900
  const manualPaymentQrUrl = process.env.NEXT_PUBLIC_PAYMENT_QR_URL || '/payment-qr.svg'

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-32">
      <div className="bg-gradient-to-br from-navy-800 to-navy-950 text-white px-6 pt-10 pb-16 safe-top">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 px-3 py-1 rounded-full text-xs mb-3 border border-gold/30">
            <Check size={14} className="text-gold-light" />
            <span className="text-gold-light">评估结果已生成</span>
          </div>
          <h1 className="text-xl font-bold">{data?.companyName}</h1>
          <p className="text-sm text-white/70 mt-1">{data?.industry}</p>
        </div>
      </div>

      <div className="px-4 -mt-10">
        <div className="bg-[var(--bg-surface)] rounded-2xl shadow-card-hover p-6 text-center">
          <div className="text-sm text-[var(--text-secondary)]">资本合作匹配度</div>
          <div className="mt-2 text-5xl font-bold gradient-text">{preview?.score || '--'}</div>
          <div className="mt-1 text-xs text-[var(--text-tertiary)]">完整等级和详细判断需解锁查看</div>
          <div className="mt-4 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-navy-600 to-gold rounded-full" style={{ width: `${preview?.score || 0}%` }} />
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <FileSearch size={18} className="text-navy-600" />
            评估摘要
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {preview?.summary || '暂无评估摘要'}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-navy-600">
            <Lock size={12} />
            <span>完整评估报告、风险点和推进建议已锁定</span>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card relative overflow-hidden">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">已开放预览</h3>
          <div className="space-y-3">
            {preview?.problemAnalysis?.slice(0, 2).map((item: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{item.title}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-navy-200 bg-navy-50/50 p-5 dark:border-navy-700 dark:bg-navy-800/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 text-white flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="font-semibold text-[var(--text-primary)]">解锁完整评估报告</div>
              <div className="text-xs text-[var(--text-secondary)]">用于后续一对一项目沟通</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['并购价值判断', '资本对接方向', '项目风险提示', '后续推进建议', '评估等级', '顾问沟通依据'].map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Check size={12} className="text-gold" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {manualPayOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-[var(--text-primary)]">扫码付款</div>
                <div className="text-xs text-[var(--text-tertiary)]">人工确认后开通完整意见</div>
              </div>
              <button onClick={() => setManualPayOrder(null)} className="rounded-full p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)]">
                <X size={18} />
              </button>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] bg-white p-3">
              <img src={manualPaymentQrUrl} alt="收款码" className="mx-auto aspect-square w-full max-w-56 rounded-lg object-contain" />
            </div>
            <div className="mt-4 space-y-2 rounded-xl bg-[var(--bg-subtle)] p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--text-secondary)]">应付金额</span>
                <span className="font-semibold text-wine">¥{formatAmount(manualPayOrder.amount || price)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--text-secondary)]">订单号</span>
                <span className="font-mono text-xs text-[var(--text-primary)]">{manualPayOrder.orderNo}</span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              付款时请备注订单号，或截图发给客服。管理员确认到账后，本页会自动解锁完整内容。
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[var(--bg-surface)] border-t border-[var(--border-default)] p-4 safe-bottom">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-[var(--text-tertiary)]">初步评估报告</div>
            <div className="text-2xl font-bold text-wine">
              ¥{formatAmount(price)}
              <span className="text-xs font-normal text-[var(--text-secondary)] ml-1">人工确认</span>
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={creatingOrder}
            className="btn-press flex items-center gap-2 rounded-2xl bg-gradient-to-r from-navy-700 to-navy-800 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-navy-900/20 disabled:opacity-50"
          >
            {creatingOrder ? <Loader2 size={18} className="animate-spin" /> : pollingOrder ? '查看收款码' : '解锁完整意见'}
            <ArrowRight size={18} />
          </button>
        </div>
        <p className="text-center text-xs text-[var(--text-tertiary)]">付款后由人工核验，确认后开放完整评估报告。</p>
      </div>
    </div>
  )
}

