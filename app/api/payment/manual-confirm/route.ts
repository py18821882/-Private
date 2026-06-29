import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, successResponse } from '@/lib/utils/response'
import { handlePaymentSuccess } from '@/lib/payment'

export async function POST(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD

  if (!appPassword) {
    return NextResponse.json(errorResponse('未配置管理密码', 500), { status: 500 })
  }

  const body = await request.json()
  const password = body.password || request.headers.get('x-admin-password')

  if (password !== appPassword) {
    return NextResponse.json(errorResponse('未授权', 401), { status: 401 })
  }

  const orderNo = String(body.orderNo || '').trim()
  if (!orderNo) {
    return NextResponse.json(errorResponse('缺少订单号', 400), { status: 400 })
  }

  const order = await handlePaymentSuccess(
    orderNo,
    `manual_${Date.now()}`,
    'manual',
    JSON.stringify({ manual: true, orderNo })
  )

  return NextResponse.json(successResponse({ orderId: order.id, orderNo: order.orderNo }))
}
