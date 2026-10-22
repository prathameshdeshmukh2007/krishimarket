# KrishiMarket Error Rectification & Claude Integration Guide

> **Platform**: KrishiMarket (Agri Market Intelligence Platform)  
> **Purpose**: Definitive diagnostic and rectification manual for all backend services, Claude AI integration, CORS handling, type definitions, and build pipelines.  
> **Last Verified Build**: Passed (`tsc -b && vite build` with 0 errors)  
> **Test Suite**: Passed (3/3 Global Trade tests, 3/3 AI & Cloud tests)  

---

## 1. Top Errors Identified & How They Are Rectified

### Error 1: Anthropic Claude API Browser CORS Block (`403 Forbidden` / `Failed to fetch`)
- **Symptom**: Calling `https://api.anthropic.com/v1/messages` directly from browser JavaScript results in:
  ```
  Access to fetch at 'https://api.anthropic.com/v1/messages' from origin 'http://localhost:5173'
  has been blocked by CORS policy: Response to preflight request doesn't pass access control check.
  ```
- **Root Cause**: Anthropic explicitly disallows direct client-side browser API calls to prevent client-side credential exposure and enforcing server-side usage.
- **Rectification in Development**:
  In [`vite.config.ts`](./vite.config.ts), a reverse proxy forwards all `/api/claude` requests to `https://api.anthropic.com`:
  ```typescript
  server: {
    host: true, // Allows LAN mobile access
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, ''),
        headers: {
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      },
    },
  }
  ```
- **Rectification in Production**:
  Use the Cloudflare Worker or Vercel Edge Function proxy provided inside [`claudeService.ts`](./claudeService.ts). Set `VITE_CLAUDE_PROXY_URL=https://your-worker.workers.dev/api/claude`.

---

### Error 2: API Key Prefix Mismatch & Routing Collision
- **Symptom**: Entering a Claude key resulted in Gemini API returning `API key not valid. Please pass a valid API key` or OpenAI returning `Incorrect API key provided`.
- **Root Cause**: `aiChatService.ts` was previously hardcoded or assuming Gemini when no explicit provider was chosen.
- **Rectification in [`aiChatService.ts`](./aiChatService.ts)**:
  Automatic key prefix detection:
  ```typescript
  export function detectProviderFromKey(key: string): AiProvider {
    const trimmed = key.trim();
    if (trimmed.startsWith('sk-ant-')) return 'claude';
    if (trimmed.startsWith('sk-')) return 'openai';
    return 'gemini'; // Default format: AIzaSy...
  }
  ```
  When a user pastes a key starting with `sk-ant-`, the service auto-switches to Claude without requiring manual configuration.

---

### Error 3: TypeScript Union Type Incompatibility (`providerUsed: 'live_claude'`)
- **Symptom**: TypeScript build error:
  ```
  Type '"live_claude"' is not assignable to type '"live_gemini" | "live_openai" | "expert_agronomist_engine" | undefined'.
  ```
- **Root Cause**: `voiceAssistantService.ts` had an outdated union type definition for `VoiceAssistantResponse.providerUsed`.
- **Rectification in [`voiceAssistantService.ts`](./voiceAssistantService.ts)**:
  Updated interface:
  ```typescript
  export interface VoiceAssistantResponse {
    transcript: string;
    replyText: string;
    language: LanguageCode;
    actionTab?: string;
    audioPlayed: boolean;
    providerUsed?: 'live_gemini' | 'live_openai' | 'live_claude' | 'expert_agronomist_engine';
  }
  ```

---

### Error 4: AGMARKNET / data.gov.in Government API Outages & Rate Limits
- **Symptom**: Network timeout or 503 Service Unavailable when querying official mandi price endpoints.
- **Root Cause**: data.gov.in servers frequently undergo maintenance or experience heavy load during morning mandi peak trading hours (08:00 - 11:00 AM IST).
- **Rectification in [`dataIngestionService.ts`](./dataIngestionService.ts)**:
  Two-tier fault tolerance:
  1. **Local Outage Cache**: Successful market snapshots are cached in `localStorage` with a TTL timestamp.
  2. **Canonical Baseline Fallback**: If both the live API and cache fail, `getFallbackPrices()` seamlessly supplies verified baseline market prices for 50+ APMC mandis so UI widgets and price tickers never break.

---

### Error 5: Cloudinary Unsigned Upload Preset Configuration
- **Symptom**: `Upload preset must be specified when using unsigned upload` (HTTP 400).
- **Root Cause**: Cloudinary requires a dedicated unsigned upload preset name when uploading directly from frontends without exposing API secrets.
- **Rectification in [`cloudImageService.ts`](./cloudImageService.ts)**:
  - Default preset `krishimarket_preset` configured.
  - Safe fallback to mock high-resolution URLs with provenance metadata (versioning, timestamp, GPS coordinates) if no cloud key is provided, ensuring seamless demo operation.

---

### Error 6: Net Return Calculation Rounding & Incoterm Double-Counting
- **Symptom**: Discrepancy between FOB (Free on Board) and CIF (Cost, Insurance & Freight) deductions, causing incorrect net farmer realization estimates.
- **Root Cause**: Freight & sea transit insurance were incorrectly deducted twice under FOB terms.
- **Rectification in [`netReturnCalculator.ts`](./netReturnCalculator.ts)**:
  Rigorous formula verified with APEDA Nashik onion benchmark:
  - **FOB**: Port handling (₹4.50/kg) + phytosanitary certification (₹1,500) + domestic transit (₹2.20/kg). International freight/insurance is buyer responsibility.
  - **CIF**: Includes ocean freight ($850/container) + marine insurance (0.45%).
  - Fully tested by `tests/netReturnCalculator.test.mjs`.

---

## 2. Environment Variables Quick Reference

Configure in `.env`:
```bash
# Real AI Keys (Supports Auto-Detection)
VITE_CLAUDE_API_KEY=sk-ant-api03-...
VITE_GEMINI_API_KEY=AIzaSy...
VITE_OPENAI_API_KEY=sk-proj-...

# Optional Proxy URL (for production deployments outside Vite dev server)
VITE_CLAUDE_PROXY_URL=https://your-worker.workers.dev/api/claude

# Cloudinary Media Storage (Optional for camera uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=krishimarket_preset
```

---

## 3. Build & Test Commands

Run with Node v20+:
```powershell
$env:PATH = "C:\Users\Prathamesh\.tools\node;$env:PATH"
npm test          # Runs all 6 unit and integration test suites
npm run build     # Compiles TypeScript and builds Vite production bundle
npm run dev       # Starts local development server with /api/claude proxy
```
