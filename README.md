# 🌾 KrishiMarket (कृषि मार्केट)

> **Transparent Agricultural Produce Intelligence & Digital Trade Platform**  
> Empowering Indian farmers and merchants with real-time AGMARKNET mandi rates, AI forecasting, digital quality passports, and one-tap farmer-friendly QR payment tracking.

---

## ✨ Key Features

1. **🌾 Farmer & Merchant Dashboards**
   - High-contrast, mobile-first interface designed for ease of use by farmers and FPO members.
   - Dual persona toggling: Farmer view (sell produce, track bids) and Merchant/Buyer view (procurement, verified listings).

2. **📈 Live Mandi Market Intelligence**
   - Real-time price tickers across major Indian commodities (Wheat, Soybean, Cotton, Onion, Tomato, Mustard).
   - Price spreads, arrivals volume, and historical volatility trends inspired by modern financial terminals.

3. **🤖 AI Price Forecast & Sell/Store Advisor**
   - 7-day predictive price movement models based on historical trends and seasonal arrivals.
   - Actionable decision support: **Sell Now**, **Store in Warehouse**, or **Monitor Trends**.

4. **📑 Digital Crop Passports & AI Quality Grading**
   - Camera crop scanning with simulated computer vision grading (Moisture, Foreign Matter, Grain Uniformity).
   - Transparent verification reports that build buyer trust and eliminate middleman price cuts.

5. **💳 QR Payment & Real-Time Payment Tracking**
   - **Farmer Flow:** Accept an offer, display a clear, high-contrast QR code for the buyer, and see live status:
     - `● Payment Pending` ➔ `✓ Payment Received` ➔ `✓ Completed`.
   - **Buyer Flow:** Fast `Scan & Pay` simulation with instant reference code generation (`PAY-XXXXXX`).
   - Clean, clutter-free payment cards with zero sensitive banking credentials collected.

6. **🌐 Trilingual Support**
   - Instant language switching across **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS, Glassmorphic dark UI, Lucide React icons
- **Visualizations:** Recharts interactive charts
- **Build Tool:** Vite 5
- **Deployment Ready:** Vercel SPA configuration (`vercel.json`)

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (comes with Node.js)

### Installation & Run

1. Clone or extract the project:
   ```bash
   cd krishimarket
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`

4. Build for production:
   ```bash
   npm run build
   ```

---

## ☁️ Deploying to Vercel

### Option 1: Deploy via GitHub (Recommended)
1. Push this project to a new repository on [GitHub](https://github.com/new).
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel automatically detects the framework preset as **Vite**:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Your site will be live on a `*.vercel.app` URL within 60 seconds!

### Option 2: Deploy with Vercel CLI
Run the following in the project root:
```bash
npx vercel
```
Follow the interactive prompts to log in and deploy. For production deployment:
```bash
npx vercel --prod
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
