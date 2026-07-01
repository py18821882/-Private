import { randomUUID } from 'crypto'
import { after, NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReport } from '@/lib/report'
import { notifyNewAssessment, fireNotification } from '@/lib/wecom/bot'

export const maxDuration = 60

function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, industry, mainBusiness, revenue, profit, employeeCount, bossGoal, contactPhone, contactName } = body

    if (!companyName?.trim()) return badRequest('请填写企业/项目名称')
    if (!industry) return badRequest('请选择项目类型')
    if (!mainBusiness?.trim()) return badRequest('请填写主营业务/项目亮点')
    if (!revenue) return badRequest('请选择营收规模')
    if (!profit) return badRequest('请选择利润情况')
    if (!employeeCount) return badRequest('请选择员工人数')
    if (!bossGoal?.trim()) return badRequest('请填写项目诉求')
    if (contactPhone?.trim() && !isValidPhone(contactPhone.trim())) {
      return badRequest('请输入正确的手机号')
    }

    const assessment = {
      id: randomUUID(),
      companyName: companyName.trim().slice(0, 100),
      industry: String(industry).slice(0, 50),
      mainBusiness: mainBusiness.trim().slice(0, 500),
      revenue: String(revenue).slice(0, 50),
      profit: String(profit).slice(0, 50),
      employeeCount: String(employeeCount).slice(0, 50),
      bossGoal: bossGoal.trim().slice(0, 500),
      contactPhone: contactPhone?.trim() || null,
      contactName: contactName?.trim()?.slice(0, 50) || null,
    }

    const rows = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "Assessment" (
        "id",
        "companyName",
        "industry",
        "mainBusiness",
        "revenue",
        "profit",
        "employeeCount",
        "bossGoal",
        "contactPhone",
        "contactName",
        "status",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${assessment.id},
        ${assessment.companyName},
        ${assessment.industry},
        ${assessment.mainBusiness},
        ${assessment.revenue},
        ${assessment.profit},
        ${assessment.employeeCount},
        ${assessment.bossGoal},
        ${assessment.contactPhone},
        ${assessment.contactName},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING "id"
    `

    const assessmentId = rows[0]?.id
    if (!assessmentId) {
      throw new Error('创建评估记录失败')
    }

    after(async () => {
      try {
        await generateReport(assessmentId)
      } catch (error: any) {
        console.error('AI report generation failed:', error.message)
      }
    })

    fireNotification(notifyNewAssessment({
      id: assessmentId,
      companyName: assessment.companyName,
      industry: assessment.industry,
      mainBusiness: assessment.mainBusiness,
      revenue: assessment.revenue,
      profit: assessment.profit,
      employeeCount: assessment.employeeCount,
      bossGoal: assessment.bossGoal,
      contactName: assessment.contactName,
      contactPhone: assessment.contactPhone,
      createdAt: new Date(),
    }))

    return NextResponse.json({ assessment_id: assessmentId })
  } catch (error: any) {
    console.error('create assessment failed:', error)
    return NextResponse.json({ error: '提交失败，请重试' }, { status: 500 })
  }
}
