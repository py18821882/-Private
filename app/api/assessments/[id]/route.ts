import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, notFoundError, errorResponse } from '@/lib/utils/response'
import { getReport, getReportPreview } from '@/lib/report'
import { PAYMENT_CONFIG } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        report: true,
      },
    })

    if (!assessment) {
      return NextResponse.json(notFoundError('测评记录不存在'))
    }

    const result: any = {
      id: assessment.id,
      companyName: assessment.companyName,
      industry: assessment.industry,
      mainBusiness: assessment.mainBusiness,
      revenue: assessment.revenue,
      profit: assessment.profit,
      employeeCount: assessment.employeeCount,
      bossGoal: assessment.bossGoal,
      status: assessment.status,
      paid: assessment.paid,
      createdAt: assessment.createdAt,
      price: PAYMENT_CONFIG.defaultPrice,
    }

    if (assessment.report) {
      try {
        const fullReport = await getReport(assessment.report.id, false)

        if (assessment.paid) {
          result.report = fullReport
        } else {
          result.reportPreview = getReportPreview(fullReport)
          result.report = { id: fullReport.id }
        }
      } catch (error) {
        console.error('获取报告失败:', error)
      }
    }

    return NextResponse.json(successResponse(result))
  } catch (error: any) {
    console.error('获取测评详情失败:', error)
    return NextResponse.json(errorResponse('获取失败'))
  }
}
