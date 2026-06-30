// 提交测评 API
// POST /api/assessments  — 公开，H5 用户提交
// GET  /api/assessments  — 需要管理员认证

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationError, unauthorizedError } from '@/lib/utils/response'
import { generateReport } from '@/lib/report'
import { notifyNewAssessment, fireNotification } from '@/lib/wecom/bot'

// 手机号校验
function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

function createFallbackId(): string {
  return `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// 提交测评
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 参数校验
    const { companyName, industry, mainBusiness, revenue, profit, employeeCount, bossGoal, contactPhone, contactName } = body

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0)
      return NextResponse.json(validationError('请填写企业名称'))
    if (!industry) return NextResponse.json(validationError('请选择行业'))
    if (!mainBusiness || typeof mainBusiness !== 'string' || mainBusiness.trim().length === 0)
      return NextResponse.json(validationError('请填写主营业务'))
    if (!revenue) return NextResponse.json(validationError('请选择营收规模'))
    if (!profit) return NextResponse.json(validationError('请选择利润情况'))
    if (!employeeCount) return NextResponse.json(validationError('请选择员工人数'))
    if (!bossGoal || typeof bossGoal !== 'string' || bossGoal.trim().length === 0)
      return NextResponse.json(validationError('请填写老板目标'))

    // 手机号格式校验（如果提供了的话）
    if (contactPhone && !isValidPhone(contactPhone.trim())) {
      return NextResponse.json(validationError('请输入正确的手机号'))
    }

    const assessmentData = {
      companyName: companyName.trim().slice(0, 100),
      industry: String(industry).slice(0, 50),
      mainBusiness: mainBusiness.trim().slice(0, 500),
      revenue: String(revenue).slice(0, 50),
      profit: String(profit).slice(0, 50),
      employeeCount: String(employeeCount).slice(0, 50),
      bossGoal: bossGoal.trim().slice(0, 500),
      contactPhone: contactPhone?.trim() || null,
      contactName: contactName?.trim()?.slice(0, 50) || null,
      status: 'pending',
    }

    let assessment
    try {
      assessment = await prisma.assessment.create({
        data: assessmentData,
      })
    } catch (dbError: any) {
      const fallbackId = createFallbackId()
      const createdAt = new Date()

      console.error('数据库写入失败，已启用人工承接兜底:', dbError?.message || dbError)
      console.info('人工承接线索:', {
        id: fallbackId,
        ...assessmentData,
        createdAt: createdAt.toISOString(),
      })

      fireNotification(notifyNewAssessment({
        id: fallbackId,
        companyName: assessmentData.companyName,
        industry: assessmentData.industry,
        mainBusiness: assessmentData.mainBusiness,
        revenue: assessmentData.revenue,
        profit: assessmentData.profit,
        employeeCount: assessmentData.employeeCount,
        bossGoal: assessmentData.bossGoal,
        contactName: assessmentData.contactName,
        contactPhone: assessmentData.contactPhone,
        createdAt,
      }))

      return NextResponse.json(
        successResponse(
          {
            id: fallbackId,
            status: 'manual_pending',
            fallback: true,
            createdAt,
          },
          '资料已收到，我们会尽快人工跟进'
        )
      )
    }

    // 异步触发 AI 分析（不阻塞响应）
    // 前端通过轮询获取分析状态
    generateReport(assessment.id).catch((error: any) => {
      console.error('❌ AI 分析失败:', error.message)
    })

    // 企业微信通知：新测评提交（fire-and-forget）
    fireNotification(notifyNewAssessment({
      id: assessment.id,
      companyName: assessment.companyName,
      industry: assessment.industry,
      mainBusiness: assessment.mainBusiness,
      revenue: assessment.revenue,
      profit: assessment.profit,
      employeeCount: assessment.employeeCount,
      bossGoal: assessment.bossGoal,
      contactName: assessment.contactName,
      contactPhone: assessment.contactPhone,
      createdAt: assessment.createdAt,
    }))

    return NextResponse.json(
      successResponse(
        {
          id: assessment.id,
          status: assessment.status,
          createdAt: assessment.createdAt,
        },
        '测评提交成功，正在生成分析...'
      )
    )
  } catch (error: any) {
    console.error('提交测评失败:', error)
    return NextResponse.json(errorResponse('提交失败，请重试'))
  }
}

// 获取测评列表（管理用，需要认证）
export async function GET(request: NextRequest) {
  try {
    // 鉴权：检查 APP_PASSWORD cookie
    const appPassword = process.env.APP_PASSWORD
    if (appPassword) {
      const authed = request.cookies.get('workbench_auth')?.value === appPassword
      if (!authed) {
        return NextResponse.json(unauthorizedError('需要管理员权限'), { status: 401 })
      }
    }

    const { searchParams } = new URL(request.url)
    const page = Math.min(Math.max(Number(searchParams.get('page')) || 1, 1), 100)
    const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize')) || 20, 1), 100)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          companyName: true,
          industry: true,
          status: true,
          paid: true,
          createdAt: true,
          // 不返回 contactPhone 等敏感信息
        },
      }),
      prisma.assessment.count({ where }),
    ])

    return NextResponse.json(
      successResponse({
        list: assessments,
        total,
        page,
        pageSize,
      })
    )
  } catch (error: any) {
    console.error('获取测评列表失败:', error)
    return NextResponse.json(errorResponse('获取失败'))
  }
}
