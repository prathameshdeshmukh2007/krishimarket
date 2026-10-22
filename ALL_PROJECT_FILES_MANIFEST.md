# KrishiMarket Platform - Complete Files Manifest & Change History

> **Platform**: KrishiMarket (Agri Market Intelligence Platform)  
> **Repository Root**: `c:/Users/Prathamesh/.antigravity-ide/agri-app`  
> **Total Files Cataloged**: 85 files (excluding `node_modules`, `.git`, `dist`)  
> **Generated**: 2026-10-22T06:31:23.515Z  

---

## 1. Ongoing Modifications (Uncommitted Working Tree)

Below are the ongoing modifications actively in progress in the working tree:

```
M src/services/aiChatService.ts
 M src/services/voiceAssistantService.ts
 M vite.config.ts
?? BACKEND_ALL_SERVICES.md
?? scripts/
?? src/services/claudeService.ts
```

### Detailed Breakdown of Ongoing Modifications:
1. **`src/services/claudeService.ts` (Untracked / New)**:
   - Full Anthropic Claude 3.5 Sonnet client implementation.
   - Built with `/api/claude` proxy routing to eliminate browser CORS blocks.
   - Includes conversational memory (6 turns), error normalization (`ClaudeApiError`), and Cloudflare Worker production deployment guide.
2. **`src/services/aiChatService.ts` (Modified)**:
   - Upgraded to a 3-provider routing hub: Claude, Gemini 1.5 Flash, and OpenAI GPT-4o-mini.
   - Added key prefix autodetection (`sk-ant-` -> Claude, `sk-` -> OpenAI, `AIzaSy` -> Gemini).
   - Unified return type to report `live_claude` when Claude is utilized.
3. **`src/services/voiceAssistantService.ts` (Modified)**:
   - Added `live_claude` to `VoiceAssistantResponse.providerUsed` union for full type safety.
4. **`vite.config.ts` (Modified)**:
   - Added `/api/claude` proxy forwarding to `https://api.anthropic.com` with header rewrites.
   - Configured `server.host: true` allowing direct LAN mobile testing across local IP addresses.

---

## 2. Past Git Modification History (Recent Commits)

```
546eac6 | 2026-10-20 | feat: real AI API key integration (Gemini & OpenAI) and Cloud Image Storage with 2.5x zoom inspection & photo retake provenance
ead08f7 | 2026-10-20 | feat(global-trade): add global trade module, 1000kg onion benchmark, phone OTP, and net return calculator
5499fde | 2026-10-03 | docs: add live Vercel and GitHub deployment links to README
ad36d36 | 2026-10-03 | feat: initial release of KrishiMarket farmer platform with UI/UX upgrade, QR payment & login
```

### Chronological Feature Evolution:
1. **Commit `ad36d36`**: Initial release of KrishiMarket farmer platform with high-density market terminal, APMC mandi ticker, AMI-50 index card, QR payment tracking, and farmer login.
2. **Commit `5499fde`**: Documentation updates with live Vercel and GitHub deployment links.
3. **Commit `ead08f7`**: Global trade module implementation: APEDA 1,000kg Nashik onion export benchmark, international buyer quotes, phone OTP authentication, and the True Net Return calculator.
4. **Commit `546eac6`**: Live AI API key integration (Gemini & OpenAI), Cloudinary media storage with 2.5x zoom inspection, photo retake provenance, and crop health diagnostics.
5. **Ongoing (Head)**: Anthropic Claude integration, proxy routing, camera lot capture modal, direct merchant buy modal, and farm visit scheduler.

---

## 3. Complete File Inventory by Category

### Backend & Business Logic Services (12 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`src/services/aiChatService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/aiChatService.ts) | 508 | 24,860 | Tri-model AI routing engine (Claude, Gemini 1.5 Flash, OpenAI GPT-4o-mini), key prefix auto-detection & fallback mock responses |
| [`src/services/aiEngine.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/aiEngine.ts) | 752 | 28,895 | Decision engine: Sell vs Store vs Transport recommendation, 7-day ARIMA price forecasting, photo quality CV grading (Grade A/B/C) |
| [`src/services/authService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/authService.ts) | 405 | 12,678 | Phone OTP generation & verification, role session management (Farmer, Merchant, FPO, Admin), localStorage auth state |
| [`src/services/claudeService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/claudeService.ts) | 347 | 12,684 | Anthropic Claude 3.5 Sonnet client, proxy routing (/api/claude), 6-turn history, error handling & Cloudflare worker template |
| [`src/services/cloudImageService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/cloudImageService.ts) | 427 | 15,534 | Cloudinary direct unsigned upload, image optimization, transformation URLs, photo metadata & provenance tagging |
| [`src/services/cropRecommendationService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/cropRecommendationService.ts) | 495 | 31,198 | Crop suitability engine based on NPK soil chemistry, rainfall, season, district, temperature, and net margin ROI estimates |
| [`src/services/dataIngestionService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/dataIngestionService.ts) | 204 | 6,992 | AGMARKNET / data.gov.in real-time API client, APMC mandi price normalization, data freshness validation, local caching |
| [`src/services/financeService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/financeService.ts) | 260 | 8,252 | Kisan Credit Card (KCC) interest subvention calculator, Electronic Negotiable Warehouse Receipt (e-NWR) pledge loans |
| [`src/services/globalTradeService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/globalTradeService.ts) | 716 | 26,854 | APEDA export compliance checks, buyer quotation management, international trade orders (Dubai/Singapore/EU), Incoterm rules |
| [`src/services/marketAnalytics.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/marketAnalytics.ts) | 304 | 11,190 | Historical price aggregation (1D to 5Y), multi-mandi arbitrage calculations, mandi distance/freight net realization matrix |
| [`src/services/netReturnCalculator.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/netReturnCalculator.ts) | 244 | 9,081 | Real-time Net Farmgate Return calculator: benchmark APEDA export prices minus port handling, freight, custom duty, forex fees |
| [`src/services/voiceAssistantService.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/services/voiceAssistantService.ts) | 88 | 3,217 | Multilingual speech synthesis and recognition integration with AI chat fallback (Hindi, Marathi, English) |

### Data Models, Types & Master Data (3 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`src/data/initialData.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/data/initialData.ts) | 644 | 29,312 | Master commodity taxonomy (fruits & vegetables), 50+ APMC mandis across India, initial market indices (AMI-50, AMI-VEG) |
| [`src/types/globalTrade.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/types/globalTrade.ts) | 306 | 8,534 | Export TypeScript interfaces: ExportListing, BuyerQuote, TradeOrder, NetReturnCalculationResult, IncotermType |
| [`src/types/index.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/types/index.ts) | 556 | 13,541 | Core TypeScript interfaces: CropLot, BuyerOffer, FarmVisitAppointment, APMCMarket, Commodity, PassportEvent, etc. |

### Database Schemas & Migrations (2 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`src/db/migrations/20261020_global_trade_module.sql`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/db/migrations/20261020_global_trade_module.sql) | 485 | 22,538 | Database migration adding export_listings, buyer_quotes, trade_orders, compliance_docs, and audit triggers |
| [`src/db/schema.sql`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/db/schema.sql) | 420 | 16,651 | PostgreSQL / Supabase 28-table schema: users, commodities, mandis, daily_prices, lots, passports, visits, orders, escrows |

### Frontend Core Application & Entry (6 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`index.html`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/index.html) | 19 | 1,147 | Static asset or configuration |
| [`src/App.css`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/App.css) | 185 | 2,891 | Static asset or configuration |
| [`src/App.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/App.tsx) | 691 | 24,904 | TypeScript component or utility module |
| [`src/index.css`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/index.css) | 177 | 4,243 | Static asset or configuration |
| [`src/main.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/main.tsx) | 11 | 226 | TypeScript component or utility module |
| [`src/vite-env.d.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/vite-env.d.ts) | 2 | 38 | TypeScript component or utility module |

### Frontend Main Dashboard Views (19 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`src/components/AdminDataHealthView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/AdminDataHealthView.tsx) | 240 | 11,417 | TypeScript component or utility module |
| [`src/components/AgriNewsView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/AgriNewsView.tsx) | 164 | 7,233 | TypeScript component or utility module |
| [`src/components/AskFarmAiView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/AskFarmAiView.tsx) | 452 | 22,349 | Conversational AI agronomist interface supporting text, voice, image upload, and multi-LLM execution |
| [`src/components/BuyerMarketplaceView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/BuyerMarketplaceView.tsx) | 520 | 23,911 | Merchant marketplace with crop lot catalog, live bids, direct buy, farm visit booking, and verified farmer badges |
| [`src/components/CropLotsAndPassportView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/CropLotsAndPassportView.tsx) | 423 | 20,776 | Farmer lot management with digital crop passports, QR codes, blockchain-style audit trail, and visit requests |
| [`src/components/CropRecommendationView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/CropRecommendationView.tsx) | 471 | 23,338 | Agronomic AI advisory: soil NPK suitability, rainfall patterns, water requirements, and ROI forecast |
| [`src/components/ExoticCropsView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/ExoticCropsView.tsx) | 194 | 9,050 | TypeScript component or utility module |
| [`src/components/FarmerDecisionHeroView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/FarmerDecisionHeroView.tsx) | 386 | 18,310 | "What should I do with my crop?" decision engine offering Sell, Store, or Transport recommendations |
| [`src/components/FarmFinanceView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/FarmFinanceView.tsx) | 555 | 25,094 | Fintech dashboard: Kisan Credit Card (KCC) interest subvention and e-NWR warehouse pledge financing |
| [`src/components/FpoAggregationView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/FpoAggregationView.tsx) | 244 | 10,467 | TypeScript component or utility module |
| [`src/components/GlobalTradeView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/GlobalTradeView.tsx) | 1440 | 77,902 | Cross-border APEDA trade terminal: export quotations, Dubai/Singapore corridors, Incoterm pricing, compliance docs |
| [`src/components/LoginWelcomeScreen.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/LoginWelcomeScreen.tsx) | 870 | 44,051 | Modern agricultural authentication portal: Phone OTP, role selector (Farmer/Merchant/FPO), demo mode |
| [`src/components/MarketComparisonView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/MarketComparisonView.tsx) | 247 | 11,427 | Inter-mandi arbitrage engine: comparing prices across mandis minus diesel/truck freight costs |
| [`src/components/MarketExplorerView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/MarketExplorerView.tsx) | 583 | 26,763 | Interactive Recharts time-series charts (1D to 5Y) with ARIMA forecasting overlays |
| [`src/components/MarketPriceView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/MarketPriceView.tsx) | 498 | 22,775 | TypeScript component or utility module |
| [`src/components/MarketTerminalView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/MarketTerminalView.tsx) | 327 | 15,152 | Financial-terminal style dashboard: APMC ticker, gainers/losers, price volatility, Mandi depth |
| [`src/components/QrPaymentTrackingView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/QrPaymentTrackingView.tsx) | 591 | 26,301 | TypeScript component or utility module |
| [`src/components/SellOrStoreRecommendationCard.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/SellOrStoreRecommendationCard.tsx) | 717 | 34,201 | TypeScript component or utility module |
| [`src/components/TransactionTrackerView.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/TransactionTrackerView.tsx) | 373 | 17,157 | TypeScript component or utility module |

### Interactive Modals & Workflow Tools (8 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`src/components/AuthModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/AuthModal.tsx) | 395 | 17,191 | TypeScript component or utility module |
| [`src/components/CameraCaptureModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/CameraCaptureModal.tsx) | 638 | 26,132 | Webcam/mobile camera crop photo capture, AI quality grading (Grade A/B/C), Cloudinary upload, lot publishing |
| [`src/components/DirectBuyModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/DirectBuyModal.tsx) | 222 | 9,497 | Instant merchant purchase modal with escrow payment breakdown, transport dispatch, and net farmer payout |
| [`src/components/FarmVisitsModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/FarmVisitsModal.tsx) | 229 | 9,589 | Merchant on-farm appointment scheduler: GPS location dispatch, date/slot picker, sample inspection tracking |
| [`src/components/ImageCloudInspectorModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/ImageCloudInspectorModal.tsx) | 290 | 13,560 | TypeScript component or utility module |
| [`src/components/PaymentQrModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/PaymentQrModal.tsx) | 234 | 9,430 | TypeScript component or utility module |
| [`src/components/RatingReviewModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/RatingReviewModal.tsx) | 176 | 6,643 | TypeScript component or utility module |
| [`src/components/VoiceAssistantModal.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/VoiceAssistantModal.tsx) | 265 | 9,439 | TypeScript component or utility module |

### Visual Components & Subcomponents (5 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`src/components/AgriIndexCard.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/AgriIndexCard.tsx) | 150 | 7,227 | TypeScript component or utility module |
| [`src/components/FarmerHomeDashboard.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/FarmerHomeDashboard.tsx) | 646 | 30,624 | Unified farmer command center: crop holdings, weather, quick sell, MSP alerts, live mandi rates |
| [`src/components/MarketTicker.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/MarketTicker.tsx) | 78 | 3,131 | TypeScript component or utility module |
| [`src/components/Navbar.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/Navbar.tsx) | 428 | 18,946 | TypeScript component or utility module |
| [`src/components/QrCodeDisplay.tsx`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/components/QrCodeDisplay.tsx) | 190 | 6,731 | TypeScript component or utility module |

### Localization & Internationalization (1 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`src/i18n/translations.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/i18n/translations.ts) | 1478 | 1,02,068 | Comprehensive trilingual dictionary (English, Hindi, Marathi) with 1,400+ lines of localized agricultural terminology |

### Configuration, Proxies & Build Scripts (18 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`.env`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/.env) | 23 | 768 | Static asset or configuration |
| [`.env.example`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/.env.example) | 67 | 2,698 | Comprehensive environment variables guide for Gemini, OpenAI, Claude, Cloudinary, Supabase, and AGMARKNET APIs |
| [`.gitignore`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/.gitignore) | 41 | 444 | Static asset or configuration |
| [`.oxlintrc.json`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/.oxlintrc.json) | 9 | 245 | Configuration or manifest |
| [`deploy-to-vercel.bat`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/deploy-to-vercel.bat) | 27 | 756 | Static asset or configuration |
| [`KrishiMarket-Project.zip`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/KrishiMarket-Project.zip) | 1247 | 3,27,466 | Static asset or configuration |
| [`package-lock.json`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/package-lock.json) | 3408 | 1,17,418 | Configuration or manifest |
| [`package.json`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/package.json) | 36 | 882 | Project dependencies, dev scripts, Lucide icons, Recharts, Vite & React 19 configuration |
| [`postcss.config.js`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/postcss.config.js) | 7 | 80 | Static asset or configuration |
| [`prototype 2 agrimarket`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/prototype 2 agrimarket) | 1 | 0 | Static asset or configuration |
| [`scripts/build_manifests.mjs`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/scripts/build_manifests.mjs) | 313 | 19,132 | Static asset or configuration |
| [`tailwind.config.js`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tailwind.config.js) | 63 | 1,745 | Static asset or configuration |
| [`tsconfig.app.json`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tsconfig.app.json) | 24 | 514 | Configuration or manifest |
| [`tsconfig.app.tsbuildinfo`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tsconfig.app.tsbuildinfo) | 1 | 1,954 | Static asset or configuration |
| [`tsconfig.json`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tsconfig.json) | 8 | 119 | Configuration or manifest |
| [`tsconfig.node.json`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tsconfig.node.json) | 24 | 558 | Configuration or manifest |
| [`vercel.json`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/vercel.json) | 12 | 183 | Vercel deployment rewrite rules for Single Page Application routing |
| [`vite.config.ts`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/vite.config.ts) | 39 | 1,294 | Vite configuration: Claude API CORS proxy (/api/claude -> api.anthropic.com), network host exposure for mobile testing |

### Automated Test Suites (3 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`tests/netReturnCalculator.test.mjs`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tests/netReturnCalculator.test.mjs) | 175 | 8,022 | Static asset or configuration |
| [`tests/test-ai-cloud.mjs`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tests/test-ai-cloud.mjs) | 58 | 3,992 | Static asset or configuration |
| [`tests/test-runner.mjs`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/tests/test-runner.mjs) | 155 | 7,619 | Static asset or configuration |

### Static Assets & Public Media (6 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`public/favicon.svg`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/public/favicon.svg) | 1 | 9,522 | Static asset or configuration |
| [`public/icons.svg`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/public/icons.svg) | 25 | 5,031 | Static asset or configuration |
| [`public/_redirects`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/public/_redirects) | 2 | 24 | Static asset or configuration |
| [`src/assets/hero.png`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/assets/hero.png) | 53 | 13,057 | Static asset or configuration |
| [`src/assets/react.svg`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/assets/react.svg) | 1 | 4,126 | Static asset or configuration |
| [`src/assets/vite.svg`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/src/assets/vite.svg) | 2 | 8,709 | Static asset or configuration |

### Documentation (2 files)

| File Path | Lines | Size (Bytes) | Description & Role |
| :--- | :---: | :---: | :--- |
| [`BACKEND_ALL_SERVICES.md`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/BACKEND_ALL_SERVICES.md) | 7673 | 3,03,191 | Static asset or configuration |
| [`README.md`](file:///C:/Users/Prathamesh/.antigravity-ide/agri-app/README.md) | 115 | 4,521 | Static asset or configuration |

