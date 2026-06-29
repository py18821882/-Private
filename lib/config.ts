// 鍏ㄥ眬閰嶇疆鏂囦欢
// 缁熶竴绠＄悊鍩熷悕銆佺幆澧冨彉閲忋€佺郴缁熷弬鏁?// 鎵€鏈夐摼鎺ヤ粠杩欓噷璇诲彇锛屼笉瑕佸啓姝?localhost

// ===== 鍩熷悕閰嶇疆 =====
export const DOMAINS = {
  // H5 鍓嶇鍩熷悕锛堢敤鎴疯闂殑娴嬭瘎椤碉級
  h5: process.env.NEXT_PUBLIC_H5_DOMAIN || 'http://localhost:3000',
  // 涓荤珯/鍚庡彴鍩熷悕
  app: process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3000',
  api: process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:3000',
  // 绠＄悊鍚庡彴鍩熷悕
  admin: process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'http://localhost:3000',
}

// ===== AI 妯″瀷閰嶇疆 =====
export const AI_CONFIG = {
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.OPENAI_API_KEY || '',
  // 榛樿妯″瀷
  defaultModel: process.env.OPENAI_MODEL || 'deepseek-chat',
  analyzeModel: process.env.AI_ANALYZE_MODEL || process.env.OPENAI_MODEL || 'deepseek-chat',
  // 鎶ュ憡鐢熸垚妯″瀷
  reportModel: process.env.AI_REPORT_MODEL || process.env.OPENAI_MODEL || 'deepseek-chat',
  maxRetries: 2,
  // 瓒呮椂鏃堕棿锛堟绉掞級
  timeout: 60000,
}

// ===== 鏀粯閰嶇疆 =====
export const PAYMENT_CONFIG = {
  // 寰俊鏀粯
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    // 鏀粯鍥炶皟鍦板潃
    notifyUrl: process.env.WECHAT_NOTIFY_URL || `${DOMAINS.api}/api/payment/wechat/notify`,
    // 璇佷功璺緞锛堥€€娆剧瓑楂樼骇鍔熻兘闇€瑕侊級
    certPath: process.env.WECHAT_CERT_PATH || '',
  },
  // 榛樿鎶ュ憡浠锋牸锛堝崟浣嶏細鍒嗭級
  defaultPrice: (() => {
    const raw = process.env.REPORT_DEFAULT_PRICE
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 19900
  })(),
}

// ===== 绯荤粺閰嶇疆 =====
export const SYSTEM_CONFIG = {
  // 浜у搧鍚嶇О
  productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || '企业资本合作初步评估',
  // 鍏徃鍚嶇О
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || '中科商业咨询',
  // 瀹㈡湇寰俊
  serviceWechat: process.env.NEXT_PUBLIC_SERVICE_WECHAT || '',
  // 瀹㈡湇鐢佃瘽
  servicePhone: process.env.NEXT_PUBLIC_SERVICE_PHONE || '',
}

// ===== 鐜鍒ゆ柇 =====
export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_PROD = process.env.NODE_ENV === 'production'

// 瀹屾暣 URL 鏋勫缓宸ュ叿
export function buildUrl(path: string, domain: keyof typeof DOMAINS = 'h5'): string {
  const base = DOMAINS[domain]
  if (path.startsWith('http')) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}


