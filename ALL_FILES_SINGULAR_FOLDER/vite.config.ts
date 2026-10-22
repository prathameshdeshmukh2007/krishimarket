import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { ProxyOptions } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // Expose on local network so mobile devices can access via LAN IP
    host: true,
    port: 5173,

    proxy: {
      // ----------------------------------------------------------------
      // Claude (Anthropic) API proxy — bypasses browser CORS restriction
      // The claudeService.ts sends X-Claude-Api-Key header which we
      // rewrite here to x-api-key before forwarding to Anthropic.
      // ----------------------------------------------------------------
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/v1/messages',
        configure: (proxy: any) => {
          proxy.on('proxyReq', (proxyReq: any, req: any) => {
            const claudeKey = req.headers['x-claude-api-key'];
            if (claudeKey) {
              proxyReq.setHeader('x-api-key', claudeKey);
              proxyReq.removeHeader('x-claude-api-key');
            }
            proxyReq.setHeader('anthropic-version', '2023-06-01');
          });
        }
      } as ProxyOptions
    }
  }
})
