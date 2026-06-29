import crypto from 'crypto'

export interface FeishuConfig {
  webhookUrl: string
  secret?: string
}

function getConfig(): FeishuConfig {
  return {
    webhookUrl: process.env.FEISHU_WEBHOOK_URL || process.env.FEISHU_BOT_WEBHOOK || '',
    secret: process.env.FEISHU_BOT_SECRET || '',
  }
}

export function isFeishuEnabled(): boolean {
  return !!getConfig().webhookUrl
}

function generateSign(secret: string, timestamp: number): string {
  const stringToSign = `${timestamp}\n${secret}`
  return crypto.createHmac('sha256', stringToSign).update('').digest('base64')
}

async function postToFeishu(payload: any): Promise<boolean> {
  const config = getConfig()
  if (!config.webhookUrl) return false

  const body = { ...payload }
  if (config.secret) {
    const timestamp = Math.floor(Date.now() / 1000)
    body.timestamp = timestamp
    body.sign = generateSign(config.secret, timestamp)
  }

  try {
    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    return json.code === 0 || json.StatusCode === 0
  } catch (error: any) {
    console.error('[飞书] 推送失败:', error.message || error)
    return false
  }
}

export async function sendFeishuText(content: string): Promise<boolean> {
  return postToFeishu({
    msg_type: 'text',
    content: { text: content },
  })
}

export async function sendFeishuCard(card: any): Promise<boolean> {
  return postToFeishu({
    msg_type: 'interactive',
    card,
  })
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
  return sendFeishuText([
    '企业并购与资本合作评估提交',
    `企业：${data.companyName}`,
    `联系人：${data.name}`,
    `手机：${data.phone}`,
    `城市：${data.city || '-'}`,
    `行业：${data.industry || '-'}`,
    `营收：${data.revenue || '-'}`,
    `需求：${data.demand || '-'}`,
    `评估：${data.grade} / ${data.score}`,
    `记录ID：${data.id}`,
  ].join('\n'))
}
