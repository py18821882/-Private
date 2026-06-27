'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

// 行业选项
const industries = [
  '制造业', '服务业', '科技互联网', '贸易零售', '建筑房地产',
  '金融投资', '教育培训', '医疗健康', '餐饮酒店', '农业', '其他'
]

// 营收规模选项
const revenues = [
  '500万以下', '500-1000万', '1000-3000万', '3000-5000万',
  '5000万-1亿', '1-3亿', '3-10亿', '10亿以上'
]

// 利润情况选项
const profits = [
  '亏损', '盈亏平衡', '10%以下', '10%-20%', '20%-30%', '30%以上'
]

// 员工人数选项
const employeeCounts = [
  '10人以下', '10-50人', '50-100人', '100-300人',
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
      
      if (result.success) {
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

  // 选项按钮组件
  const OptionButton = ({ value, current, onClick }: { value: string; current: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm transition-all ${
        current === value
          ? 'border-violet-500 bg-violet-50 text-violet-700 font-medium'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      {value}
      {current === value && (
        <Check size={14} className="inline ml-1 -mt-0.5" />
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 safe-top">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="p-2 -ml-2 text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800">
            企业 AI 增长测评
          </h1>
          <div className="w-10" />
        </div>
        
        {/* 进度条 */}
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              第 {step} / {totalSteps} 步
            </span>
            <span className="text-xs text-violet-600 font-medium">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="p-6 pb-32">
        {/* 第一步：企业基本信息 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">企业基本信息</h2>
              <p className="text-sm text-gray-500">请填写您的企业信息</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企业名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  placeholder="请输入企业全称"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所属行业 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {industries.map(ind => (
                    <OptionButton
                      key={ind}
                      value={ind}
                      current={formData.industry}
                      onClick={() => updateField('industry', ind)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主营业务 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.mainBusiness}
                  onChange={e => updateField('mainBusiness', e.target.value)}
                  placeholder="请简要描述企业主要产品或服务..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* 第二步：经营数据 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">经营数据</h2>
              <p className="text-sm text-gray-500">帮助我们更准确地分析</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年营收规模 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {revenues.map(r => (
                    <OptionButton
                      key={r}
                      value={r}
                      current={formData.revenue}
                      onClick={() => updateField('revenue', r)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  净利润率 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {profits.map(p => (
                    <OptionButton
                      key={p}
                      value={p}
                      current={formData.profit}
                      onClick={() => updateField('profit', p)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  员工人数 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {employeeCounts.map(e => (
                    <OptionButton
                      key={e}
                      value={e}
                      current={formData.employeeCount}
                      onClick={() => updateField('employeeCount', e)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 第三步：发展目标 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">发展目标</h2>
              <p className="text-sm text-gray-500">您最想解决的问题是什么？</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  老板/企业目标 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.bossGoal}
                  onChange={e => updateField('bossGoal', e.target.value)}
                  placeholder="例如：想在3年内营收翻倍、计划融资、考虑出售公司、想引入合伙人等..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-xs text-violet-700">
                  💡 提示：描述越详细，AI 分析越精准。我们承诺严格保密您的企业信息。
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系人（选填）
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={e => updateField('contactName', e.target.value)}
                  placeholder="您的称呼"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all mb-3"
                />
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={e => updateField('contactPhone', e.target.value)}
                  placeholder="手机号（方便后续顾问沟通）"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 safe-bottom">
        {step < totalSteps ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed() || loading}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                提交中...
              </>
            ) : (
              '开始 AI 分析'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
