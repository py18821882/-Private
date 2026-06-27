// 订单号生成工具
// 生成唯一订单号

import crypto from 'crypto'

// 生成订单号：前缀 + 时间戳 + 随机数
export function generateOrderNo(prefix: string = 'ORD'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
  // 使用加密安全的随机数，避免高并发碰撞
  const random = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// 生成测评编号
export function generateAssessmentNo(): string {
  return generateOrderNo('ASM')
}

// 格式化金额（分转元）
export function formatAmount(amount: number): string {
  return (amount / 100).toFixed(2)
}

// 元转分
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100)
}

// 分转元
export function fenToYuan(fen: number): number {
  return fen / 100
}
