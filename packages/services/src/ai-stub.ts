import type { AiDriver, AiReply, AiChatRequest } from './ai'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * A deterministic stand-in for Claude. No key, no cost, no network — and,
 * because it is deterministic, something a test can assert against.
 *
 * How it behaves:
 *   - If the last user message mentions a keyword that maps to an available
 *     tool, it returns a tool call for that tool.
 *   - If the request carries tool results, it "answers" by summarising them.
 *   - Otherwise it echoes a canned reply.
 *
 * Team 13: this is enough to build and test the full tool-use loop — request →
 * tool call → execute → result → answer — before touching the real API.
 */

const KEYWORD_TO_TOOL: { pattern: RegExp; tool: string }[] = [
  { pattern: /attendance|absent|present|percentage/i, tool: 'get_my_attendance' },
  { pattern: /assignment|due|submit|deadline/i, tool: 'list_upcoming_assignments' },
  { pattern: /slide|material|notes|deck|ppt/i, tool: 'search_materials' },
  { pattern: /timetable|schedule|class|today/i, tool: 'get_timetable' },
]

export function createStubAi(): AiDriver {
  return {
    name: 'stub',

    async chat({ messages, tools = [], toolResults = [] }: AiChatRequest): Promise<AiReply> {
      const usage = { inputTokens: 0, outputTokens: 0 }

      // Second leg of the loop: tool results came back, so answer from them.
      if (toolResults.length > 0) {
        const body = toolResults.map((r) => r.content).join('\n')
        return {
          text: `[stub] Based on the data I looked up:\n${body}`,
          toolCalls: [],
          stopReason: 'end_turn',
          usage,
        }
      }

      const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
      const available = new Set(tools.map((t) => t.name))
      const match = KEYWORD_TO_TOOL.find(
        ({ pattern, tool }) => pattern.test(lastUser) && available.has(tool),
      )

      if (match) {
        return {
          text: '',
          toolCalls: [{ id: `stub_tool_1`, name: match.tool, input: {} }],
          stopReason: 'tool_use',
          usage,
        }
      }

      return {
        text:
          '[stub] I can answer questions about your attendance, assignments, materials ' +
          'and timetable. Set AI_DRIVER=anthropic for real answers.',
        toolCalls: [],
        stopReason: 'end_turn',
        usage,
      }
    },
  }
}
