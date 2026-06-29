import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentSuccess } from '@/lib/payment'
import { verifyWechatNotifySign } from '@/lib/payment/wechat'
import { IS_DEV } from '@/lib/config'

function wechatResponse(returnCode: 'SUCCESS' | 'FAIL', returnMsg: string, status = 200) {
  return new NextResponse(
    JSON.stringify({ return_code: returnCode, return_msg: returnMsg }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    let notifyData: any

    try {
      notifyData = JSON.parse(body)
    } catch {
      notifyData = { raw: body }
    }

    if (IS_DEV) {
      const orderNo = notifyData.out_trade_no || notifyData.orderNo
      const transactionId = notifyData.transaction_id || notifyData.transactionId || `dev_${Date.now()}`
      if (orderNo) {
        await handlePaymentSuccess(orderNo, transactionId, 'wechat', body)
      }
      return wechatResponse('SUCCESS', 'OK')
    }

    if (!process.env.WECHAT_MCH_ID) {
      return wechatResponse('FAIL', '服务未配置', 500)
    }

    if (!verifyWechatNotifySign(notifyData)) {
      return wechatResponse('FAIL', '签名验证失败', 400)
    }

    if (notifyData.return_code !== 'SUCCESS' || notifyData.result_code !== 'SUCCESS') {
      return wechatResponse('SUCCESS', 'OK')
    }

    const orderNo = notifyData.out_trade_no
    const transactionId = notifyData.transaction_id
    if (!orderNo) {
      return wechatResponse('FAIL', '缺少订单号', 400)
    }

    await handlePaymentSuccess(orderNo, transactionId, 'wechat', body)
    return wechatResponse('SUCCESS', 'OK')
  } catch (error) {
    console.error('微信支付回调处理失败:', error)
    return wechatResponse('FAIL', '处理失败', 500)
  }
}
