// 报告 API
// GET /api/reports/[id]

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, notFoundError } from '@/lib/utils/response'
import { getReport, getReportPreview } from '@/lib/report'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        assessment: {
          select: {
            id: true,
            paid: true,
            companyName: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json(notFoundError('报告不存在'))
    }

    const fullReport = await getReport(id)

    if (report.assessment?.paid) {
      // 已支付，返回完整报告
      return NextResponse.json(successResponse(fullReport))
    } else {
      // 未支付，只返回预览字段（不泄露 fullContent / 完整 risks / 完整 suggestions）
      const preview = getReportPreview(fullReport)
      return NextResponse.json(
        successResponse({
          id: fullReport.id,
          title: fullReport.title,
          assessment: fullReport.assessment,
          createdAt: fullReport.createdAt,
          ...preview,
          isPreview: true,
          // 明确不返回 fullContent
          fullContent: null,
        })
      )
    }
  } catch (error: any) {
    console.error('获取报告失败:', error)
    return NextResponse.json(errorResponse('获取失败'))
  }
}
