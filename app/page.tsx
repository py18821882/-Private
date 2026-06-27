'use client'

import { useRouter } from 'next/navigation'
import { TrendingUp, Target, Shield, Zap, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: TrendingUp,
      title: '增长潜力分析',
      desc: 'AI 深度诊断企业增长空间',
    },
    {
      icon: Target,
      title: '问题精准定位',
      desc: '发现企业核心瓶颈和痛点',
    },
    {
      icon: Shield,
      title: '风险提前预警',
      desc: '识别潜在经营风险',
    },
    {
      icon: Zap,
      title: '定制发展建议',
      desc: '提供可落地的优化方案',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      {/* 顶部装饰 */}
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJ6bTEwLTEwSDQ0VjIwaC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        {/* 内容 */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 text-white safe-top">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            AI 智能诊断系统
          </div>
          <h1 className="text-3xl font-bold leading-tight">
            企业 AI 增长测评
          </h1>
          <p className="mt-2 text-sm text-white/80">
            3 分钟完成测评，AI 为您生成专业企业分析报告
          </p>
        </div>

        {/* 底部波浪 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="px-6 pb-10 -mt-6">
        {/* 数据亮点 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { num: '10,000+', label: '企业测评' },
            { num: '98%', label: '好评率' },
            { num: '50+', label: '行业覆盖' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 text-center shadow-sm">
              <div className="text-xl font-bold gradient-text">{item.num}</div>
              <div className="mt-1 text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 核心功能 */}
        <h2 className="mb-4 text-lg font-bold text-gray-800">你将获得</h2>
        <div className="mb-8 grid grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <feature.icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-800">{feature.title}</h3>
              <p className="mt-1 text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* 报告预览示意 */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 p-5">
          <h2 className="mb-3 font-bold text-gray-800">报告包含</h2>
          <div className="space-y-2">
            {[
              '企业基本面分析与行业对标',
              '核心问题诊断与根因分析',
              '企业优势与增长潜力评估',
              '经营风险提示与应对建议',
              '6-12 个月发展路线图',
              'AI 综合评分与评级',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* 开始测评按钮 */}
        <button
          onClick={() => router.push('/assessment')}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30"
        >
          开始免费测评
          <ArrowRight size={18} />
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          约 3 分钟完成 · 生成专属分析报告
        </p>
      </div>
    </div>
  )
}
