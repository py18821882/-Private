// 创建订单 API
// POST /api/orders

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, validationError } from '@/lib/utils/response'
import { createOrder, createWechatPayParams } from '@/lib/payment'

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, payMethod = 'wechat' } = body

    if (!assessmentId) {
      return NextResponse.json(validationError('缺少测评 ID'))
    }

    // 创建订单
    const order = await createOrder({
      assessmentId,
      payMethod: payMethod as 'wechat' | 'alipay',
    })

    // 生成支付参数
    const payParams = await createWechatPayParams(order.id)

    return NextResponse.json(
      successResponse(
        {
          orderId: order.id,
          orderNo: order.orderNo,
          amount: order.amount,
          status: order.status,
          payParams: payParams.payParams,
          createdAt: order.createdAt,
        },
        '订单创建成功'
      )
    )
  } catch (error: any) {
    console.error('创建订单失败:', error)
    return NextResponse.json(errorResponse(error.message || '创建订单失败'))
  }
}
