import { prisma } from '../prisma'
import { analyzeEnterprise, extractJsonFromText } from '../ai'
import { notifyReportComplete, notifyReportFailed, fireNotification } from '../wecom/bot'

export async function generateReport(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  })

  if (!assessment) {
    throw new Error('项目记录不存在')
  }

  if (assessment.reportId) {
    const existingReport = await prisma.report.findUnique({
      where: { id: assessment.reportId },
    })
    if (existingReport) return existingReport
  }

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: 'analyzing' },
  })

  try {
    const aiResult = await analyzeEnterprise({
      companyName: assessment.companyName,
      industry: assessment.industry,
      mainBusiness: assessment.mainBusiness,
      revenue: assessment.revenue,
      profit: assessment.profit,
      employeeCount: assessment.employeeCount,
      bossGoal: assessment.bossGoal,
    })

    const parsedResult = extractJsonFromText(aiResult.content)
    if (!parsedResult) {
      throw new Error('AI 返回结果解析失败')
    }

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: 'completed',
        aiResult: JSON.stringify(parsedResult),
        aiModel: aiResult.model,
        aiUsage: aiResult.usage.totalTokens,
      },
    })

    const report = await prisma.report.create({
      data: {
        assessmentId,
        title: `${assessment.companyName} - 企业资本合作初步评估报告`,
        summary: parsedResult.summary || '',
        companyInfo: JSON.stringify(parsedResult.companyInfo || {}),
        problemAnalysis: JSON.stringify(parsedResult.problemAnalysis || []),
        advantages: JSON.stringify(parsedResult.advantages || []),
        risks: JSON.stringify(parsedResult.risks || []),
        suggestions: JSON.stringify(parsedResult.suggestions || []),
        fullContent: JSON.stringify(parsedResult),
      },
    })

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { reportId: report.id },
    })

    fireNotification(notifyReportComplete({
      id: assessmentId,
      reportId: report.id,
      companyName: assessment.companyName,
      score: parsedResult.score ?? 0,
      grade: parsedResult.grade ?? '-',
    }))

    return report
  } catch (error: any) {
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'failed' },
    })

    fireNotification(notifyReportFailed({
      id: assessmentId,
      companyName: assessment.companyName,
      error: error.message || '未知错误',
    }))

    throw error
  }
}

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

  if (incrementView) {
    await prisma.report.update({
      where: { id: reportId },
      data: { viewCount: { increment: 1 } },
    })
  }

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

export async function getReportByAssessmentId(assessmentId: string) {
  return prisma.report.findUnique({ where: { assessmentId } })
}

function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

export function getReportPreview(fullReport: any) {
  const { problemAnalysis, advantages, summary, fullContent } = fullReport
  const rawScore = fullContent?.score
  const score = (typeof rawScore === 'number' && !Number.isNaN(rawScore))
    ? Math.floor(rawScore * 0.7)
    : null

  return {
    summary: summary ? summary.substring(0, Math.floor(summary.length * 0.3)) + '...' : '',
    companyInfo: fullReport.companyInfo || {},
    problemAnalysis: Array.isArray(problemAnalysis) ? problemAnalysis.slice(0, Math.max(1, Math.floor(problemAnalysis.length * 0.3))) : [],
    advantages: Array.isArray(advantages) ? advantages.slice(0, Math.max(1, Math.floor(advantages.length * 0.3))) : [],
    risks: [],
    suggestions: [],
    isPreview: true,
    score,
    grade: null,
  }
}

