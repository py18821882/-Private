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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin dark:border-navy-700 dark:border-t-navy-400" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-secondary)]">报告不存在</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-navy-600 dark:text-navy-400 text-sm"
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
    if (s >= 80) return 'text-green-600 dark:text-green-400'
    if (s >= 60) return 'text-navy-600 dark:text-navy-300'
    if (s >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-wine'
  }

  const getGradeColor = (g: string) => {
    if (g === 'A') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    if (g === 'B') return 'bg-navy-100 text-navy-700 dark:bg-navy-700 dark:text-navy-200'
    if (g === 'C') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    if (g === 'D') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    return 'bg-wine-50 text-wine dark:bg-wine-600/20 dark:text-wine-light'
  }

  const severityColors: Record<string, string> = {
    high: 'bg-wine-50 text-wine dark:bg-wine-600/20 dark:text-wine-light',
    medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    low: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  }

  const priorityColors: Record<string, string> = {
    high: 'bg-wine-50 text-wine dark:bg-wine-600/20 dark:text-wine-light',
    medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    low: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
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
    <div className="bg-[var(--bg-surface)] rounded-2xl shadow-card overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-[var(--bg-subtle)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center dark:bg-navy-800 dark:text-navy-200">
            <Icon size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
            {count !== undefined && (
              <span className="text-xs text-[var(--text-tertiary)]">共 {count} 项</span>
            )}
          </div>
        </div>
        {expandedSections[id] ? (
          <ChevronUp size={20} className="text-[var(--text-tertiary)]" />
        ) : (
          <ChevronDown size={20} className="text-[var(--text-tertiary)]" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="px-5 pb-5 border-t border-[var(--border-default)]">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-10">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)] border-b border-[var(--border-default)] safe-top no-print">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[var(--text-secondary)]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-[var(--text-primary)] truncate px-2">
            分析报告
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-[var(--text-secondary)]"
              title="下载PDF"
            >
              <FileDown size={20} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-[var(--text-secondary)]"
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
        <div className="bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 rounded-2xl p-6 text-white shadow-hero relative overflow-hidden">
          {/* 金色装饰线 */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

          <div className="text-center">
            <div className="text-sm text-white/60">企业增长分析报告</div>
            <h2 className="mt-1 text-xl font-bold">
              {report.assessment?.companyName}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {report.assessment?.industry}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="mt-1 text-xs text-white/60">综合评分</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl font-bold ${getGradeColor(grade)}`}>
                {grade}
              </div>
              <div className="mt-1 text-xs text-white/60">评级</div>
            </div>
          </div>

          <div className="mt-6 h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-light to-gold rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* AI 总结 */}
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 text-white flex items-center justify-center">
              <Star size={20} />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">AI 总结</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* 企业情况 */}
        <SectionCard
          id="companyInfo"
          icon={Target}
          title="企业情况"
        >
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {typeof report.companyInfo === 'string' ? report.companyInfo : JSON.stringify(report.companyInfo)}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: '营收规模', value: report.assessment?.revenue },
              { label: '利润情况', value: report.assessment?.profit },
              { label: '员工人数', value: report.assessment?.employeeCount },
            ].map((item, i) => (
              <div key={i} className="bg-[var(--bg-subtle)] rounded-xl p-3 text-center">
                <div className="text-xs text-[var(--text-tertiary)]">{item.label}</div>
                <div className="mt-1 text-sm font-medium text-[var(--text-primary)] truncate">
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
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-wine-50 text-wine flex items-center justify-center text-xs font-bold dark:bg-wine-600/20 dark:text-wine-light">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[item.severity] || severityColors.medium}`}>
                      {item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
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
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center dark:bg-green-900/20 dark:text-green-400">
                  <Star size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{item.title}</div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
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
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center dark:bg-amber-900/30 dark:text-amber-300">
                  <Shield size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[item.level] || severityColors.medium}`}>
                      {item.level === 'high' ? '高风险' : item.level === 'medium' ? '中风险' : '低风险'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
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
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-navy-50 text-navy-600 flex items-center justify-center text-xs font-bold dark:bg-navy-800 dark:text-navy-200">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[item.priority] || priorityColors.medium}`}>
                      {item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 底部声明 */}
        <div className="text-center text-xs text-[var(--text-tertiary)] py-4">
          <p>本报告由 AI 生成，仅供参考，不构成投资建议</p>
          <p className="mt-1">生成时间：{new Date(report.createdAt).toLocaleString('zh-CN')}</p>
        </div>
      </div>

      {/* 底部操作栏（打印时隐藏） */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[var(--bg-surface)] border-t border-[var(--border-default)] p-4 safe-bottom no-print">
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] py-3 text-sm font-medium text-[var(--text-secondary)] hover:border-navy-400 transition-colors"
          >
            <FileDown size={18} />
            下载 PDF
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy-700 to-navy-800 py-3 text-sm font-medium text-white hover:from-navy-600 hover:to-navy-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
