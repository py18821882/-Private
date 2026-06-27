// 全局配置文件
// 统一管理域名、环境变量、系统参数
// 所有链接从这里读取，不要写死 localhost

// ===== 域名配置 =====
// 从环境变量读取，部署时配置
export const DOMAINS = {
  // H5 前端域名（用户访问的测评页）
  h5: process.env.NEXT_PUBLIC_H5_DOMAIN || 'http://localhost:3000',
  // 主站/后台域名
  app: process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3000',
  // API 域名（如果前后端分离）
  api: process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:3000',
  // 管理后台域名
  admin: process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'http://localhost:3000',
}

// ===== AI 模型配置 =====
export const AI_CONFIG = {
  // API 基础地址（兼容 OpenAI 格式）
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
  // API Key（从环境变量读取，禁止硬编码）
  apiKey: process.env.OPENAI_API_KEY || '',
  // 默认模型
  defaultModel: process.env.OPENAI_MODEL || 'deepseek-chat',
  // 分析用模型
  analyzeModel: process.env.AI_ANALYZE_MODEL || process.env.OPENAI_MODEL || 'deepseek-chat',
  // 报告生成模型
  reportModel: process.env.AI_REPORT_MODEL || process.env.OPENAI_MODEL || 'deepseek-chat',
  // 最大重试次数
  maxRetries: 2,
  // 超时时间（毫秒）
  timeout: 60000,
}

// ===== 支付配置 =====
export const PAYMENT_CONFIG = {
  // 微信支付
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    // 支付回调地址
    notifyUrl: process.env.WECHAT_NOTIFY_URL || `${DOMAINS.api}/api/payment/wechat/notify`,
    // 证书路径（退款等高级功能需要）
    certPath: process.env.WECHAT_CERT_PATH || '',
  },
  // 默认报告价格（单位：分）
  defaultPrice: (() => {
    const raw = process.env.REPORT_DEFAULT_PRICE
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 19900
  })(),
}

// ===== 系统配置 =====
export const SYSTEM_CONFIG = {
  // 产品名称
  productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || '企业 AI 增长测评',
  // 公司名称
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || '中科创投',
  // 客服微信
  serviceWechat: process.env.NEXT_PUBLIC_SERVICE_WECHAT || '',
  // 客服电话
  servicePhone: process.env.NEXT_PUBLIC_SERVICE_PHONE || '',
}

// ===== 环境判断 =====
export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_PROD = process.env.NODE_ENV === 'production'

// 完整 URL 构建工具
export function buildUrl(path: string, domain: keyof typeof DOMAINS = 'h5'): string {
  const base = DOMAINS[domain]
  if (path.startsWith('http')) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
