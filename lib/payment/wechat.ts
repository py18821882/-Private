// 微信支付封装
// 支持 JSAPI 支付（公众号/微信浏览器内）
// 注意：实际生产环境需要商户号、证书等配置

import { PAYMENT_CONFIG, buildUrl } from '../config'
import { generateOrderNo } from '../utils/order'
import crypto from 'crypto'

// 创建 JSAPI 订单参数
export interface WechatPayParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

// 创建支付订单请求
export interface CreatePayOrderRequest {
  orderNo: string
  amount: number // 分
  description: string
  openid?: string // 用户 openid（JSAPI 必需）
  clientIp?: string
}

/**
 * 生成随机字符串
 */
function generateNonceStr(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex').substring(0, length)
}

/**
 * 生成签名
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
 * 验证微信支付回调签名
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
 * 模拟创建微信支付订单（开发环境）
 * 生产环境需要调用微信支付统一下单 API
 */
export async function createWechatOrder(params: CreatePayOrderRequest): Promise<{
  prepayId: string
  payParams: WechatPayParams
}> {
  const { wechat } = PAYMENT_CONFIG

  // 开发环境：如果没有配置商户号，返回模拟数据
  if (!wechat.mchId || !wechat.apiKey) {
    console.warn('⚠️  微信支付未配置，使用模拟支付模式')
    
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

  // 生产环境：调用微信支付统一下单 API
  // 这里需要根据微信支付 V3 或 V2 接口实现
  // 为简化，先使用模拟实现，生产环境请替换为真实 API 调用
  throw new Error('生产环境微信支付请接入真实 API')
}

/**
 * 模拟支付成功回调（开发环境测试用）
 */
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
