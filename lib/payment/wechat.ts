// 寰俊鏀粯灏佽
// 鏀寔 JSAPI 鏀粯锛堝叕浼楀彿/寰俊娴忚鍣ㄥ唴锛?// 娉ㄦ剰锛氬疄闄呯敓浜х幆澧冮渶瑕佸晢鎴峰彿銆佽瘉涔︾瓑閰嶇疆

import { PAYMENT_CONFIG, buildUrl } from '../config'
import { generateOrderNo } from '../utils/order'
import crypto from 'crypto'

// 鍒涘缓 JSAPI 璁㈠崟鍙傛暟
export interface WechatPayParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

// 鍒涘缓鏀粯璁㈠崟璇锋眰
export interface CreatePayOrderRequest {
  orderNo: string
  amount: number
  description: string
  openid?: string
  clientIp?: string
}

/**
 * 鐢熸垚闅忔満瀛楃涓? */
function generateNonceStr(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex').substring(0, length)
}

/**
 * 鐢熸垚绛惧悕
 */
function generateSign(params: Record<string, any>, apiKey: string): string {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, any>)

  const stringA = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const stringSignTemp = `${stringA}&key=${apiKey}`
  
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase()
}

/**
 * 楠岃瘉寰俊鏀粯鍥炶皟绛惧悕
 */
export function verifyWechatNotifySign(params: Record<string, any>): boolean {
  const { sign } = params
  if (!sign) return false

  const paramsWithoutSign = { ...params }
  delete paramsWithoutSign.sign

  const calculatedSign = generateSign(paramsWithoutSign, PAYMENT_CONFIG.wechat.apiKey)
  return calculatedSign === sign.toUpperCase()
}

/**
 * 妯℃嫙鍒涘缓寰俊鏀粯璁㈠崟锛堝紑鍙戠幆澧冿級
 * 鐢熶骇鐜闇€瑕佽皟鐢ㄥ井淇℃敮浠樼粺涓€涓嬪崟 API
 */
export async function createWechatOrder(params: CreatePayOrderRequest): Promise<{
  prepayId: string
  payParams: WechatPayParams
}> {
  const { wechat } = PAYMENT_CONFIG

  // 寮€鍙戠幆澧冿細濡傛灉娌℃湁閰嶇疆鍟嗘埛鍙凤紝杩斿洖妯℃嫙鏁版嵁
  if (!wechat.mchId || !wechat.apiKey) {
    
    const mockPrepayId = `mock_prepay_${generateNonceStr(16)}`
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = generateNonceStr()

    return {
      prepayId: mockPrepayId,
      payParams: {
        appId: wechat.appId || 'wx_mock_appid',
        timeStamp,
        nonceStr,
        package: `prepay_id=${mockPrepayId}`,
        signType: 'MD5',
        paySign: generateSign(
          {
            appId: wechat.appId || 'wx_mock_appid',
            timeStamp,
            nonceStr,
            package: `prepay_id=${mockPrepayId}`,
            signType: 'MD5',
          },
          wechat.apiKey || 'mock_key'
        ),
      },
    }
  }

  const manualPrepayId = `manual_${params.orderNo}`
  const timeStamp = Math.floor(Date.now() / 1000).toString()
  const nonceStr = generateNonceStr()

  return {
    prepayId: manualPrepayId,
    payParams: {
      appId: wechat.appId || 'manual_payment',
      timeStamp,
      nonceStr,
      package: `manual_order=${params.orderNo}`,
      signType: 'MANUAL',
      paySign: generateSign(
        {
          appId: wechat.appId || 'manual_payment',
          timeStamp,
          nonceStr,
          package: `manual_order=${params.orderNo}`,
          signType: 'MANUAL',
        },
        wechat.apiKey || 'manual_key'
      ),
    },
  }
}

/**
 * 妯℃嫙鏀粯鎴愬姛鍥炶皟锛堝紑鍙戠幆澧冩祴璇曠敤锛? */
export function generateMockNotifyData(orderNo: string, amount: number): Record<string, any> {
  const { wechat } = PAYMENT_CONFIG
  const params = {
    return_code: 'SUCCESS',
    result_code: 'SUCCESS',
    appid: wechat.appId || 'wx_mock_appid',
    mch_id: wechat.mchId || 'mock_mch_id',
    nonce_str: generateNonceStr(),
    openid: 'mock_openid',
    trade_type: 'JSAPI',
    bank_type: 'CFT',
    total_fee: amount,
    fee_type: 'CNY',
    transaction_id: `mock_trans_${Date.now()}`,
    out_trade_no: orderNo,
    time_end: new Date().toISOString().replace(/[-T:]/g, '').substring(0, 14),
    trade_state: 'SUCCESS',
  }

  const sign = generateSign(params, wechat.apiKey || 'mock_key')
  return { ...params, sign }
}


