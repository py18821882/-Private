'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

const projectTypes = [
  '制造业并购标的', '股权出售', '企业融资', '并购重组',
  '国资合作', '上市公司资源对接', '产业整合', '其他项目'
]

const revenues = [
  '500万以内', '500-1000万', '1000-3000万', '3000-5000万',
  '5000万-1亿', '1-3亿', '3-10亿', '10亿以上'
]

const profits = [
  '亏损', '盈亏平衡', '净利10%以内', '净利10%-20%', '净利20%-30%', '净利30%以上'
]

const employeeCounts = [
  '10人以内', '10-50人', '50-100人', '100-300人',
  '300-500人', '500-1000人', '1000人以上'
]

export default function AssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    mainBusiness: '',
    revenue: '',
    profit: '',
    employeeCount: '',
    bossGoal: '',
    contactName: '',
    contactPhone: '',
  })

  const totalSteps = 3

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.companyName && formData.industry && formData.mainBusiness
      case 2:
        return formData.revenue && formData.profit && formData.employeeCount
      case 3:
        return formData.bossGoal
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setLoading(true)
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success && result.data?.fallback) {
        router.push(`/assessment/submitted?ref=${encodeURIComponent(result.data.id)}`)
      } else if (result.success) {
        router.push(`/assessment/${result.data.id}`)
      } else {
        alert(result.message || '提交失败，请重试')
      }
    } catch (error) {
      alert('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const OptionButton = ({ value, current, onClick }: { value: string; current: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-xl border px-3 py-3.5 text-sm leading-snug break-words transition-all ${
        current === value
          ? 'border-navy-600 bg-navy-50 text-navy-700 font-medium dark:border-navy-400 dark:bg-navy-800 dark:text-navy-100'
          : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-navy-300 dark:hover:border-navy-600'
      }`}
    >
      {value}
      {current === value && <Check size={14} className="inline ml-1 -mt-0.5" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)] border-b border-[var(--border-default)] safe-top">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="p-2 -ml-2 text-[var(--text-secondary)]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-[var(--text-primary)]">
            企业发展需求登记
          </h1>
          <div className="w-10" />
        </div>

        <div className="px-6 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-tertiary)]">
              第 {step} / {totalSteps} 步
            </span>
            <span className="text-xs text-navy-600 dark:text-navy-300 font-medium">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-navy-600 to-gold rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 pb-32">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-1 rounded-full bg-gold" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">项目基本信息</h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] ml-3">用于中科商业咨询企业资本合作初步评估</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  企业/项目名称 <span className="text-wine">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  placeholder="请输入企业或项目名称"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 dark:focus:ring-navy-800 transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  项目类型 <span className="text-wine">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {projectTypes.map(item => (
                    <OptionButton
                      key={item}
                      value={item}
                      current={formData.industry}
                      onClick={() => updateField('industry', item)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  主营业务/项目亮点 <span className="text-wine">*</span>
                </label>
                <textarea
                  value={formData.mainBusiness}
                  onChange={e => updateField('mainBusiness', e.target.value)}
                  placeholder="例如：主营产品、客户资源、资质牌照、区域优势、核心资产、利润情况等..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 dark:focus:ring-navy-800 transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-1 rounded-full bg-gold" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">经营与规模</h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] ml-3">用于判断并购、融资、产业资本对接基础</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  年营收规模 <span className="text-wine">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {revenues.map(item => (
                    <OptionButton
                      key={item}
                      value={item}
                      current={formData.revenue}
                      onClick={() => updateField('revenue', item)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  利润情况 <span className="text-wine">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {profits.map(item => (
                    <OptionButton
                      key={item}
                      value={item}
                      current={formData.profit}
                      onClick={() => updateField('profit', item)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  团队/员工规模 <span className="text-wine">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {employeeCounts.map(item => (
                    <OptionButton
                      key={item}
                      value={item}
                      current={formData.employeeCount}
                      onClick={() => updateField('employeeCount', item)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-1 rounded-full bg-gold" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">提交诉求</h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] ml-3">说明你希望我们重点判断什么</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  项目诉求 <span className="text-wine">*</span>
                </label>
                <textarea
                  value={formData.bossGoal}
                  onChange={e => updateField('bossGoal', e.target.value)}
                  placeholder="例如：想融资、出售部分/全部股权、对接上市公司买方、引入国资平台、做并购重组、寻找产业合作方等..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 dark:focus:ring-navy-800 transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              <div className="rounded-xl border border-gold/20 bg-gold-50/50 p-4 dark:bg-navy-800/40">
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  提示：本通道用于企业资本合作初步评估。请尽量写清楚企业规模、核心资产、股权意向和当前痛点。
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  联系人（选填）
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={e => updateField('contactName', e.target.value)}
                  placeholder="您的称呼"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 dark:focus:ring-navy-800 transition-all placeholder:text-[var(--text-tertiary)] mb-3"
                />
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={e => updateField('contactPhone', e.target.value)}
                  placeholder="手机号（便于后续项目沟通）"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 dark:focus:ring-navy-800 transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[var(--bg-surface)] border-t border-[var(--border-default)] p-4 safe-bottom">
        {step < totalSteps ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed() || loading}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-navy-700 to-navy-800 py-4 text-base font-semibold text-white shadow-lg shadow-navy-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:from-navy-600 hover:to-navy-700 transition-colors"
          >
            下一步
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-navy-700 to-navy-800 py-4 text-base font-semibold text-white shadow-lg shadow-navy-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:from-navy-600 hover:to-navy-700 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                提交中...
              </>
            ) : (
              '提交评估资料'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

