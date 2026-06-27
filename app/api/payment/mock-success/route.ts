// 模拟支付成功 API（仅开发环境可用）
// POST /api/payment/mock-success
// 生产环境此接口始终返回 403

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/response'
import { handlePaymentSuccess } from '@/lib/payment'
import { IS_DEV } from '@/lib/config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // 生产环境严格禁止模拟支付（无论 ALLOW_MOCK_PAYMENT 如何设置）
  if (!IS_DEV) {
    return NextResponse.json(errorResponse('生产环境不允许模拟支付', 403), { status: 403 })
  }

  try {
    const body = await request.json()
    const { orderId, orderNo } = body

    if (!orderId && !orderNo) {
      return NextResponse.json(errorResponse('请提供 orderId 或 orderNo'))
    }

    let targetOrderNo = orderNo

    if (orderId && !orderNo) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      })
      if (!order) {
        return NextResponse.json(errorResponse('订单不存在'))
      }
      targetOrderNo = order.orderNo
    }

    await handlePaymentSuccess(
      targetOrderNo,
      `mock_${Date.now()}`,
      'wechat',
      JSON.stringify({ mock: true, orderId, orderNo: targetOrderNo })
    )

    return NextResponse.json(successResponse(null, '模拟支付成功'))
  } catch (error: any) {
    console.error('模拟支付失败:', error)
    return NextResponse.json(errorResponse(error.message || '操作失败'))
  }
}
