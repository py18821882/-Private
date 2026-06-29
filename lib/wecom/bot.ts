export interface WecomConfig {
  webhookUrl: string
}

function getConfig(): WecomConfig {
  return {
    webhookUrl: process.env.WECOM_WEBHOOK_URL || process.env.WECOM_BOT_WEBHOOK || '',
  }
}

export function isWecomEnabled(): boolean {
  return !!getConfig().webhookUrl
}

export async function sendWecomText(content: string, mentionedList?: string[], mentionedMobileList?: string[]): Promise<boolean> {
  const config = getConfig()
  if (!config.webhookUrl) return false

  try {
    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'text',
        text: {
          content,
          mentioned_list: mentionedList || [],
          mentioned_mobile_list: mentionedMobileList || [],
        },
      }),
    })
    const json = await res.json()
    return json.errcode === 0
  } catch (error: any) {
    console.error('[企业微信] 推送失败:', error.message || error)
    return false
  }
}

export async function sendWecomMarkdown(content: string): Promise<boolean> {
  const config = getConfig()
  if (!config.webhookUrl) return false

  try {
    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msgtype: 'markdown', markdown: { content } }),
    })
    const json = await res.json()
    return json.errcode === 0
  } catch (error: any) {
    console.error('[企业微信] 推送失败:', error.message || error)
    return false
  }
}

function formatAmount(fen: number): string {
  return `¥${(fen / 100).toFixed(2)}`
}

function formatTime(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return value.toLocaleString('zh-CN', { hour12: false })
}

function getReportUrl(reportId: string): string {
  const domain = process.env.NEXT_PUBLIC_H5_DOMAIN || 'http://localhost:3000'
  return `${domain}/report/${reportId}`
}

export async function sendMaAssessmentNotify(data: {
  id: string
  name: string
  phone: string
  companyName: string
  city?: string | null
  industry?: string | null
  revenue?: string | null
  demand?: string | null
  willing?: string | null
  score: number
  grade: string
}): Promise<boolean> {
  return sendWecomMarkdown(`**企业并购与资本合作评估提交**\n\n> 企业：${data.companyName}\n> 联系人：${data.name}\n> 手机：${data.phone}\n> 城市：${data.city || '-'}\n> 行业：${data.industry || '-'}\n> 需求：${data.demand || '-'}\n> 评估：${data.grade} / ${data.score}\n\n记录ID：${data.id}`)
}

export async function notifyNewAssessment(data: {
  id: string
  companyName: string
  industry: string
  mainBusiness?: string | null
  revenue?: string | null
  profit?: string | null
  employeeCount?: string | null
  bossGoal?: string | null
  contactName?: string | null
  contactPhone?: string | null
  createdAt: Date | string
}): Promise<boolean> {
  return sendWecomMarkdown(`**企业资本合作评估新提交**\n\n> 企业：${data.companyName}\n> 类型：${data.industry || '-'}\n> 业务：${data.mainBusiness || '-'}\n> 营收：${data.revenue || '-'}\n> 利润：${data.profit || '-'}\n> 人员：${data.employeeCount || '-'}\n> 诉求：${data.bossGoal || '-'}\n> 联系人：${data.contactName || '-'}\n> 手机：${data.contactPhone || '-'}\n> 时间：${formatTime(data.createdAt)}\n\n记录ID：${data.id}`)
}

export async function notifyReportComplete(data: {
  id: string
  reportId: string
  companyName: string
  score: number
  grade: string
}): Promise<boolean> {
  return sendWecomMarkdown(`**企业资本合作评估报告已生成**\n\n> 企业：${data.companyName}\n> 匹配度：${data.score}\n> 等级：${data.grade}\n\n[查看报告](${getReportUrl(data.reportId)})\n\n记录ID：${data.id}`)
}

export async function notifyReportFailed(data: {
  id: string
  companyName: string
  error: string
}): Promise<boolean> {
  return sendWecomMarkdown(`**企业资本合作评估生成失败**\n\n> 企业：${data.companyName}\n> 错误：${data.error}\n\n记录ID：${data.id}`)
}

export async function notifyPaymentSuccess(data: {
  orderNo: string
  companyName: string
  amount: number
  payMethod: string
  payTime: Date
  reportId: string
}): Promise<boolean> {
  return sendWecomMarkdown(`**收款确认通知**\n\n> 企业：${data.companyName}\n> 订单：${data.orderNo}\n> 金额：${formatAmount(data.amount)}\n> 方式：${data.payMethod}\n> 时间：${formatTime(data.payTime)}\n\n${data.reportId ? `[查看报告](${getReportUrl(data.reportId)})` : ''}`)
}

export function fireNotification(promise: Promise<boolean>): void {
  promise.catch((error) => {
    console.error('[企业微信] 通知异常:', error?.message || error)
  })
}
