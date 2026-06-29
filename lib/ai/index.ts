// AI 鏈嶅姟灏佽
// 鏀寔 OpenAI 鍏煎鎺ュ彛锛圖eepSeek銆丱penAI銆並imi 绛夛級
// 鎵€鏈?API 璋冪敤璧板悗绔紝API Key 涓嶆毚闇插墠绔?
import { AI_CONFIG } from '../config'
import { execFileSync, spawnSync } from 'child_process'
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'

// AI 娑堟伅绫诲瀷
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// AI 鍝嶅簲
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
 * 閫氳繃 curl 璋冪敤 AI API锛堟敮鎸佷唬鐞嗭級
 * 褰?HTTPS_PROXY / HTTP_PROXY 鐜鍙橀噺璁剧疆鏃惰嚜鍔ㄨ蛋浠ｇ悊
 */
function chatCompletionWithCurl(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  apiKey: string,
  baseUrl: string,
  timeoutMs: number
): ChatResponse {
  const url = `${baseUrl}/chat/completions`
  const body = JSON.stringify({ model, messages, temperature })
  const timeoutSec = Math.ceil(timeoutMs / 1000)

  // 灏嗚姹備綋鍐欏叆涓存椂鏂囦欢锛岄伩鍏嶅懡浠よ浼犲弬瀵艰嚧 Unicode 缂栫爜闂
  let tmpFile: string | null = null
  try {
    const tmpDir = mkdtempSync(`${tmpdir()}\\h5-ai-`)
    tmpFile = `${tmpDir}\\body.json`
    writeFileSync(tmpFile, body, 'utf-8')

    // 鏋勫缓 curl 鍙傛暟锛堜娇鐢?@鏂囦欢鍚?璇诲彇璇锋眰浣擄級
    const args = [
      '--silent',
      '--show-error',
      '--max-time', String(timeoutSec),
      '--write-out', '\n%{http_code}',
      '-X', 'POST',
      '-H', 'Content-Type: application/json; charset=utf-8',
      '-H', `Authorization: Bearer ${apiKey}`,
      `--data-binary`, `@${tmpFile}`,
    ]

    // 鍔犲叆浠ｇ悊閰嶇疆
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || ''
    if (proxy) {
      args.push('--proxy', proxy)
    }

    args.push(url)

    const result = spawnSync('curl', args, {
      encoding: 'buffer' as any,
      maxBuffer: 10 * 1024 * 1024,
      timeout: timeoutMs + 10000,
    })

    // 娓呯悊涓存椂鏂囦欢锛堟棤璁烘垚鍔熷け璐ラ兘娓呯悊锛?    try { unlinkSync(tmpFile) } catch {}
    try { unlinkSync(tmpDir) } catch {}

    if (result.error) {
      throw new Error(`curl 鎵ц澶辫触: ${result.error.message}`)
    }

    const stdout = Buffer.isBuffer(result.stdout)
      ? result.stdout.toString('utf-8')
      : String(result.stdout || '')
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString('utf-8')
      : String(result.stderr || '')

    if (!stdout && stderr) {
      throw new Error(`curl 閿欒: ${stderr}`)
    }

    // 瑙ｆ瀽鐘舵€佺爜锛坈url --write-out 杩藉姞鍦ㄦ渶鍚庯級
    const lastNl = stdout.lastIndexOf('\n')
    if (lastNl === -1) {
      throw new Error(`curl 杩斿洖鏍煎紡寮傚父锛屾棤娉曡В鏋愮姸鎬佺爜`)
    }

    const statusCode = parseInt(stdout.substring(lastNl + 1).trim(), 10)
    const responseBody = stdout.substring(0, lastNl)

    if (isNaN(statusCode) || statusCode < 200 || statusCode >= 300) {
      throw new Error(`AI API 璋冪敤澶辫触: ${statusCode} ${responseBody.substring(0, 500)}`)
    }

    const data = JSON.parse(responseBody)

    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    }
  } catch (cleanupErr) {
    // 纭繚涓存椂鏂囦欢琚竻鐞?    try { if (tmpFile) unlinkSync(tmpFile) } catch {}
    throw cleanupErr
  }
}

/**
 * 璋冪敤 AI 鑱婂ぉ鎺ュ彛
 * @param messages 娑堟伅鍒楄〃
 * @param model 妯″瀷鍚嶇О锛堜笉浼犵敤榛樿锛? * @param temperature 娓╁害
 * @returns AI 鍝嶅簲
 */
export async function chatCompletion(
  messages: ChatMessage[],
  model?: string,
  temperature: number = 0.7
): Promise<ChatResponse> {
  const { baseUrl, apiKey, defaultModel, maxRetries, timeout } = AI_CONFIG
  const useModel = model || defaultModel

  if (!apiKey) {
    throw new Error('AI API Key 鏈厤缃紝璇峰湪鐜鍙橀噺涓缃?OPENAI_API_KEY')
  }

  // 鍒ゆ柇鏄惁闇€瑕侀€氳繃浠ｇ悊璋冪敤
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  const useCurl = !!proxy

  let lastError: Error | null = null

  // 閲嶈瘯鏈哄埗
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (useCurl) {
        return chatCompletionWithCurl(
          messages, useModel, temperature, apiKey, baseUrl, timeout
        )
      }

      // 鏃犱唬鐞嗭紝浣跨敤鍘熺敓 fetch
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
        throw new Error(`AI API 璋冪敤澶辫触: ${response.status} ${errorText}`)
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
      console.error(`AI 璋冪敤绗?${attempt + 1} 娆″け璐?`, error.message)

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('AI 璋冪敤澶辫触')
}

/**
 * 鐢熸垚浼佷笟娴嬭瘎鍒嗘瀽
 * @param assessmentData 浼佷笟娴嬭瘎鏁版嵁
 * @returns 鍒嗘瀽缁撴灉锛圝SON 鏍煎紡瀛楃涓诧級
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
  const systemPrompt = `你是中科商业咨询企业资本合作评估顾问，熟悉上市公司并购、股权出售、企业融资、国资合作、产业整合和并购基金对接。
请基于客户提交的信息，做一份企业资本合作初步评估报告。

输出要求：
1. 严格以 JSON 格式返回，不要有任何多余文字。
2. JSON 包含以下字段：
   - companyInfo: 项目基本情况概述，说明企业/项目类型、主营业务、规模和诉求。
   - problemAnalysis: 评估关注点数组，每项包含 title、description、severity(high/medium/low)。
   - advantages: 项目潜在价值数组，每项包含 title、description。
   - risks: 对接风险数组，每项包含 title、description、level(high/medium/low)。
   - suggestions: 后续推进建议数组，每项包含 title、description、priority(high/medium/low)。
   - summary: 150字以内内部结论，判断是否建议进入后续一对一沟通。
   - score: 资本合作匹配度评分，0-100。
   - grade: 评估等级，A/B/C/D/E。
3. 重点从上市公司并购关注点判断：利润质量、客户资源、资质牌照、区域布局、团队稳定性、资产清晰度、股权意愿、融资/出售可行性。
4. 不要承诺一定融资、一定收购、一定对接成功；只给内部筛选判断。`

  const userPrompt = `项目提交信息如下：
企业/项目名称：${assessmentData.companyName}
项目类型：${assessmentData.industry}
主营业务/项目亮点：${assessmentData.mainBusiness}
年营收规模：${assessmentData.revenue}
利润情况：${assessmentData.profit}
团队/员工规模：${assessmentData.employeeCount}
提交诉求：${assessmentData.bossGoal}

请基于以上信息，输出中科商业咨询企业资本合作初步评估报告。`

  return chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    AI_CONFIG.analyzeModel,
    0.6
  )
}
// 灏濊瘯浠?AI 鍝嶅簲涓彁鍙?JSON
export function extractJsonFromText(text: string): any | null {
  // 鐩存帴灏濊瘯瑙ｆ瀽
  try {
    return JSON.parse(text)
  } catch {}

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {}
  }

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1))
    } catch {}
  }

  return null
}


