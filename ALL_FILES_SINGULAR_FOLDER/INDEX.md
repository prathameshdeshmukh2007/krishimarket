# ALL PROJECT FILES (SINGULAR FOLDER)

This folder contains all **72** source, service, configuration, data, type, and component files of KrishiMarket gathered together in **one singular flat directory**.

## Quick File Categories

### Error Rectification & Claude AI Services
- `ERROR_RECTIFICATION_GUIDE.md` - Comprehensive troubleshooting guide for CORS, Claude, key routing, and type errors
- `claudeService.ts` - Anthropic Claude 3.5 Sonnet client & proxy handler
- `aiChatService.ts` - Multi-LLM routing (Claude, Gemini, OpenAI) with auto key detection
- `voiceAssistantService.ts` - Speech synthesis & recognition
- `aiEngine.ts` - Recommendation engine, ARIMA forecasting & CV photo scanner
- `vite.config.ts` - Vite dev server with `/api/claude` proxy and mobile LAN host configuration

### Backend Services & Net Return
- `dataIngestionService.ts` - AGMARKNET / data.gov.in real-time mandi API client
- `marketAnalytics.ts` - Arbitrage matrix & True Net Realisation calculations
- `authService.ts` - Phone OTP verification & role session management
- `cloudImageService.ts` - Cloudinary photo upload & provenance metadata
- `cropRecommendationService.ts` - NPK soil & crop agronomic planning
- `financeService.ts` - KCC loan & e-NWR warehouse pledge financing
- `globalTradeService.ts` - APEDA international export workflows & Dubai quotes
- `netReturnCalculator.ts` - Farmgate Net Realization calculator

### Types, Master Data & Schemas
- `types_index.ts` - Core TypeScript types (CropLot, BuyerOffer, FarmVisitAppointment, etc.)
- `types_globalTrade.ts` - Export TypeScript types
- `data_initialData.ts` - APMC mandis & commodity master data
- `db_schema.sql` - PostgreSQL / Supabase 28-table database schema
- `db_migration_global_trade.sql` - Export trade tables and triggers
- `i18n_translations.ts` - 1,478-line trilingual dictionary (English, Hindi, Marathi)

### Frontend Components & Modals (All 32 Views)
- `FarmerHomeDashboard.tsx`, `MarketTerminalView.tsx`, `MarketExplorerView.tsx`
- `BuyerMarketplaceView.tsx`, `CropLotsAndPassportView.tsx`, `GlobalTradeView.tsx`
- `CameraCaptureModal.tsx`, `DirectBuyModal.tsx`, `FarmVisitsModal.tsx`
- `ImageCloudInspectorModal.tsx`, `AskFarmAiView.tsx`, `LoginWelcomeScreen.tsx`, etc.

### Comprehensive Manifests
- `BACKEND_ALL_SERVICES.md` - All 21 backend files in a single readable markdown document
- `ALL_PROJECT_FILES_MANIFEST.md` - Complete project file catalog and past git history
