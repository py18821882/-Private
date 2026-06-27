'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, FileDown, Printer, Share2,
  TrendingUp, AlertTriangle, Shield, Lightbulb, Target,
  Star, ChevronDown, ChevronUp
} from 'lucide-react'

export default function ReportPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    companyInfo: true,
    problemAnalysis: true,
    advantages: true,
    risks: false,
    suggestions: false,
  })

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${params.id}`)
        const result = await res.json()
        if (result.success) {
          setReport(result.data)
        } else {
          alert(result.message || '获取报告失败')
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [params.id])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 打印报告
  const handlePrint = () => {
    window.print()
  }

  // 生成 PDF（简化：调用打印对话框，用户可保存为 PDF）
  const handleDownloadPDF = () => {
    alert('请使用浏览器的打印功能，选择"另存为 PDF"即可下载报告')
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500">报告不存在</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-violet-600 text-sm"
        >
          返回首页
        </button>
      </div>
    )
  }

  const fullContent = report.fullContent || {}
  const score = fullContent.score || 0
  const grade = fullContent.grade || 'B'

  // 评分颜色
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600'
    if (s >= 60) return 'text-violet-600'
    if (s >= 40) return 'text-amber-600'
    return 'text-red-600'
  }

  const getGradeColor = (g: string) => {
    if (g === 'A') return 'bg-green-100 text-green-700'
    if (g === 'B') return 'bg-violet-100 text-violet-700'
    if (g === 'C') return 'bg-amber-100 text-amber-700'
    if (g === 'D') return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const severityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-amber-100 text-amber-600',
    low: 'bg-blue-100 text-blue-600',
  }

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-amber-100 text-amber-600',
    low: 'bg-green-100 text-green-600',
  }

  const SectionCard = ({
    id,
    icon: Icon,
    title,
    children,
    count,
  }: {
    id: string
    icon: any
    title: string
    children: React.ReactNode
    count?: number
  }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <Icon size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {count !== undefined && (
              <span className="text-xs text-gray-400">共 {count} 项</span>
            )}
          </div>
        </div>
        {expandedSections[id] ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 safe-top no-print">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 truncate px-2">
            分析报告
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-gray-600"
              title="下载PDF"
            >
              <FileDown size={20} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600"
              title="打印"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 报告内容 */}
      <div className="p-4 space-y-4">
        {/* 封面/评分卡片 */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white">
          <div className="text-center">
            <div className="text-sm opacity-80">企业增长分析报告</div>
            <h2 className="mt-1 text-xl font-bold">
              {report.assessment?.companyName}
            </h2>
            <p className="mt-1 text-sm opacity-80">
              {report.assessment?.industry}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="mt-1 text-xs opacity-80">综合评分</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl font-bold ${getGradeColor(grade)}`}>
                {grade}
              </div>
              <div className="mt-1 text-xs opacity-80">评级</div>
            </div>
          </div>

          <div className="mt-6 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* AI 总结 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
              <Star size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">AI 总结</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* 企业情况 */}
        <SectionCard
          id="companyInfo"
          icon={Target}
          title="企业情况"
        >
          <div className="text-sm text-gray-600 leading-relaxed">
            {typeof report.companyInfo === 'string' ? report.companyInfo : JSON.stringify(report.companyInfo)}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: '营收规模', value: report.assessment?.revenue },
              { label: '利润情况', value: report.assessment?.profit },
              { label: '员工人数', value: report.assessment?.employeeCount },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">{item.label}</div>
                <div className="mt-1 text-sm font-medium text-gray-700 truncate">
                  {item.value || '-'}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 问题分析 */}
        <SectionCard
          id="problemAnalysis"
          icon={AlertTriangle}
          title="问题分析"
          count={report.problemAnalysis?.length || 0}
        >
          <div className="space-y-4">
            {Array.isArray(report.problemAnalysis) && report.problemAnalysis.map((item: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[item.severity] || severityColors.medium}`}>
                      {item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 企业优势 */}
        <SectionCard
          id="advantages"
          icon={TrendingUp}
          title="企业优势"
          count={report.advantages?.length || 0}
        >
          <div className="space-y-4">
            {Array.isArray(report.advantages) && report.advantages.map((item: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Star size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{item.title}</div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 风险提示 */}
        <SectionCard
          id="risks"
          icon={Shield}
          title="风险提示"
          count={report.risks?.length || 0}
        >
          <div className="space-y-4">
            {Array.isArray(report.risks) && report.risks.map((item: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Shield size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[item.level] || severityColors.medium}`}>
                      {item.level === 'high' ? '高风险' : item.level === 'medium' ? '中风险' : '低风险'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 发展建议 */}
        <SectionCard
          id="suggestions"
          icon={Lightbulb}
          title="发展建议"
          count={report.suggestions?.length || 0}
        >
          <div className="space-y-4">
            {Array.isArray(report.suggestions) && report.suggestions.map((item: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[item.priority] || priorityColors.medium}`}>
                      {item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 底部声明 */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>本报告由 AI 生成，仅供参考，不构成投资建议</p>
          <p className="mt-1">生成时间：{new Date(report.createdAt).toLocaleString('zh-CN')}</p>
        </div>
      </div>

      {/* 底部操作栏（打印时隐藏） */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 safe-bottom no-print">
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700"
          >
            <FileDown size={18} />
            下载 PDF
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-medium text-white"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
