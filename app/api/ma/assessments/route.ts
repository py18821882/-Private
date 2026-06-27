// 并购价值测评 API
// POST /api/ma/assessments - 提交测评（公开）
// GET  /api/ma/assessments - 获取列表（管理用，需密码鉴权）

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationError } from '@/lib/utils/response'
import { sendMaAssessmentNotify } from '@/lib/wecom/bot'

// 防刷：同一手机号 10 分钟内最多提交 3 次
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3

// HTML 转义，防止 XSS
function escapeHtml(str: string): string {
  if (!str) return str
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 校验管理后台权限
function checkAdminAuth(request: NextRequest): boolean {
  const appPassword = process.env.APP_PASSWORD
  if (!appPassword) return true // 未配置密码则放行（本地开发）
  const authCookie = request.cookies.get('workbench_auth')?.value
  return authCookie === appPassword
}

// 提交测评
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, phone, companyName, city, industry, revenue, demand, willing, score, grade, answers } = body

    if (!name) return NextResponse.json(validationError('请填写姓名'))
    if (!phone) return NextResponse.json(validationError('请填写手机号'))
    if (!/^1[3-9]\d{9}$/.test(phone)) return NextResponse.json(validationError('手机号格式不正确'))
    if (!companyName) return NextResponse.json(validationError('请填写公司名称'))
    if (score === undefined || score === null) return NextResponse.json(validationError('缺少测评得分'))
    if (!grade) return NextResponse.json(validationError('缺少测评等级'))

    const numScore = Number(score)
    if (isNaN(numScore) || numScore < 0 || numScore > 75) {
      return NextResponse.json(validationError('测评得分无效'))
    }

    const validGrades = ['A', 'B', 'C', 'D']
    if (!validGrades.includes(grade.trim().toUpperCase())) {
      return NextResponse.json(validationError('测评等级无效'))
    }

    // 频率限制：同一手机号 10 分钟内最多 3 次
    const recentCount = await prisma.maAssessment.count({
      where: {
        phone: phone.trim(),
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS),
        },
      },
    })
    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(validationError('提交过于频繁，请稍后再试'))
    }

    const cleanName = escapeHtml(name.trim()).slice(0, 50)
    const cleanCompany = escapeHtml(companyName.trim()).slice(0, 100)
    const cleanCity = city ? escapeHtml(city.trim()).slice(0, 50) : null
    const cleanIndustry = industry ? escapeHtml(industry.trim()).slice(0, 50) : null
    const cleanRevenue = revenue ? escapeHtml(revenue.trim()).slice(0, 50) : null
    const cleanDemand = demand ? escapeHtml(demand.trim()).slice(0, 200) : null
    const cleanWilling = willing ? escapeHtml(willing.trim()).slice(0, 50) : null

    const assessment = await prisma.maAssessment.create({
      data: {
        name: cleanName,
        phone: phone.trim(),
        companyName: cleanCompany,
        city: cleanCity,
        industry: cleanIndustry,
        revenue: cleanRevenue,
        demand: cleanDemand,
        willing: cleanWilling,
        score: numScore,
        grade: grade.trim().toUpperCase(),
        answers: answers ? JSON.stringify(answers) : null,
        status: 'pending',
      },
    })

    // 异步推送企业微信通知（不阻塞响应）
    sendMaAssessmentNotify({
      id: assessment.id,
      name: assessment.name,
      phone: assessment.phone,
      companyName: assessment.companyName,
      city: assessment.city,
      industry: assessment.industry,
      revenue: assessment.revenue,
      demand: assessment.demand,
      willing: assessment.willing,
      score: assessment.score,
      grade: assessment.grade,
    }).catch((e) => console.error('企业微信推送失败:', e))

    return NextResponse.json(
      successResponse(
        {
          id: assessment.id,
          grade: assessment.grade,
          score: assessment.score,
        },
        '提交成功'
      )
    )
  } catch (error: any) {
    console.error('提交并购测评失败:', error)
    return NextResponse.json(errorResponse('提交失败，请重试'))
  }
}

// 获取测评列表（管理用，需鉴权）
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { success: false, code: 401, message: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 100)
    const grade = searchParams.get('grade')
    const status = searchParams.get('status')

    const where: any = {}
    if (grade) where.grade = grade
    if (status) where.status = status

    const [list, total] = await Promise.all([
      prisma.maAssessment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.maAssessment.count({ where }),
    ])

    return NextResponse.json(
      successResponse({
        list,
        total,
        page,
        pageSize,
      })
    )
  } catch (error: any) {
    console.error('获取并购测评列表失败:', error)
    return NextResponse.json(errorResponse('获取失败'))
  }
}
