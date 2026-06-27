// 报告服务
// 报告生成、查询、内容管理

import { prisma } from '../prisma'
import { analyzeEnterprise, extractJsonFromText } from '../ai'
import { AI_CONFIG } from '../config'
import { notifyReportComplete, notifyReportFailed, fireNotification } from '../wecom/bot'

// 生成报告
export async function generateReport(assessmentId: string) {
  // 获取测评数据
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  })

  if (!assessment) {
    throw new Error('测评记录不存在')
  }

  // 如果报告已存在，直接返回
  if (assessment.reportId) {
    const existingReport = await prisma.report.findUnique({
      where: { id: assessment.reportId },
    })
    if (existingReport) {
      return existingReport
    }
  }

  // 更新测评状态为分析中
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: 'analyzing' },
  })

  try {
    // 调用 AI 分析
    const aiResult = await analyzeEnterprise({
      companyName: assessment.companyName,
      industry: assessment.industry,
      mainBusiness: assessment.mainBusiness,
      revenue: assessment.revenue,
      profit: assessment.profit,
      employeeCount: assessment.employeeCount,
      bossGoal: assessment.bossGoal,
    })

    // 解析 AI 返回的 JSON
    const parsedResult = extractJsonFromText(aiResult.content)

    if (!parsedResult) {
      throw new Error('AI 返回结果解析失败')
    }

    // 更新测评记录
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: 'completed',
        aiResult: JSON.stringify(parsedResult),
        aiModel: aiResult.model,
        aiUsage: aiResult.usage.totalTokens,
      },
    })

    // 创建报告
    const report = await prisma.report.create({
      data: {
        assessmentId,
        title: `${assessment.companyName} - 企业增长分析报告`,
        summary: parsedResult.summary || '',
        companyInfo: JSON.stringify(parsedResult.companyInfo || {}),
        problemAnalysis: JSON.stringify(parsedResult.problemAnalysis || []),
        advantages: JSON.stringify(parsedResult.advantages || []),
        risks: JSON.stringify(parsedResult.risks || []),
        suggestions: JSON.stringify(parsedResult.suggestions || []),
        fullContent: JSON.stringify(parsedResult),
      },
    })

    // 关联测评和报告
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { reportId: report.id },
    })

    // 企业微信通知：报告生成完成（fire-and-forget）
    fireNotification(notifyReportComplete({
      id: assessmentId,
      reportId: report.id,
      companyName: assessment.companyName,
      score: parsedResult.score ?? 0,
      grade: parsedResult.grade ?? '-',
    }))

    return report
  } catch (error: any) {
    // 标记失败
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'failed' },
    })

    // 企业微信通知：报告生成失败（fire-and-forget）
    fireNotification(notifyReportFailed({
      id: assessmentId,
      companyName: assessment.companyName,
      error: error.message || '未知错误',
    }))

    throw error
  }
}

// 获取报告详情
// incrementView: 是否递增查看次数（从测评详情页调用时传 false）
export async function getReport(reportId: string, incrementView: boolean = true) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      assessment: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          mainBusiness: true,
          revenue: true,
          profit: true,
          employeeCount: true,
          paid: true,
          createdAt: true,
        },
      },
    },
  })

  if (!report) {
    throw new Error('报告不存在')
  }

  // 仅在报告页查看时递增查看次数
  if (incrementView) {
    await prisma.report.update({
      where: { id: reportId },
      data: { viewCount: { increment: 1 } },
    })
  }

  // 解析 JSON 字段
  return {
    ...report,
    companyInfo: safeJsonParse(report.companyInfo),
    problemAnalysis: safeJsonParse(report.problemAnalysis),
    advantages: safeJsonParse(report.advantages),
    risks: safeJsonParse(report.risks),
    suggestions: safeJsonParse(report.suggestions),
    fullContent: safeJsonParse(report.fullContent),
  }
}

// 根据测评 ID 获取报告
export async function getReportByAssessmentId(assessmentId: string) {
  const report = await prisma.report.findUnique({
    where: { assessmentId },
  })
  return report
}

// 安全 JSON 解析
function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

// 获取报告预览（前 30% 内容，用于未支付用户）
export function getReportPreview(fullReport: any) {
  const { problemAnalysis, advantages, risks, suggestions, summary, fullContent } = fullReport

  // 只返回前 30% 的内容
  const previewRatio = 0.3

  // score 和 grade 存储在 fullContent 中
  const rawScore = fullContent?.score
  const score = (typeof rawScore === 'number' && !isNaN(rawScore))
    ? Math.floor(rawScore * 0.7) // 预览只显示 70% 分数
    : null

  return {
    summary: summary ? summary.substring(0, Math.floor(summary.length * previewRatio)) + '...' : '',
    companyInfo: fullReport.companyInfo || {},
    problemAnalysis: problemAnalysis ? problemAnalysis.slice(0, Math.max(1, Math.floor(problemAnalysis.length * previewRatio))) : [],
    advantages: advantages ? advantages.slice(0, Math.max(1, Math.floor(advantages.length * previewRatio))) : [],
    risks: [], // 风险部分完全锁定
    suggestions: [], // 建议部分完全锁定
    isPreview: true,
    score, // 预览只显示 70% 分数
    grade: null, // 评级不显示
  }
}
