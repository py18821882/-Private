// AI 服务封装
// 支持 OpenAI 兼容接口（DeepSeek、OpenAI、Kimi 等）
// 所有 API 调用走后端，API Key 不暴露前端

import { AI_CONFIG } from '../config'

// AI 消息类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// AI 响应
export interface ChatResponse {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * 调用 AI 聊天接口
 * @param messages 消息列表
 * @param model 模型名称（不传用默认）
 * @param temperature 温度
 * @returns AI 响应
 */
export async function chatCompletion(
  messages: ChatMessage[],
  model?: string,
  temperature: number = 0.7
): Promise<ChatResponse> {
  const { baseUrl, apiKey, defaultModel, maxRetries, timeout } = AI_CONFIG
  const useModel = model || defaultModel

  if (!apiKey) {
    throw new Error('AI API Key 未配置，请在环境变量中设置 OPENAI_API_KEY')
  }

  let lastError: Error | null = null

  // 重试机制
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: useModel,
          messages,
          temperature,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AI API 调用失败: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      return {
        content: data.choices?.[0]?.message?.content || '',
        model: data.model || useModel,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      }
    } catch (error: any) {
      lastError = error
      console.error(`AI 调用第 ${attempt + 1} 次失败:`, error.message)

      if (attempt < maxRetries) {
        // 指数退避
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('AI 调用失败')
}

/**
 * 生成企业测评分析
 * @param assessmentData 企业测评数据
 * @returns 分析结果（JSON 格式字符串）
 */
export async function analyzeEnterprise(assessmentData: {
  companyName: string
  industry: string
  mainBusiness: string
  revenue: string
  profit: string
  employeeCount: string
  bossGoal: string
}): Promise<ChatResponse> {
  const systemPrompt = `你是一位资深的企业咨询顾问和并购专家，擅长企业诊断和增长分析。
请根据企业提供的信息，进行全面的分析和评估。

输出要求：
1. 请严格以 JSON 格式返回，不要有其他多余文字
2. JSON 包含以下字段：
   - companyInfo: 企业情况概述（500字以内）
   - problemAnalysis: 问题分析数组，每个问题包含 title(标题)、description(描述)、severity(严重程度 high/medium/low)
   - advantages: 优势数组，每个优势包含 title(标题)、description(描述)
   - risks: 风险提示数组，每个风险包含 title(标题)、description(描述)、level(风险等级 high/medium/low)
   - suggestions: 发展建议数组，每条建议包含 title(标题)、description(描述)、priority(优先级 high/medium/low)
   - summary: AI 总结（300字以内，提炼核心观点）
   - score: 综合评分（0-100 分）
   - grade: 评级（A/B/C/D/E）

3. 分析要专业、客观、有深度，结合行业特点
4. 问题和建议要具体、可落地，不要空泛
5. 注意语气，既要指出问题，也要给予信心`

  const userPrompt = `企业信息如下：
企业名称：${assessmentData.companyName}
所属行业：${assessmentData.industry}
主营业务：${assessmentData.mainBusiness}
营收规模：${assessmentData.revenue}
利润情况：${assessmentData.profit}
员工人数：${assessmentData.employeeCount}
老板目标：${assessmentData.bossGoal}

请基于以上信息，对这家企业进行全面分析。`

  return chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    AI_CONFIG.analyzeModel,
    0.8
  )
}

// 尝试从 AI 响应中提取 JSON
export function extractJsonFromText(text: string): any | null {
  // 直接尝试解析
  try {
    return JSON.parse(text)
  } catch {}

  // 尝试提取 ```json ... ``` 包裹的内容
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {}
  }

  // 尝试提取第一个 { 到最后一个 } 之间的内容
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1))
    } catch {}
  }

  return null
}
