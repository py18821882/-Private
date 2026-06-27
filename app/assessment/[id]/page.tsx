'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, Lock, Shield, FileText, ArrowRight, RefreshCw } from 'lucide-react'
import { formatAmount } from '@/lib/utils/order'

export default function AssessmentResultPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [pollingOrder, setPollingOrder] = useState(false)
  const analyzeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const payTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 获取测评数据
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
    } catch (e) {
      console.error('获取测评失败', e)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  // 轮询分析状态（仅在 pending/analyzing 时）
  useEffect(() => {
    if (data?.status === 'pending' || data?.status === 'analyzing') {
      analyzeTimerRef.current = setInterval(async () => {
        const res = await fetch(`/api/assessments/${params.id}`)
        const result = await res.json()
        if (result.success) {
          setData(result.data)
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current)
          }
          if (result.data.paid && result.data.report) {
            router.push(`/report/${result.data.report.id}`)
          }
        }
      }, 3000)
    }

    return () => {
      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current)
    }
  }, [data?.status, params.id, router])

  // 检查支付状态
  const checkPayment = async (oid: string) => {
    payTimerRef.current = setInterval(async () => {
      const res = await fetch(`/api/orders/${oid}`)
      const result = await res.json()
      if (result.success && result.data.paid) {
        if (payTimerRef.current) clearInterval(payTimerRef.current)
        setPollingOrder(false)
        // 重新获取数据，不整页刷新
        fetchData()
      }
    }, 3000) // 3秒轮询，避免过于频繁
  }

  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current)
      if (payTimerRef.current) clearInterval(payTimerRef.current)
    }
  }, [])

  // 模拟支付（仅开发环境）
  const handleMockPay = async (oid: string) => {
    if (!confirm('开发环境：模拟支付成功？')) return

    try {
      await fetch('/api/payment/mock-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: oid }),
      })

      setPollingOrder(true)
      checkPayment(oid)
    } catch (e) {
      alert('模拟支付失败')
    }
  }

  // 创建订单
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
        setOrderId(result.data.orderId)
        // 开发环境：自动模拟支付；生产环境：应跳转微信支付
        if (process.env.NODE_ENV === 'development') {
          await handleMockPay(result.data.orderId)
        } else {
          // 生产环境：跳转支付页面或调起微信支付
          setPollingOrder(true)
          checkPayment(result.data.orderId)
          alert('请在微信中完成支付')
        }
      } else {
        alert(result.message || '创建订单失败')
      }
    } catch (e) {
      alert('网络错误，请重试')
    } finally {
      setCreatingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    )
  }

  // 分析中状态
  if (data?.status === 'pending' || data?.status === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col items-center justify-center px-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 animate-pulse-glow flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
        <h2 className="mt-8 text-xl font-bold text-gray-800">AI 正在深度分析...</h2>
        <p className="mt-2 text-sm text-gray-500 text-center">
          正在生成您的企业增长分析报告
          <br />
          预计需要 30-60 秒
        </p>
        <div className="mt-8 w-full max-w-xs">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-400">正在分析企业数据...</div>
      </div>
    )
  }

  // 分析失败
  if (data?.status === 'failed') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <RefreshCw className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-gray-800">分析失败</h2>
        <p className="mt-2 text-sm text-gray-500 text-center">
          AI 分析暂时遇到问题
          <br />
          请稍后重试
        </p>
        <button
          onClick={() => fetchData()}
          className="mt-8 px-8 py-3 rounded-xl bg-violet-600 text-white font-medium"
        >
          重新分析
        </button>
      </div>
    )
  }

  // 分析完成，显示预览
  const preview = data?.reportPreview
  const price = data?.price || 19900 // 从后端获取价格，兜底默认值

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 顶部 */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-600 text-white px-6 pt-10 pb-16 safe-top">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs mb-3">
          <Check size={14} />
          分析完成
          </div>
          <h1 className="text-xl font-bold">{data?.companyName}</h1>
          <p className="text-sm text-white/80 mt-1">{data?.industry}</p>
        </div>
      </div>

      {/* 分数卡片 */}
      <div className="px-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <div className="text-sm text-gray-500">AI 综合评分（预览）</div>
            <div className="mt-2 text-5xl font-bold gradient-text">
              {preview?.score || '--'}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              支付后查看完整评分和评级
            </div>
          </div>

          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              style={{ width: `${preview?.score || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 报告预览内容 */}
      <div className="px-4 mt-6 space-y-4">
        {/* AI 总结 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-violet-600" />
            AI 总结
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {preview?.summary || '暂无数据'}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-violet-600">
            <Lock size={12} />
            <span>完整总结已锁定，支付后查看全部</span>
          </div>
        </div>

        {/* 问题分析（部分展示） */}
        <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <h3 className="font-semibold text-gray-800 mb-3">核心问题</h3>
          <div className="space-y-3">
            {preview?.problemAnalysis?.slice(0, 2).map((item: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold`}>
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
              <Lock size={12} />
              更多问题已锁定
            </div>
          </div>
        </div>

        {/* 企业优势 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <h3 className="font-semibold text-gray-800 mb-3">企业优势</h3>
          <div className="space-y-3">
            {preview?.advantages?.slice(0, 1).map((item: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Check size={14} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
              <Lock size={12} />
              更多优势已锁定
            </div>
          </div>
        </div>

        {/* 已锁定模块提示 */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-800">解锁完整报告</div>
              <div className="text-xs text-gray-500">支付后立即查看全部内容</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              '完整问题分析',
              '全部优势评估',
              '风险预警提示',
              '发展建议方案',
              'AI 综合评级',
              'PDF 报告下载',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <Check size={12} className="text-violet-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部支付栏 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 safe-bottom">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-400 line-through">原价 ¥599.00</div>
            <div className="text-2xl font-bold text-red-500">
              ¥{formatAmount(price)}
              <span className="text-xs font-normal text-gray-500 ml-1">限时优惠</span>
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={creatingOrder || pollingOrder}
            className="btn-press flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50"
          >
            {creatingOrder || pollingOrder ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                处理中...
              </>
            ) : (
              <>
                查看完整报告
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">
          支付即表示同意《服务协议》和《隐私政策》
        </p>
      </div>
    </div>
  )
}
