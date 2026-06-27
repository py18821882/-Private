// 企业微信机器人工具
// 通过 webhook 推送消息到企业微信群

export interface WecomConfig {
  webhookUrl: string
}

/**
 * 获取企业微信机器人配置
 */
function getConfig(): WecomConfig {
  return {
    webhookUrl: process.env.WECOM_WEBHOOK_URL || '',
  }
}

/**
 * 检查企业微信机器人是否配置
 */
export function isWecomEnabled(): boolean {
  const config = getConfig()
  return !!config.webhookUrl
}

/**
 * 发送企业微信消息（文本）
 */
export async function sendWecomText(content: string, mentionedList?: string[], mentionedMobileList?: string[]): Promise<boolean> {
  const config = getConfig()
  if (!config.webhookUrl) {
    console.warn('[企业微信] 未配置 webhook，跳过推送')
    return false
  }

  try {
    const body: any = {
      msgtype: 'text',
      text: {
        content,
        mentioned_list: mentionedList || [],
        mentioned_mobile_list: mentionedMobileList || [],
      },
    }

    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json()
    if (json.errcode === 0) {
      console.log('[企业微信] 消息推送成功')
      return true
    } else {
      console.error('[企业微信] 消息推送失败:', json.errmsg)
      return false
    }
  } catch (error: any) {
    console.error('[企业微信] 推送异常:', error.message)
    return false
  }
}

/**
 * 发送企业微信消息（Markdown）
 */
export async function sendWecomMarkdown(content: string): Promise<boolean> {
  const config = getConfig()
  if (!config.webhookUrl) {
    console.warn('[企业微信] 未配置 webhook，跳过推送')
    return false
  }

  try {
    const body = {
      msgtype: 'markdown',
      markdown: { content },
    }

    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json()
    if (json.errcode === 0) {
      console.log('[企业微信] Markdown 推送成功')
      return true
    } else {
      console.error('[企业微信] Markdown 推送失败:', json.errmsg)
      return false
    }
  } catch (error: any) {
    console.error('[企业微信] 推送异常:', error.message)
    return false
  }
}

/**
 * 推送并购测评新提交通知（Markdown）
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
  const gradeEmoji: Record<string, string> = {
    'A': '🟢',
    'B': '🔵',
    'C': '🟡',
    'D': '🔴',
  }

  const gradeText: Record<string, string> = {
    'A': 'A级 - 具备并购评估价值',
    'B': 'B级 - 具备产业整合潜力',
    'C': 'C级 - 具备融资或合作优化空间',
    'D': 'D级 - 暂不适合直接推进并购',
  }

  const emoji = gradeEmoji[data.grade] || '⚪'
  const gradeDesc = gradeText[data.grade] || data.grade

  const content = `${emoji} **企业并购价值测评 - 新提交**

> **评级：** ${gradeDesc}
> **得分：** ${data.score} / 75

**📋 企业信息**
> **企业名称：** <font color="info">${data.companyName}</font>
> **所属行业：** ${data.industry || '-'}
> **所在城市：** ${data.city || '-'}
> **年营收：** ${data.revenue || '-'}

**👤 联系人**
> **姓名：** ${data.name}
> **手机：** <font color="warning">${data.phone}</font>

**💼 需求信息**
> **核心需求：** ${data.demand || '-'}
> **愿意沟通：** ${data.willing || '-'}

---
测评ID：${data.id}`

  return sendWecomMarkdown(content)
}

// ══════════════════════════════════════════════════════════════════════════
// H5 展业项目 — 业务通知函数（fire-and-forget，不阻塞主流程）
// ══════════════════════════════════════════════════════════════════════════

/**
 * 格式化金额：分 → 元
 */
function formatAmount(fen: number): string {
  return '¥' + (fen / 100).toFixed(2)
}

/**
 * 格式化时间
 */
function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 获取报告查看链接
 */
function getReportUrl(reportId: string): string {
  const domain = process.env.NEXT_PUBLIC_H5_DOMAIN || 'http://localhost:3000'
  return `${domain}/report/${reportId}`
}

/**
 * 新测评提交通知（H5 展业）
 * 在 POST /api/assessments 成功后调用
 */
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
  const content = `📊 **新测评提交 - H5展业**

> **企业名称：** <font color="info">${data.companyName}</font>
> **所属行业：** ${data.industry || '-'}
> **主营业务：** ${data.mainBusiness || '-'}
> **营收规模：** ${data.revenue || '-'}
> **利润情况：** ${data.profit || '-'}
> **员工人数：** ${data.employeeCount || '-'}
> **提交时间：** ${formatTime(data.createdAt)}

**👤 联系人**
> **姓名：** ${data.contactName || '-'}
> **手机：** <font color="warning">${data.contactPhone || '-'}</font>

**🎯 老板目标：** ${data.bossGoal || '-'}

---
测评ID：${data.id}`

  return sendWecomMarkdown(content)
}

/**
 * 报告生成完成通知
 * 在 generateReport 成功后调用
 */
export async function notifyReportComplete(data: {
  id: string
  reportId: string
  companyName: string
  score: number
  grade: string
}): Promise<boolean> {
  const gradeColors: Record<string, string> = {
    'A': 'info',
    'B': 'comment',
    'C': 'warning',
    'D': 'warning',
  }

  const gradeColor = gradeColors[data.grade] || 'comment'

  const content = `✅ **报告生成完成**

> **企业名称：** <font color="info">${data.companyName}</font>
> **评分：** ${data.score} 分
> **评级：** <font color="${gradeColor}">${data.grade} 级</font>

📄 [查看报告](${getReportUrl(data.reportId)})

---
测评ID：${data.id}`

  return sendWecomMarkdown(content)
}

/**
 * 报告生成失败告警
 * 在 generateReport catch 中调用
 */
export async function notifyReportFailed(data: {
  id: string
  companyName: string
  error: string
}): Promise<boolean> {
  const content = `❌ **报告生成失败**

> **企业名称：** <font color="warning">${data.companyName}</font>
> **错误信息：** ${data.error}

---
测评ID：${data.id}`

  return sendWecomMarkdown(content)
}

/**
 * 支付成功通知
 * 在 handlePaymentSuccess 后调用
 */
export async function notifyPaymentSuccess(data: {
  orderNo: string
  companyName: string
  amount: number
  payMethod: string
  payTime: Date
  reportId: string
}): Promise<boolean> {
  const payMethodText: Record<string, string> = {
    'wechat': '微信支付',
    'alipay': '支付宝',
  }

  const content = `💰 **支付到账通知**

> **企业名称：** <font color="info">${data.companyName}</font>
> **订单号：** ${data.orderNo}
> **金额：** <font color="warning">${formatAmount(data.amount)}</font>
> **支付方式：** ${payMethodText[data.payMethod] || data.payMethod}
> **支付时间：** ${formatTime(data.payTime)}

📄 [查看报告](${getReportUrl(data.reportId)})`

  return sendWecomMarkdown(content)
}

/**
 * fire-and-forget 包装：通知发送失败不影响主流程
 */
export function fireNotification(promise: Promise<boolean>): void {
  promise.catch((err) => {
    console.error('[企业微信] 通知发送异常（已忽略）:', err.message || err)
  })
}
