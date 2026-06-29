'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, FileSearch, Handshake, ShieldCheck, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: FileSearch,
      title: '初步评估',
      desc: '判断是否适合进入并购、融资或上市公司资源对接流程',
    },
    {
      icon: Building2,
      title: '上市公司并购视角',
      desc: '围绕利润、资产、客户、资质、团队和区域价值做初步判断',
    },
    {
      icon: Handshake,
      title: '资本合作路径',
      desc: '初步识别股权出售、融资、并购重组、国资合作等方向',
    },
    {
      icon: ShieldCheck,
      title: '内部流转依据',
      desc: '提交后用于企业资本合作评估与后续顾问沟通',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="h-full w-full" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="42" y="56" width="120" height="86" stroke="white" strokeWidth="0.5" />
            <rect x="190" y="92" width="150" height="92" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="218" x2="400" y2="218" stroke="white" strokeWidth="0.5" />
            <line x1="112" y1="0" x2="112" y2="320" stroke="white" strokeWidth="0.5" />
            <line x1="302" y1="0" x2="302" y2="320" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center px-4 text-white safe-top sm:px-6">
          <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/30 bg-gold/20 px-3 py-1 text-xs backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-light" />
            <span className="text-gold-light">企业资本合作 · 初步评估</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            中科商业咨询
            <br />
            资本合作需求登记
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            联合深圳上市公司并购协会资源视角，对企业并购、融资、股权出售、产业整合项目进行初步筛选。
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="h-12 w-full">
            <path d="M0 80L60 60C120 40 240 20 360 15C480 10 600 20 720 30C840 40 960 50 1080 55C1200 60 1320 60 1380 60L1440 60V80H0Z" fill="var(--bg-base)" />
          </svg>
        </div>
      </div>

      <div className="px-4 pb-10 -mt-4 sm:px-6">
        <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { num: '内部', label: '项目流转' },
            { num: '筛选', label: '并购价值' },
            { num: '对接', label: '资本资源' },
          ].map((item, index) => (
            <div key={index} className="glass-card min-w-0 rounded-2xl p-2 text-center shadow-card sm:p-3">
              <div className="text-base font-bold gradient-text sm:text-xl">{item.num}</div>
              <div className="mt-1 break-words text-xs text-[var(--text-tertiary)]">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-gold" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">适合提交的项目</h2>
        </div>
        <div className="mb-8 grid grid-cols-2 gap-2 sm:gap-3">
          {features.map((feature, index) => (
            <div key={index} className="min-w-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600 dark:bg-navy-800 dark:text-navy-200">
                <feature.icon size={20} />
              </div>
              <h3 className="break-words font-semibold text-[var(--text-primary)]">{feature.title}</h3>
              <p className="mt-1 break-words text-xs leading-relaxed text-[var(--text-secondary)]">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-2xl border border-navy-100 bg-navy-50/50 p-5 dark:border-navy-700 dark:bg-navy-800/30">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-gold" />
            <h2 className="font-bold text-[var(--text-primary)]">提交后主要评估</h2>
          </div>
          <div className="space-y-2.5">
            {[
              '是否具备上市公司并购关注点',
              '是否适合股权出售、融资或并购重组',
              '企业利润、资产、客户、资质和团队价值',
              '可对接的产业资本、国资平台或基金方向',
              '后续是否进入一对一项目沟通',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push('/assessment')}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-navy-700 to-navy-800 py-4 text-base font-semibold text-white shadow-lg shadow-navy-900/20 hover:from-navy-600 hover:to-navy-700 transition-colors"
        >
          提交项目资料
          <ArrowRight size={18} />
        </button>

        <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">
          用于企业资本合作初步评估 · 顾问后续沟通参考
        </p>
      </div>
    </div>
  )
}

