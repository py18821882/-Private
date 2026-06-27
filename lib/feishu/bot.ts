// 飞书机器人工具
// 通过 webhook 推送消息到飞书群

export interface FeishuConfig {
  webhookUrl: string
  secret?: string
}

/**
 * 获取飞书配置
 */
function getConfig(): FeishuConfig {
  return {
    webhookUrl: process.env.FEISHU_WEBHOOK_URL || '',
    secret: process.env.FEISHU_WEBHOOK_SECRET || undefined,
  }
}

/**
 * 检查飞书是否配置
 */
export function isFeishuEnabled(): boolean {
  const config = getConfig()
  return !!config.webhookUrl
}

/**
 * 生成签名（如果配置了 secret）
 */
function generateSign(secret: string, timestamp: number): string {
  const crypto = require('crypto')
  const stringToSign = `${timestamp}\n${secret}`
  const hmac = crypto.createHmac('sha256', stringToSign)
  const sign = hmac.digest('base64')
  return sign
}

/**
 * 发送飞书消息（纯文本）
 */
export async function sendFeishuText(content: string): Promise<boolean> {
  const config = getConfig()
  if (!config.webhookUrl) {
    console.warn('[飞书] 未配置 webhook，跳过推送')
    return false
  }

  try {
    const body: any = {
      msg_type: 'text',
      content: { text: content },
    }

    if (config.secret) {
      const timestamp = Math.floor(Date.now() / 1000)
      body.timestamp = String(timestamp)
      body.sign = generateSign(config.secret, timestamp)
    }

    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json()
    if (json.code === 0) {
      console.log('[飞书] 消息推送成功')
      return true
    } else {
      console.error('[飞书] 消息推送失败:', json.msg)
      return false
    }
  } catch (error: any) {
    console.error('[飞书] 推送异常:', error.message)
    return false
  }
}

/**
 * 发送飞书消息（富文本卡片）
 */
export async function sendFeishuCard(card: any): Promise<boolean> {
  const config = getConfig()
  if (!config.webhookUrl) {
    console.warn('[飞书] 未配置 webhook，跳过推送')
    return false
  }

  try {
    const body: any = {
      msg_type: 'interactive',
      card: card,
    }

    if (config.secret) {
      const timestamp = Math.floor(Date.now() / 1000)
      body.timestamp = String(timestamp)
      body.sign = generateSign(config.secret, timestamp)
    }

    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json()
    if (json.code === 0) {
      console.log('[飞书] 卡片推送成功')
      return true
    } else {
      console.error('[飞书] 卡片推送失败:', json.msg)
      return false
    }
  } catch (error: any) {
    console.error('[飞书] 推送异常:', error.message)
    return false
  }
}

/**
 * 推送并购测评新提交通知（卡片）
 */
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
  const gradeColor: Record<string, string> = {
    'A': 'turquoise',
    'B': 'blue',
    'C': 'yellow',
    'D': 'red',
  }

  const gradeText: Record<string, string> = {
    'A': 'A级 - 具备并购评估价值',
    'B': 'B级 - 具备产业整合潜力',
    'C': 'C级 - 具备融资或合作优化空间',
    'D': 'D级 - 暂不适合直接推进并购',
  }

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: {
        tag: 'plain_text',
        content: '🔔 新的企业并购价值测评提交',
      },
      template: gradeColor[data.grade] || 'blue',
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**评级：** ${gradeText[data.grade] || data.grade}\n**得分：** ${data.score} / 75`,
        },
      },
      { tag: 'hr' },
      {
        tag: 'div',
        fields: [
          { is_short: true, text: { tag: 'lark_md', content: `**联系人：**\n${data.name}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**手机号：**\n${data.phone}` } },
          { is_short: false, text: { tag: 'lark_md', content: `**企业名称：**\n${data.companyName}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**所在城市：**\n${data.city || '-'}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**所属行业：**\n${data.industry || '-'}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**年营收：**\n${data.revenue || '-'}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**是否愿意沟通：**\n${data.willing || '-'}` } },
          { is_short: false, text: { tag: 'lark_md', content: `**核心需求：**\n${data.demand || '-'}` } },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'note',
        elements: [
          {
            tag: 'plain_text',
            content: `测评ID: ${data.id}`,
          },
        ],
      },
    ],
  }

  return sendFeishuCard(card)
}
