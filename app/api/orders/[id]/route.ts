// 查询订单状态 API
// GET /api/orders/[id]

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, notFoundError } from '@/lib/utils/response'
import { checkOrderStatus } from '@/lib/payment'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const status = await checkOrderStatus(id)

    return NextResponse.json(successResponse(status))
  } catch (error: any) {
    if (error.message === '订单不存在') {
      return NextResponse.json(notFoundError(error.message))
    }
    console.error('查询订单失败:', error)
    return NextResponse.json(errorResponse('查询失败'))
  }
}
