export interface GLMTagSuggestion {
  name: string
  confidence: number
  reason?: string
}

export interface GLMResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class GLMApiService {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor() {
    this.apiKey = import.meta.env.VITE_GLM_API_KEY
    this.baseUrl = import.meta.env.VITE_GLM_BASE_URL
    this.model = import.meta.env.VITE_GLM_MODEL

    if (!this.apiKey) {
      throw new Error('GLM API key is not configured')
    }
  }

  async generateTags(content: {
    title: string
    description: string
    content?: string
  }): Promise<GLMTagSuggestion[]> {
    const prompt = this.buildTagGenerationPrompt(content)

    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GLM API error response:', errorText)
        throw new Error(`GLM API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as unknown
      // GLM API 可能返回不同的响应结构，尝试多种方式获取内容
      let content = ''
      if (data && typeof data === 'object' && 'choices' in data) {
        const responseData = data as {
          choices: Array<{
            message?: { content?: string; reasoning_content?: string; delta?: { content?: string } }
          }>
        }
        if (responseData.choices && responseData.choices[0]) {
          const choice = responseData.choices[0]

          // 优先使用 content，如果被截断则尝试 reasoning_content
          const mainContent = choice.message?.content || ''
          const reasoningContent = choice.message?.reasoning_content || ''

          // 如果 mainContent 看起来被截断（包含不完整的 JSON），尝试从 reasoning_content 中提取
          if (mainContent.length > 0 && reasoningContent.length > 0) {
            // 尝试从 reasoning_content 中提取完整的 JSON
            // 查找完整的 JSON 数组，包含换行符和各种字符
            const jsonMatch = reasoningContent.match(/\[[\s\S\[\]{}"':,.\-\w]*\]/)
            if (jsonMatch) {
              content = jsonMatch[0]
            } else {
              // 尝试更宽松的匹配
              const looseMatch = reasoningContent.match(/\[.*?\]/s)
              if (looseMatch) {
                content = looseMatch[0]
              } else {
                // 如果 reasoning_content 中没有 JSON，检查 mainContent 是否完整
                try {
                  JSON.parse(mainContent)
                  content = mainContent
                } catch {
                  // mainContent 也不完整，优先尝试修复 mainContent，然后 reasoning_content
                  const fixedMain = this.attemptJsonFix(mainContent)
                  if (fixedMain) {
                    content = fixedMain
                  } else {
                    content = mainContent
                  }
                }
              }
            }
          } else if (mainContent) {
            content = mainContent
          } else if (reasoningContent) {
            content = reasoningContent
          } else {
            content = choice.message?.delta?.content || ''
          }
        }
      }

      console.log('GLM API raw response:', data)
      console.log('Extracted content:', content)

      // 清理响应内容，移除可能的 markdown 代码块标记
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '')
      }

      // 解析 JSON 响应
      try {
        const parsed = JSON.parse(cleanContent)
        // 确保返回的是数组
        if (Array.isArray(parsed)) {
          return parsed as GLMTagSuggestion[]
        } else if (parsed && typeof parsed === 'object') {
          // 如果返回的是对象，尝试找到数组属性
          const parsedObj = parsed as Record<string, unknown>
          const arrayKeys = Object.keys(parsedObj).filter((key) => {
            const value = parsedObj[key as keyof typeof parsedObj]
            return Array.isArray(value)
          })
          if (arrayKeys.length > 0) {
            return parsedObj[arrayKeys[0] as keyof typeof parsedObj] as GLMTagSuggestion[]
          }
        }
        throw new Error('Response is not an array')
      } catch (error) {
        console.error('Failed to parse GLM response:', cleanContent, error)

        // 尝试修复不完整的 JSON
        const fixedContent = this.attemptJsonFix(cleanContent)
        if (fixedContent) {
          try {
            const parsed = JSON.parse(fixedContent)
            if (Array.isArray(parsed)) {
              return parsed as GLMTagSuggestion[]
            }
          } catch (fixError) {
            console.error('Failed to parse fixed JSON:', fixedContent, fixError)
          }
        }

        // 如果解析失败，尝试提取标签名称
        return this.extractTagsFromText(content)
      }
    } catch (error) {
      console.error('GLM API call failed:', error)
      if (error instanceof Error) {
        throw new Error(`AI 标签生成失败: ${error.message}`)
      }
      throw new Error('AI 标签生成失败，请稍后重试')
    }
  }

  private buildTagGenerationPrompt(content: {
    title: string
    description: string
    content?: string
  }): string {
    return `
Based on: ${content.title} - ${content.description} ${content.content || ''}

Generate 5-8 tech stack tags (2-10 chars each).

Return ONLY JSON array:
[
  {"name": "tag", "confidence": 0.9, "reason": "reason"}
]

No other text.
    `.trim()
  }

  private attemptJsonFix(content: string): string | null {
    // 尝试修复常见的 JSON 截断问题
    const trimmed = content.trim()

    // 如果以数组开始但没有正确结束，尝试补全
    if (trimmed.startsWith('[') && !trimmed.endsWith(']')) {
      // 查找最后一个完整的对象
      let lastCompleteObject = -1
      let braceCount = 0
      let inString = false
      let stringChar = ''
      let escapeNext = false

      for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i]

        if (escapeNext) {
          escapeNext = false
          continue
        }

        if (char === '\\') {
          escapeNext = true
          continue
        }

        if (inString) {
          if (char === stringChar) {
            inString = false
            stringChar = ''
          }
        } else if (char === '"' || char === "'") {
          inString = true
          stringChar = char
        } else if (char === '{') {
          braceCount++
        } else if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            lastCompleteObject = i
          }
        }
      }

      if (lastCompleteObject > 0) {
        const partialArray = trimmed.substring(0, lastCompleteObject + 1) + ']'
        try {
          JSON.parse(partialArray)
          return partialArray
        } catch {
          // 如果还是失败，尝试移除最后一个不完整的对象
          const beforeLastObject = trimmed.lastIndexOf(',', lastCompleteObject)
          if (beforeLastObject > 0) {
            return trimmed.substring(0, beforeLastObject) + ']'
          }
        }
      }
    }

    // 尝试修复未闭合的字符串
    let fixed = trimmed
    let inString = false
    let stringChar = ''
    let escapeNext = false

    for (let i = 0; i < fixed.length; i++) {
      const char = fixed[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (inString) {
        if (char === stringChar) {
          inString = false
          stringChar = ''
        }
      } else if (char === '"' || char === "'") {
        inString = true
        stringChar = char
      }
    }

    // 如果字符串未闭合，添加闭合引号
    if (inString && stringChar) {
      fixed += stringChar
    }

    // 如果数组未闭合，添加闭合括号
    if (fixed.startsWith('[') && !fixed.endsWith(']')) {
      fixed += ']'
    }

    // 验证修复后的 JSON 是否有效
    try {
      JSON.parse(fixed)
      return fixed
    } catch {
      return null
    }
  }

  private extractTagsFromText(text: string): GLMTagSuggestion[] {
    // 如果 JSON 解析失败，尝试从文本中提取标签
    const tags: GLMTagSuggestion[] = []

    // 首先尝试匹配不完整的 JSON 对象格式
    const jsonObjects = text.match(/\{[^}]*"name"[^}]*\}/g)
    if (jsonObjects) {
      for (const objStr of jsonObjects) {
        try {
          // 尝试补全对象
          let fixedObj = objStr
          if (!fixedObj.endsWith('}')) {
            fixedObj += '}'
          }

          const nameMatch = fixedObj.match(/"name"\s*:\s*"([^"]+)"/)
          const confidenceMatch = fixedObj.match(/"confidence"\s*:\s*([\d.]+)/)
          const reasonMatch = fixedObj.match(/"reason"\s*:\s*"([^"]*)"/)

          if (nameMatch && nameMatch[1]) {
            const name = nameMatch[1].trim()
            if (
              name &&
              name.length >= 2 &&
              name.length <= 10 &&
              !tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
            ) {
              tags.push({
                name,
                confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7,
                reason: reasonMatch ? reasonMatch[1] : '从响应文本中提取',
              })
            }
          }
        } catch {
          // 忽略解析错误，继续尝试其他方法
        }
      }
    }

    // 如果没有找到 JSON 对象，尝试其他格式
    if (tags.length === 0) {
      const patterns = [
        // 匹配 "1. Vue3 - 核心前端框架" 格式
        /^\d+\.\s*([^\s-]+)\s*[-–]\s*(.+?)(?=\n|$)/gm,
        // 匹配 "Vue3 (置信度: 0.9)" 格式
        /([^\s()]+)\s*\(置信度[:：]\s*([\d.]+)\)/g,
        // 匹配加粗的标签 **Vue3**
        /\*\*([^\*]+)\*\*/g,
        // 匹配引号中的标签 "Vue3"
        /["']([^"']+)["']/g,
        // 匹配单独的技术词汇
        /\b(Vue3|Vue|React|Angular|TS|TypeScript|JavaScript|Node\.js|Python|Java|全栈|前端|后端|响应式|作品集|极客风|Supabase|Pinia|Element Plus|Vite|SCSS|CSS|ECharts|Markdown|MinIO|PostgreSQL|API|REST|GraphQL)\b/gi,
      ]

      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(text)) !== null) {
          const name = match[1]?.trim()
          const reason = match[2]?.trim()

          if (
            name &&
            name.length >= 2 &&
            name.length <= 10 &&
            !tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
          ) {
            tags.push({
              name,
              confidence: 0.7,
              reason: reason || '从响应文本中提取',
            })

            if (tags.length >= 8) break
          }
        }
        if (tags.length >= 8) break
      }
    }

    // 如果没有找到任何标签，返回一些默认的技术标签
    if (tags.length === 0) {
      const defaultTags = ['Vue3', 'TypeScript', '全栈', '响应式', '作品集']
      defaultTags.forEach((name) => {
        tags.push({
          name,
          confidence: 0.6,
          reason: '默认推荐标签',
        })
      })
    }

    return tags.slice(0, 8).map((tag, index) => ({
      ...tag,
      confidence: Math.max(0.5, tag.confidence - index * 0.05), // 递减的置信度
    }))
  }

  // 检查 API 配置是否有效
  isConfigured(): boolean {
    return !!(this.apiKey && this.baseUrl && this.model)
  }

  // 获取配置信息（用于调试）
  getConfig(): { hasKey: boolean; baseUrl: string; model: string } {
    return {
      hasKey: !!this.apiKey,
      baseUrl: this.baseUrl,
      model: this.model,
    }
  }
}

// 创建单例实例
export const glmApiService = new GLMApiService()
