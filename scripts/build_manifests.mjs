import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Backend files list
const backendFiles = [
  { path: 'src/services/claudeService.ts', category: 'AI & LLM Services', desc: 'Anthropic Claude 3.5 Sonnet client, proxy routing (/api/claude), 6-turn history, error handling & Cloudflare worker template' },
  { path: 'src/services/aiChatService.ts', category: 'AI & LLM Services', desc: 'Tri-model AI routing engine (Claude, Gemini 1.5 Flash, OpenAI GPT-4o-mini), key prefix auto-detection & fallback mock responses' },
  { path: 'src/services/aiEngine.ts', category: 'AI & Decision Services', desc: 'Decision engine: Sell vs Store vs Transport recommendation, 7-day ARIMA price forecasting, photo quality CV grading (Grade A/B/C)' },
  { path: 'src/services/dataIngestionService.ts', category: 'Data & Market Services', desc: 'AGMARKNET / data.gov.in real-time API client, APMC mandi price normalization, data freshness validation, local caching' },
  { path: 'src/services/marketAnalytics.ts', category: 'Data & Market Services', desc: 'Historical price aggregation (1D to 5Y), multi-mandi arbitrage calculations, mandi distance/freight net realization matrix' },
  { path: 'src/services/authService.ts', category: 'Auth & Identity Services', desc: 'Phone OTP generation & verification, role session management (Farmer, Merchant, FPO, Admin), localStorage auth state' },
  { path: 'src/services/cloudImageService.ts', category: 'Media & Storage Services', desc: 'Cloudinary direct unsigned upload, image optimization, transformation URLs, photo metadata & provenance tagging' },
  { path: 'src/services/cropRecommendationService.ts', category: 'Agronomy Services', desc: 'Crop suitability engine based on NPK soil chemistry, rainfall, season, district, temperature, and net margin ROI estimates' },
  { path: 'src/services/financeService.ts', category: 'Fintech & Credit Services', desc: 'Kisan Credit Card (KCC) interest subvention calculator, Electronic Negotiable Warehouse Receipt (e-NWR) pledge loans' },
  { path: 'src/services/globalTradeService.ts', category: 'Export & Trade Services', desc: 'APEDA export compliance checks, buyer quotation management, international trade orders (Dubai/Singapore/EU), Incoterm rules' },
  { path: 'src/services/netReturnCalculator.ts', category: 'Export & Trade Services', desc: 'Real-time Net Farmgate Return calculator: benchmark APEDA export prices minus port handling, freight, custom duty, forex fees' },
  { path: 'src/services/voiceAssistantService.ts', category: 'Voice & Speech Services', desc: 'Multilingual speech synthesis and recognition integration with AI chat fallback (Hindi, Marathi, English)' },
  { path: 'src/types/index.ts', category: 'Data Models & Types', desc: 'Core TypeScript interfaces: CropLot, BuyerOffer, FarmVisitAppointment, APMCMarket, Commodity, PassportEvent, etc.' },
  { path: 'src/types/globalTrade.ts', category: 'Data Models & Types', desc: 'Export TypeScript interfaces: ExportListing, BuyerQuote, TradeOrder, NetReturnCalculationResult, IncotermType' },
  { path: 'src/data/initialData.ts', category: 'Master Datasets', desc: 'Master commodity taxonomy (fruits & vegetables), 50+ APMC mandis across India, initial market indices (AMI-50, AMI-VEG)' },
  { path: 'src/db/schema.sql', category: 'Database & SQL', desc: 'PostgreSQL / Supabase 28-table schema: users, commodities, mandis, daily_prices, lots, passports, visits, orders, escrows' },
  { path: 'src/db/migrations/20261020_global_trade_module.sql', category: 'Database & SQL', desc: 'Database migration adding export_listings, buyer_quotes, trade_orders, compliance_docs, and audit triggers' },
  { path: 'vite.config.ts', category: 'Proxy & Infrastructure', desc: 'Vite configuration: Claude API CORS proxy (/api/claude -> api.anthropic.com), network host exposure for mobile testing' },
  { path: 'package.json', category: 'Proxy & Infrastructure', desc: 'Project dependencies, dev scripts, Lucide icons, Recharts, Vite & React 19 configuration' },
  { path: '.env.example', category: 'Configuration', desc: 'Comprehensive environment variables guide for Gemini, OpenAI, Claude, Cloudinary, Supabase, and AGMARKNET APIs' },
  { path: 'vercel.json', category: 'Configuration', desc: 'Vercel deployment rewrite rules for Single Page Application routing' }
];

console.log('Generating BACKEND_ALL_SERVICES.md...');
let backendDoc = `# KrishiMarket Platform - Complete Backend Codebase

> **Platform**: KrishiMarket (Agri Market Intelligence)  
> **Repository Root**: \`c:/Users/Prathamesh/.antigravity-ide/agri-app\`  
> **Scope**: All Backend Services, Business Logic, AI Integration, Database Schemas, API Proxies, and Type Definitions  
> **Generated**: ${new Date().toISOString()}  

---

## Architecture Overview

KrishiMarket's backend architecture is structured around four primary pillars:

1. **Market Data & Analytical Intelligence Layer**:
   - \`dataIngestionService.ts\`: Ingests and normalizes live mandi price records from Government APIs (AGMARKNET / data.gov.in) with caching and outage fallback.
   - \`marketAnalytics.ts\`: Computes historical price aggregations, multi-period trends, volatility indices, and inter-mandi arbitrage (True Net Realisation after transport costs).
   - \`initialData.ts\`: Houses canonical APMC mandi master data across Maharashtra, Karnataka, Gujarat, and Punjab, alongside commodity metadata.

2. **Tri-Model AI & Decision Engine**:
   - \`claudeService.ts\`: Dedicated Anthropic Claude 3.5 Sonnet integration with 6-turn history, streaming support, error recovery, and Cloudflare Worker proxy configuration.
   - \`aiChatService.ts\`: Multi-model orchestration layer auto-detecting user keys (\`sk-ant-\` for Claude, \`sk-\` for OpenAI, \`AIzaSy\` for Gemini) with local offline fallback.
   - \`aiEngine.ts\`: "What should I do with my crop?" decision engine (Sell vs Store vs Transport), 7-day ARIMA price forecast, and computer-vision crop lot quality inspection.
   - \`voiceAssistantService.ts\`: Multilingual voice recognition & synthesis wrapper (English, Hindi, Marathi).

3. **Agronomy, Credit & Global Trade Engines**:
   - \`cropRecommendationService.ts\`: Algorithmic crop planning taking into account soil NPK values, water availability, season, and market profit margins.
   - \`financeService.ts\`: KCC interest subvention calculations and electronic Negotiable Warehouse Receipt (e-NWR) pledge financing.
   - \`globalTradeService.ts\`: APEDA international export workflows, buyer quotations, Incoterms (FOB, CIF, EXW), and Dubai/Singapore trade execution.
   - \`netReturnCalculator.ts\`: Farmgate Net Realization formula calculating actual farmer earnings after logistics, port fees, tariffs, and currency exchange.

4. **Identity, Media & Persistence Layer**:
   - \`authService.ts\`: Phone number OTP verification and role-based session management (Farmer, Merchant, FPO, Admin).
   - \`cloudImageService.ts\`: Cloudinary direct media storage with 2.5x zoom inspection, photo provenance timestamps, and GPS metadata.
   - \`schema.sql\` & \`migrations/\`: 28 PostgreSQL/Supabase tables covering agricultural lots, digital passports, merchant appointments, escrow payments, and international trade.

---

## Table of Contents

`;

backendFiles.forEach((file, idx) => {
  const anchor = file.path.toLowerCase().replace(/[^a-z0-9]/g, '-');
  backendDoc += `${idx + 1}. [${file.path}](#${anchor}) - *${file.category}: ${file.desc}*\n`;
});

backendDoc += '\n---\n\n';

backendFiles.forEach((file, idx) => {
  const fullPath = path.join(projectRoot, file.path);
  const anchor = file.path.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const content = fs.readFileSync(fullPath, 'utf8');
  const ext = path.extname(file.path).replace('.', '') || 'text';
  let lang = 'typescript';
  if (ext === 'sql') lang = 'sql';
  else if (ext === 'json') lang = 'json';
  else if (ext === 'example' || ext === 'env') lang = 'shell';

  const lineCount = content.split('\n').length;
  const fileSize = fs.statSync(fullPath).size;

  backendDoc += `<a id="${anchor}"></a>\n`;
  backendDoc += `## ${idx + 1}. \`${file.path}\`\n\n`;
  backendDoc += `- **Category**: ${file.category}\n`;
  backendDoc += `- **Purpose**: ${file.desc}\n`;
  backendDoc += `- **Lines of Code**: ${lineCount}\n`;
  backendDoc += `- **File Size**: ${fileSize} bytes (~${(fileSize / 1024).toFixed(1)} KB)\n`;
  backendDoc += `- **Path**: \`file:///${fullPath.replace(/\\/g, '/')}\`\n\n`;
  backendDoc += `\`\`\`${lang}\n`;
  backendDoc += content;
  backendDoc += '\n```\n\n---\n\n';
});

const backendOutPath = path.join(projectRoot, 'BACKEND_ALL_SERVICES.md');
fs.writeFileSync(backendOutPath, backendDoc, 'utf8');
console.log(`Wrote ${backendOutPath} (${fs.statSync(backendOutPath).size} bytes)`);

// 2. Scan all project files
console.log('Scanning all project files for PROJECT_ALL_FILES_MANIFEST.md...');

function scanDir(dir, baseDir = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.vercel') continue;
    const fullPath = path.join(dir, item);
    const relPath = path.join(baseDir, item).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDir(fullPath, relPath));
    } else {
      let lines = 0;
      try {
        lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      } catch (e) {
        lines = -1; // binary
      }
      results.push({
        relPath,
        fullPath,
        size: stat.size,
        lines,
        ext: path.extname(item)
      });
    }
  }
  return results;
}

const allFiles = scanDir(projectRoot);

// Git status and history
let gitStatus = '';
let gitLog = '';
try {
  gitStatus = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' }).trim();
  gitLog = execSync('git log --pretty=format:"%h | %cd | %s" --date=short -n 10', { cwd: projectRoot, encoding: 'utf8' }).trim();
} catch (e) {
  gitStatus = 'Git status unavailable';
  gitLog = 'Git log unavailable';
}

// Categorize all files
const categories = {
  'Backend & Business Logic Services': [],
  'Data Models, Types & Master Data': [],
  'Database Schemas & Migrations': [],
  'Frontend Core Application & Entry': [],
  'Frontend Main Dashboard Views': [],
  'Interactive Modals & Workflow Tools': [],
  'Visual Components & Subcomponents': [],
  'Localization & Internationalization': [],
  'Configuration, Proxies & Build Scripts': [],
  'Automated Test Suites': [],
  'Static Assets & Public Media': [],
  'Documentation': []
};

allFiles.forEach(file => {
  const p = file.relPath;
  if (p.startsWith('src/services/')) {
    categories['Backend & Business Logic Services'].push(file);
  } else if (p.startsWith('src/types/') || p === 'src/data/initialData.ts') {
    categories['Data Models, Types & Master Data'].push(file);
  } else if (p.startsWith('src/db/')) {
    categories['Database Schemas & Migrations'].push(file);
  } else if (p === 'src/App.tsx' || p === 'src/main.tsx' || p === 'src/App.css' || p === 'src/index.css' || p === 'index.html' || p === 'src/vite-env.d.ts') {
    categories['Frontend Core Application & Entry'].push(file);
  } else if (p.startsWith('src/components/') && p.endsWith('Modal.tsx')) {
    categories['Interactive Modals & Workflow Tools'].push(file);
  } else if (p.startsWith('src/components/') && (p.endsWith('View.tsx') || p.endsWith('Screen.tsx') || p.endsWith('Card.tsx') && p.includes('Recommendation'))) {
    categories['Frontend Main Dashboard Views'].push(file);
  } else if (p.startsWith('src/components/')) {
    categories['Visual Components & Subcomponents'].push(file);
  } else if (p.startsWith('src/i18n/')) {
    categories['Localization & Internationalization'].push(file);
  } else if (p.startsWith('tests/')) {
    categories['Automated Test Suites'].push(file);
  } else if (p.startsWith('public/') || p.startsWith('src/assets/')) {
    categories['Static Assets & Public Media'].push(file);
  } else if (p.endsWith('.md')) {
    categories['Documentation'].push(file);
  } else {
    categories['Configuration, Proxies & Build Scripts'].push(file);
  }
});

let manifestDoc = `# KrishiMarket Platform - Complete Files Manifest & Change History

> **Platform**: KrishiMarket (Agri Market Intelligence Platform)  
> **Repository Root**: \`c:/Users/Prathamesh/.antigravity-ide/agri-app\`  
> **Total Files Cataloged**: ${allFiles.length} files (excluding \`node_modules\`, \`.git\`, \`dist\`)  
> **Generated**: ${new Date().toISOString()}  

---

## 1. Ongoing Modifications (Uncommitted Working Tree)

Below are the ongoing modifications actively in progress in the working tree:

\`\`\`
${gitStatus || 'No unstaged or untracked changes.'}
\`\`\`

### Detailed Breakdown of Ongoing Modifications:
1. **\`src/services/claudeService.ts\` (Untracked / New)**:
   - Full Anthropic Claude 3.5 Sonnet client implementation.
   - Built with \`/api/claude\` proxy routing to eliminate browser CORS blocks.
   - Includes conversational memory (6 turns), error normalization (\`ClaudeApiError\`), and Cloudflare Worker production deployment guide.
2. **\`src/services/aiChatService.ts\` (Modified)**:
   - Upgraded to a 3-provider routing hub: Claude, Gemini 1.5 Flash, and OpenAI GPT-4o-mini.
   - Added key prefix autodetection (\`sk-ant-\` -> Claude, \`sk-\` -> OpenAI, \`AIzaSy\` -> Gemini).
   - Unified return type to report \`live_claude\` when Claude is utilized.
3. **\`src/services/voiceAssistantService.ts\` (Modified)**:
   - Added \`live_claude\` to \`VoiceAssistantResponse.providerUsed\` union for full type safety.
4. **\`vite.config.ts\` (Modified)**:
   - Added \`/api/claude\` proxy forwarding to \`https://api.anthropic.com\` with header rewrites.
   - Configured \`server.host: true\` allowing direct LAN mobile testing across local IP addresses.

---

## 2. Past Git Modification History (Recent Commits)

\`\`\`
${gitLog}
\`\`\`

### Chronological Feature Evolution:
1. **Commit \`ad36d36\`**: Initial release of KrishiMarket farmer platform with high-density market terminal, APMC mandi ticker, AMI-50 index card, QR payment tracking, and farmer login.
2. **Commit \`5499fde\`**: Documentation updates with live Vercel and GitHub deployment links.
3. **Commit \`ead08f7\`**: Global trade module implementation: APEDA 1,000kg Nashik onion export benchmark, international buyer quotes, phone OTP authentication, and the True Net Return calculator.
4. **Commit \`546eac6\`**: Live AI API key integration (Gemini & OpenAI), Cloudinary media storage with 2.5x zoom inspection, photo retake provenance, and crop health diagnostics.
5. **Ongoing (Head)**: Anthropic Claude integration, proxy routing, camera lot capture modal, direct merchant buy modal, and farm visit scheduler.

---

## 3. Complete File Inventory by Category

`;

for (const [catName, fileList] of Object.entries(categories)) {
  manifestDoc += `### ${catName} (${fileList.length} files)\n\n`;
  manifestDoc += `| File Path | Lines | Size (Bytes) | Description & Role |\n`;
  manifestDoc += `| :--- | :---: | :---: | :--- |\n`;
  
  fileList.forEach(f => {
    let desc = '';
    // Look up known descriptions
    const bk = backendFiles.find(b => b.path === f.relPath);
    if (bk) {
      desc = bk.desc;
    } else if (f.relPath.includes('FarmerHomeDashboard')) {
      desc = 'Unified farmer command center: crop holdings, weather, quick sell, MSP alerts, live mandi rates';
    } else if (f.relPath.includes('GlobalTradeView')) {
      desc = 'Cross-border APEDA trade terminal: export quotations, Dubai/Singapore corridors, Incoterm pricing, compliance docs';
    } else if (f.relPath.includes('CameraCaptureModal')) {
      desc = 'Webcam/mobile camera crop photo capture, AI quality grading (Grade A/B/C), Cloudinary upload, lot publishing';
    } else if (f.relPath.includes('DirectBuyModal')) {
      desc = 'Instant merchant purchase modal with escrow payment breakdown, transport dispatch, and net farmer payout';
    } else if (f.relPath.includes('FarmVisitsModal')) {
      desc = 'Merchant on-farm appointment scheduler: GPS location dispatch, date/slot picker, sample inspection tracking';
    } else if (f.relPath.includes('BuyerMarketplaceView')) {
      desc = 'Merchant marketplace with crop lot catalog, live bids, direct buy, farm visit booking, and verified farmer badges';
    } else if (f.relPath.includes('CropLotsAndPassportView')) {
      desc = 'Farmer lot management with digital crop passports, QR codes, blockchain-style audit trail, and visit requests';
    } else if (f.relPath.includes('MarketTerminalView')) {
      desc = 'Financial-terminal style dashboard: APMC ticker, gainers/losers, price volatility, Mandi depth';
    } else if (f.relPath.includes('MarketExplorerView')) {
      desc = 'Interactive Recharts time-series charts (1D to 5Y) with ARIMA forecasting overlays';
    } else if (f.relPath.includes('MarketComparisonView')) {
      desc = 'Inter-mandi arbitrage engine: comparing prices across mandis minus diesel/truck freight costs';
    } else if (f.relPath.includes('FarmerDecisionHeroView')) {
      desc = '"What should I do with my crop?" decision engine offering Sell, Store, or Transport recommendations';
    } else if (f.relPath.includes('FarmFinanceView')) {
      desc = 'Fintech dashboard: Kisan Credit Card (KCC) interest subvention and e-NWR warehouse pledge financing';
    } else if (f.relPath.includes('CropRecommendationView')) {
      desc = 'Agronomic AI advisory: soil NPK suitability, rainfall patterns, water requirements, and ROI forecast';
    } else if (f.relPath.includes('AskFarmAiView')) {
      desc = 'Conversational AI agronomist interface supporting text, voice, image upload, and multi-LLM execution';
    } else if (f.relPath.includes('LoginWelcomeScreen')) {
      desc = 'Modern agricultural authentication portal: Phone OTP, role selector (Farmer/Merchant/FPO), demo mode';
    } else if (f.relPath.includes('translations.ts')) {
      desc = 'Comprehensive trilingual dictionary (English, Hindi, Marathi) with 1,400+ lines of localized agricultural terminology';
    } else {
      desc = f.ext === '.ts' || f.ext === '.tsx' ? 'TypeScript component or utility module' : f.ext === '.sql' ? 'Relational SQL schema or migration' : f.ext === '.json' ? 'Configuration or manifest' : 'Static asset or configuration';
    }
    
    manifestDoc += `| [\`${f.relPath}\`](file:///${f.fullPath.replace(/\\/g, '/')}) | ${f.lines >= 0 ? f.lines : 'Binary'} | ${f.size.toLocaleString()} | ${desc} |\n`;
  });
  manifestDoc += '\n';
}

const manifestOutPath = path.join(projectRoot, 'ALL_PROJECT_FILES_MANIFEST.md');
fs.writeFileSync(manifestOutPath, manifestDoc, 'utf8');
console.log(`Wrote ${manifestOutPath} (${fs.statSync(manifestOutPath).size} bytes)`);

console.log('Done!');
