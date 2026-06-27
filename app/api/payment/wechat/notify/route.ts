// 微信支付回调 API
// POST /api/payment/wechat/notify
// 微信支付成功后，微信服务器会回调这个接口

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePaymentSuccess } from '@/lib/payment'
import { verifyWechatNotifySign } from '@/lib/payment/wechat'
import { IS_DEV } from '@/lib/config'

// 微信支付回调
export async function POST(request: NextRequest) {
  try {
    // 读取原始 XML 或 JSON 数据
    const body = await request.text()

    console.log('收到微信支付回调:', body.substring(0, 500))

    // 这里简化处理：解析 JSON 格式
    // 实际微信 V2 是 XML，V3 是 JSON
    // 开发环境使用模拟数据
    let notifyData: any

    try {
      notifyData = JSON.parse(body)
    } catch {
      // 如果不是 JSON，可能是 XML，这里简单处理
      notifyData = { raw: body }
    }

    // 开发环境：跳过签名验证（仅限 IS_DEV=true）
    if (IS_DEV) {
      console.log('⚠️  开发模式，跳过微信签名验证')

      const orderNo = notifyData.out_trade_no || notifyData.orderNo
      const transactionId = notifyData.transaction_id || notifyData.transactionId || 'mock_transaction'

      if (orderNo) {
        await handlePaymentSuccess(orderNo, transactionId, 'wechat', body)
      }

      // 返回微信要求的成功响应
      return new NextResponse(
        JSON.stringify({ return_code: 'SUCCESS', return_msg: 'OK' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 生产环境：必须验证签名
    // 如果未配置微信支付商户号，拒绝请求（防止伪造）
    if (!process.env.WECHAT_MCH_ID) {
      console.error('生产环境未配置微信支付商户号（WECHAT_MCH_ID），拒绝回调')
      return new NextResponse(
        JSON.stringify({ return_code: 'FAIL', return_msg: '服务未配置' }),
        { status: 500 }
      )
    }

    const isValid = verifyWechatNotifySign(notifyData)
    if (!isValid) {
      console.error('微信支付回调签名验证失败')
      return new NextResponse(
        JSON.stringify({ return_code: 'FAIL', return_msg: '签名验证失败' }),
        { status: 400 }
      )
    }

    // 检查支付状态（任一不为 SUCCESS 即视为未成功）
    if (notifyData.return_code !== 'SUCCESS' || notifyData.result_code !== 'SUCCESS') {
      console.log('支付未成功:', notifyData.result_code || notifyData.trade_state)
      return new NextResponse(
        JSON.stringify({ return_code: 'SUCCESS', return_msg: 'OK' }),
        { status: 200 }
      )
    }

    const orderNo = notifyData.out_trade_no
    const transactionId = notifyData.transaction_id

    if (!orderNo) {
      return new NextResponse(
        JSON.stringify({ return_code: 'FAIL', return_msg: '缺少订单号' }),
        { status: 400 }
      )
    }

    // 处理支付成功
    await handlePaymentSuccess(orderNo, transactionId, 'wechat', body)

    // 返回成功响应给微信
    return new NextResponse(
      JSON.stringify({ return_code: 'SUCCESS', return_msg: 'OK' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('微信支付回调处理失败:', error)
    return new NextResponse(
      JSON.stringify({ return_code: 'FAIL', return_msg: '处理失败' }),
      { status: 500 }
    )
  }
}
