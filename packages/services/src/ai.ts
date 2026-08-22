/**
 * LOCKED FILE — Team 01 (Core Platform), with Team 13 as the primary consumer.
 *
 * The AI seam, with two drivers:
 *
 *   AI_DRIVER=stub        deterministic canned responses and tool calls. The
 *                         default. Team 13 can build and test the whole
 *                         tool-calling loop without an API key or a bill.
 *   AI_DRIVER=anthropic    real Claude calls. Deployed environments only.
 *
 * The stub is not a consolation prize — it is *better* than a real key for
 * developing the loop, because a deterministic tool call is something a test
 * can assert on.
 */

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * A tool the assistant may call.
 *
 * Team 13: no tool schema may contain a `studentId` — the caller's id is bound
 * by the request handler, never chosen by the model. See the charter on #79.
 */
export interface AiTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface AiToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface AiReply {
  /** Assistant text. Empty when the model only asked for tools. */
  text: string
  toolCalls: AiToolCall[]
  stopReason: string | null
  usage: { inputTokens: number; outputTokens: number }
}

export interface AiChatRequest {
  system: string
  messages: AiMessage[]
  tools?: AiTool[]
  /** Results of tool calls from the previous turn, keyed by tool-call id. */
  toolResults?: { id: string; content: string; isError?: boolean }[]
  maxTokens?: number
}

export interface AiDriver {
  readonly name: 'stub' | 'anthropic'
  chat(request: AiChatRequest): Promise<AiReply>
}

let cached: AiDriver | null = null

export function getAi(): AiDriver {
  if (cached) return cached

  const driver = process.env.AI_DRIVER || 'stub'

  if (driver === 'anthropic') {
    const { createAnthropicAi } = require('./ai-anthropic') as typeof import('./ai-anthropic')
    cached = createAnthropicAi()
  } else if (driver === 'stub') {
    const { createStubAi } = require('./ai-stub') as typeof import('./ai-stub')
    cached = createStubAi()
  } else {
    throw new Error(`Unknown AI_DRIVER "${driver}" — expected "stub" or "anthropic".`)
  }

  return cached
}

export function resetAi() {
  cached = null
}
