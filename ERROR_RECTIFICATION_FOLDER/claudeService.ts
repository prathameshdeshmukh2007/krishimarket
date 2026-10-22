// ====================================================================
// KRISHIMARKET: CLAUDE (ANTHROPIC) AI SERVICE
// ====================================================================
// Integrates Anthropic's Claude API as a third AI provider alongside
// Google Gemini and OpenAI.
//
// IMPORTANT — CORS NOTICE:
// Anthropic's API does NOT allow direct browser-to-API calls.
// This service routes through one of:
//   1. A Cloudflare Worker proxy  (VITE_CLAUDE_PROXY_URL in .env)
//   2. A local Vite dev proxy     (/api/claude — see vite.config.ts)
//   3. Graceful fallback to the offline agronomist engine
//
// HOW TO SET UP THE CLOUDFLARE WORKER PROXY (Free):
//   1. Sign up at cloudflare.com
//   2. Workers & Pages → Create Worker → paste proxy code from README
//   3. Set VITE_CLAUDE_PROXY_URL=https://your-worker.workers.dev in .env
// ====================================================================

export type ClaudeModel =
  | 'claude-3-5-haiku-20241022'   // Fast & cheap – ideal for agri Q&A
  | 'claude-3-5-sonnet-20241022'  // Balanced quality + speed
  | 'claude-opus-4-5'             // Maximum quality
  | 'claude-sonnet-4-5';          // Latest generation

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  answerText: string;
  providerUsed: 'live_claude';
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  actionSuggestion?: string;
}

export type ClaudeErrorCode =
  | 'NO_API_KEY'
  | 'NO_PROXY'
  | 'NETWORK_ERROR'
  | 'INVALID_KEY'
  | 'RATE_LIMIT'
  | 'OVERLOADED'
  | 'EMPTY_RESPONSE'
  | 'api_error';

export class ClaudeApiError extends Error {
  public readonly code: ClaudeErrorCode;
  constructor(code: ClaudeErrorCode, message: string) {
    super(message);
    this.name = 'ClaudeApiError';
    this.code = code;
  }
}

type LanguageCode = 'en' | 'hi' | 'mr';

// ====================================================================
// Agronomist System Prompt
// ====================================================================
const KRISHIMARKET_SYSTEM_PROMPT = `You are KrishiMarket AI, an expert Indian agricultural scientist, agronomist, and market intelligence specialist created for farmers and agricultural merchants in India.

Key Guidelines:
1. Language Fluency:
   - Respond in the language of the user's question (Marathi मराठी, Hindi हिन्दी, or English).
   - Use natural agricultural terminology.
2. Practical & Actionable:
   - Give specific dosages per 15-litre knapsack spray pump AND per acre.
   - Mention both chemical treatments and organic/biological alternatives (Neem oil, Trichoderma, Pseudomonas, Dashparni ark).
3. Comprehensive Domain:
   - Answer ANY agricultural question: crop diseases, pest diagnosis, fertigation schedules (19:19:19, 0:52:34, Urea), soil health, weather adaptations, market trends, APMC mandi rates, export quality (e.g. 45-55mm Nashik onion for UAE/Dubai), and post-harvest storage.
4. Tone:
   - Respectful, encouraging, concise, structured with bullet points.
5. Market Intelligence:
   - When referencing prices, clarify they are based on APMC published data.
   - For export queries, reference Nhava Sheva (JNPT) FOB benchmarks and Jebel Ali (Dubai) CIF references.`;

// ====================================================================
// ClaudeService Singleton
// ====================================================================
export class ClaudeService {
  private static instance: ClaudeService;

  private readonly DEFAULT_MODEL: ClaudeModel = 'claude-3-5-haiku-20241022';
  private readonly MAX_TOKENS = 1024;
  private readonly TEMPERATURE = 0.3;

  private constructor() {}

  public static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService();
    }
    return ClaudeService.instance;
  }

  /** Check if a Claude API key is configured */
  public hasApiKey(): boolean {
    return Boolean(this.getApiKey());
  }

  /** Get the configured Claude API key from localStorage or env */
  public getApiKey(): string {
    try {
      const stored = localStorage.getItem('km_claude_api_key_v1');
      if (stored && stored.trim().startsWith('sk-ant-')) {
        return stored.trim();
      }
    } catch (_) {}

    const envKey = (import.meta as any)?.env?.VITE_CLAUDE_API_KEY || '';
    return envKey.trim();
  }

  /** Save a Claude API key to localStorage for UI-entered keys */
  public setApiKey(key: string): void {
    try {
      const trimmed = key.trim();
      if (trimmed) {
        localStorage.setItem('km_claude_api_key_v1', trimmed);
      } else {
        localStorage.removeItem('km_claude_api_key_v1');
      }
    } catch (_) {}
  }

  /** Detect which proxy endpoint to use */
  public getProxyUrl(): string | null {
    const envProxy = (import.meta as any)?.env?.VITE_CLAUDE_PROXY_URL || '';
    if (envProxy && envProxy.trim().startsWith('http')) {
      return envProxy.trim();
    }
    // Local Vite dev proxy (configure in vite.config.ts — see bottom of this file)
    if ((import.meta as any)?.env?.DEV) {
      return '/api/claude';
    }
    return null;
  }

  /** Main entry point: ask Claude a question */
  public async askClaude(
    userQuestion: string,
    language: LanguageCode = 'en',
    conversationHistory: ClaudeMessage[] = [],
    model: ClaudeModel = this.DEFAULT_MODEL
  ): Promise<ClaudeResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ClaudeApiError(
        'NO_API_KEY',
        'No Claude API key configured. Add VITE_CLAUDE_API_KEY to .env or enter it in the AI settings UI.'
      );
    }

    const proxyUrl = this.getProxyUrl();
    if (!proxyUrl) {
      throw new ClaudeApiError(
        'NO_PROXY',
        'Anthropic API requires a server-side proxy due to browser CORS restrictions. ' +
        'Set VITE_CLAUDE_PROXY_URL in .env (Cloudflare Worker) or add a Vite proxy for /api/claude.'
      );
    }

    return this._callClaudeViaProxy(userQuestion, language, conversationHistory, model, apiKey, proxyUrl);
  }

  private _buildMessages(
    userQuestion: string,
    language: LanguageCode,
    history: ClaudeMessage[]
  ): ClaudeMessage[] {
    const langInstruction =
      language === 'mr'
        ? 'Language preference: Respond fluently in Marathi (मराठी).'
        : language === 'hi'
        ? 'Language preference: Respond fluently in Hindi (हिन्दी).'
        : 'Language preference: Respond in clear English.';

    // Keep last 6 turns for context efficiency
    const recentHistory = history.slice(-6);

    return [
      ...recentHistory,
      {
        role: 'user',
        content: `${langInstruction}\n\nFarmer Question: ${userQuestion}`
      }
    ];
  }

  private async _callClaudeViaProxy(
    userQuestion: string,
    language: LanguageCode,
    history: ClaudeMessage[],
    model: ClaudeModel,
    apiKey: string,
    proxyUrl: string
  ): Promise<ClaudeResponse> {
    const messages = this._buildMessages(userQuestion, language, history);

    let response: Response;
    try {
      response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Our proxy reads this header and forwards it as x-api-key to Anthropic
          'X-Claude-Api-Key': apiKey,
          'X-Anthropic-Version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: this.MAX_TOKENS,
          temperature: this.TEMPERATURE,
          system: KRISHIMARKET_SYSTEM_PROMPT,
          messages
        })
      });
    } catch (networkError: any) {
      throw new ClaudeApiError(
        'NETWORK_ERROR',
        `Network error reaching Claude proxy at ${proxyUrl}: ${networkError.message}`
      );
    }

    if (!response.ok) {
      let errorData: any = {};
      try { errorData = await response.json(); } catch (_) {}

      const errorMsg = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        throw new ClaudeApiError('INVALID_KEY', `Invalid Claude API key: ${errorMsg}`);
      } else if (response.status === 429) {
        throw new ClaudeApiError('RATE_LIMIT', `Claude API rate limit exceeded: ${errorMsg}`);
      } else if (response.status === 529 || response.status === 503) {
        throw new ClaudeApiError('OVERLOADED', `Claude API overloaded: ${errorMsg}`);
      } else {
        throw new ClaudeApiError('api_error', errorMsg);
      }
    }

    const data = await response.json();

    const contentBlock = data?.content?.[0];
    if (!contentBlock || contentBlock.type !== 'text') {
      throw new ClaudeApiError('EMPTY_RESPONSE', 'Claude returned an unexpected empty response.');
    }

    return {
      answerText: contentBlock.text.trim(),
      providerUsed: 'live_claude',
      model: data.model || model,
      inputTokens: data?.usage?.input_tokens,
      outputTokens: data?.usage?.output_tokens,
      actionSuggestion: this._detectActionSuggestion(userQuestion)
    };
  }

  private _detectActionSuggestion(query: string): string | undefined {
    const q = query.toLowerCase();
    if (q.includes('rate') || q.includes('bhav') || q.includes('भाव') || q.includes('price') || q.includes('mandi')) return 'market_prices';
    if (q.includes('export') || q.includes('uae') || q.includes('dubai') || q.includes('निर्यात') || q.includes('fob')) return 'global_trade';
    if (q.includes('sell') || q.includes('store') || q.includes('साठवण') || q.includes('विक्री')) return 'sell_store';
    if (q.includes('money') || q.includes('profit') || q.includes('खर्च') || q.includes('नफा')) return 'farm_money';
    if (q.includes('disease') || q.includes('pest') || q.includes('spray') || q.includes('रोग') || q.includes('कीड')) return 'ask_ai';
    return undefined;
  }
}

// ====================================================================
// Singleton export — import { claudeService } from './claudeService'
// ====================================================================
export const claudeService = ClaudeService.getInstance();

// ====================================================================
// VITE DEV PROXY CONFIG (add to vite.config.ts for local development)
// ====================================================================
//
//  import { defineConfig } from 'vite';
//  import react from '@vitejs/plugin-react';
//
//  export default defineConfig({
//    plugins: [react()],
//    server: {
//      proxy: {
//        '/api/claude': {
//          target: 'https://api.anthropic.com',
//          changeOrigin: true,
//          rewrite: () => '/v1/messages',
//          configure: (proxy) => {
//            proxy.on('proxyReq', (proxyReq, req) => {
//              const claudeKey = req.headers['x-claude-api-key'];
//              if (claudeKey) {
//                proxyReq.setHeader('x-api-key', claudeKey as string);
//                proxyReq.removeHeader('x-claude-api-key');
//              }
//              proxyReq.setHeader('anthropic-version', '2023-06-01');
//            });
//          }
//        }
//      }
//    }
//  });
//
// ====================================================================
// CLOUDFLARE WORKER PROXY CODE (deploy at cloudflare.com → Workers)
// ====================================================================
//
//  export default {
//    async fetch(request) {
//      if (request.method === 'OPTIONS') {
//        return new Response(null, {
//          headers: {
//            'Access-Control-Allow-Origin': '*',
//            'Access-Control-Allow-Methods': 'POST, OPTIONS',
//            'Access-Control-Allow-Headers': 'Content-Type, X-Claude-Api-Key, X-Anthropic-Version'
//          }
//        });
//      }
//      const apiKey = request.headers.get('X-Claude-Api-Key');
//      const body = await request.text();
//      const response = await fetch('https://api.anthropic.com/v1/messages', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          'x-api-key': apiKey,
//          'anthropic-version': '2023-06-01'
//        },
//        body
//      });
//      const data = await response.text();
//      return new Response(data, {
//        status: response.status,
//        headers: {
//          'Content-Type': 'application/json',
//          'Access-Control-Allow-Origin': '*'
//        }
//      });
//    }
//  };
//
// ====================================================================
