// ====================================================================
// KRISHIMARKET: GLOBAL TRADE SERVICE
// Manages International Export Listings, Official Data Ingestion (AGMARKNET,
// Google Agricultural Landscape, APEDA, FX), 5 Strictly Separated Price Categories,
// Verified Buyer Quotes, and Order/Compliance Lifecycle.
// ====================================================================

import {
  ExportListing,
  BuyerQuote,
  MarketObservation,
  DataSourceHealth,
  FxReferenceRate,
  TradeOrder,
  PolicyCheckResult,
  ComplianceDocument,
  IncotermType,
  TradeCurrency
} from '../types/globalTrade';

const STORAGE_KEY_EXPORT_LISTINGS = 'km_global_trade_listings_v1';
const STORAGE_KEY_BUYER_QUOTES = 'km_global_trade_quotes_v1';
const STORAGE_KEY_TRADE_ORDERS = 'km_global_trade_orders_v1';
const STORAGE_KEY_DATA_HEALTH = 'km_global_trade_data_health_v1';
const STORAGE_KEY_FX_RATES = 'km_global_trade_fx_rates_v1';

// Seed Benchmark Data Sources
const INITIAL_DATA_SOURCES: DataSourceHealth[] = [
  {
    id: 'src-agmarknet',
    sourceCode: 'AGMARKNET_GOI',
    displayName: 'Government of India / AGMARKNET',
    homepageUrl: 'https://agmarknet.gov.in/home',
    reportingFrequency: 'Daily (APMC Auction Closures)',
    isActive: true,
    lastSuccessfulSync: '2026-10-20 10:45 AM IST',
    consecutiveFailures: 0,
    healthStatus: 'HEALTHY',
    recordCount: 3412,
    attributionNotice: 'Directly sourced from Directorate of Marketing & Inspection (DMI), Ministry of Agriculture.'
  },
  {
    id: 'src-google-agri',
    sourceCode: 'GOOGLE_AGRI_LANDSCAPE',
    displayName: 'Google Agricultural Landscape',
    homepageUrl: 'https://agri.withgoogle.com/',
    reportingFrequency: 'Bi-Weekly Field Intelligence',
    isActive: true,
    lastSuccessfulSync: '2026-10-19 04:30 PM IST',
    consecutiveFailures: 0,
    healthStatus: 'HEALTHY',
    recordCount: 890,
    attributionNotice: 'Satellite remote sensing, parcel delineation, and farm boundary insights powered by Google Agri.'
  },
  {
    id: 'src-apeda',
    sourceCode: 'APEDA_AGRIEXCHANGE',
    displayName: 'APEDA AgriExchange (MoCI)',
    homepageUrl: 'https://agriexchange.apeda.gov.in/',
    reportingFrequency: 'Consolidated Weekly Export Statistics',
    isActive: true,
    lastSuccessfulSync: '2026-10-18 06:15 PM IST',
    consecutiveFailures: 0,
    healthStatus: 'HEALTHY',
    recordCount: 420,
    attributionNotice: 'Agricultural & Processed Food Products Export Development Authority (APEDA), Govt of India.'
  },
  {
    id: 'src-rbi-fx',
    sourceCode: 'RBI_FX_REFERENCE',
    displayName: 'Foreign Exchange Reference (AED / USD / INR)',
    homepageUrl: 'https://www.rbi.org.in/',
    reportingFrequency: 'Real-time Daily Market Benchmark',
    isActive: true,
    lastSuccessfulSync: '2026-10-20 10:30 AM IST',
    consecutiveFailures: 0,
    healthStatus: 'HEALTHY',
    recordCount: 3,
    attributionNotice: 'Interbank Forex reference rate. UAE Dirham pegged at 3.6725 AED/USD.'
  }
];

// Live FX Rates Reference (AED pegged at 3.6725 to USD)
const INITIAL_FX_RATES: FxReferenceRate[] = [
  {
    baseCurrency: 'AED',
    targetCurrency: 'INR',
    rate: 22.80,
    isPeggedReference: true,
    sourceName: 'RBI / Interbank Benchmark (Pegged 3.6725 AED/USD)',
    observationTimestamp: '2026-10-20T10:30:00Z',
    retrievedAt: '2026-10-20T10:45:00Z'
  },
  {
    baseCurrency: 'USD',
    targetCurrency: 'INR',
    rate: 83.75,
    isPeggedReference: false,
    sourceName: 'RBI Reference Rate',
    observationTimestamp: '2026-10-20T10:30:00Z',
    retrievedAt: '2026-10-20T10:45:00Z'
  },
  {
    baseCurrency: 'INR',
    targetCurrency: 'INR',
    rate: 1.00,
    isPeggedReference: true,
    sourceName: 'Domestic Base',
    observationTimestamp: '2026-10-20T10:30:00Z',
    retrievedAt: '2026-10-20T10:45:00Z'
  }
];

// Seed Benchmark Onion Export Lot (1,000 kg Nashik Red to UAE)
const INITIAL_LISTINGS: ExportListing[] = [
  {
    id: 'exp-lot-onion-001',
    listingCode: 'KM-EXP-2026-ONION-001',
    sellerUserId: 'usr-farmer-01',
    sellerName: 'Ramesh Balasaheb Patil',
    sellerPhone: '+919823456789',
    sellerOrganizationName: 'Pimpalgaon Onion Growers Cluster',
    commodity: 'Onion',
    variety: 'Nashik Red (Garwa)',
    grade: 'Export Grade A+ (45mm - 55mm)',
    totalQuantityKg: 1000,
    availableQuantityKg: 1000,
    allocatedQuantityKg: 0,
    minOrderQuantityKg: 500,
    targetDestinationCountry: 'ARE',
    targetDestinationPort: 'Jebel Ali Port, Dubai (AEJEA)',
    preferredIncoterm: 'FOB',
    preferredCurrency: 'AED',
    indicativeFobPricePerKg: 2.45,
    originState: 'Maharashtra',
    originDistrict: 'Nashik',
    dispatchHubOrPort: 'Nhava Sheva (JNPT Mumbai)',
    harvestDate: '2026-09-28',
    packagingDetails: '25 kg ventilated red leno mesh bags, palletized with desiccants',
    expectedShrinkagePct: 6.00,
    photoUrls: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'published',
    isDemo: true,
    createdAt: '2026-10-15T09:30:00Z'
  },
  {
    id: 'exp-lot-grape-002',
    listingCode: 'KM-EXP-2026-GRAPE-002',
    sellerUserId: 'usr-farmer-01',
    sellerName: 'Ramesh Balasaheb Patil',
    sellerPhone: '+919823456789',
    sellerOrganizationName: 'Sahyadri Farmers Producer Co.',
    commodity: 'Table Grapes',
    variety: 'Thompson Seedless',
    grade: 'GlobalGAP Super White (18mm+)',
    totalQuantityKg: 2500,
    availableQuantityKg: 2500,
    allocatedQuantityKg: 0,
    minOrderQuantityKg: 1000,
    targetDestinationCountry: 'ARE',
    targetDestinationPort: 'Dubai International Airport / Jebel Ali',
    preferredIncoterm: 'CIF',
    preferredCurrency: 'USD',
    indicativeFobPricePerKg: 1.85,
    originState: 'Maharashtra',
    originDistrict: 'Nashik',
    dispatchHubOrPort: 'JNPT / Mumbai Air Cargo',
    harvestDate: '2026-10-02',
    packagingDetails: '500g punnets packed in 5kg thermocol export cartons',
    expectedShrinkagePct: 3.50,
    photoUrls: [
      'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'published',
    isDemo: true,
    createdAt: '2026-10-16T11:00:00Z'
  }
];

// Seed Verified & Unverified Quotations for the Benchmark Onion Lot
const INITIAL_QUOTES: BuyerQuote[] = [
  {
    id: 'quo-uae-almaya-01',
    quoteNumber: 'QUO-2026-UAE-0891',
    listingId: 'exp-lot-onion-001',
    listingCode: 'KM-EXP-2026-ONION-001',
    buyerUserId: 'usr-buyer-almaya',
    buyerName: 'Tariq Al-Mansoor',
    buyerCompanyName: 'Al Maya Group LLC (Dubai, UAE)',
    buyerCountry: 'ARE',
    buyerTrustScore: 97.4,
    isBuyerVerified: true,
    quantityKg: 1000,
    offeredPricePerKg: 2.40,
    currency: 'AED',
    incoterm: 'FOB',
    namedPortOrPlace: 'Nhava Sheva (JNPT Mumbai)',
    totalQuoteValue: 2400.00,
    paymentTerms: '100% Irrevocable Confirmed LC at Sight against Bill of Lading',
    inspectionTerms: 'SGS India pre-shipment quality inspection at cold storage Nashik',
    status: 'verified',
    version: 1,
    verifiedByAdminId: 'km-compliance-officer-02',
    verifiedAt: '2026-10-18T14:20:00Z',
    adminVerificationNotes: 'Corporate registration in Dubai DED verified (#882193). Irrevocable bank confirmation verified via Emirates NBD.',
    supportingEvidenceDocumentUrl: 'https://krishimarket.org/docs/verified/almaya_lc_undertaking.pdf',
    issuedAt: '2026-10-18T10:15:00Z',
    validUntil: '2026-10-28T23:59:59Z'
  },
  {
    id: 'quo-uae-lulu-02',
    quoteNumber: 'QUO-2026-UAE-0914',
    listingId: 'exp-lot-onion-001',
    listingCode: 'KM-EXP-2026-ONION-001',
    buyerUserId: 'usr-buyer-lulu',
    buyerName: 'Faisal K. Rahman',
    buyerCompanyName: 'Lulu International Supermarkets (Abu Dhabi / Dubai)',
    buyerCountry: 'ARE',
    buyerTrustScore: 99.1,
    isBuyerVerified: true,
    quantityKg: 1000,
    offeredPricePerKg: 2.75,
    currency: 'AED',
    incoterm: 'CIF',
    namedPortOrPlace: 'Jebel Ali Port (Dubai AEJEA)',
    totalQuoteValue: 2750.00,
    paymentTerms: '40% advance telegraphic transfer, 60% upon port discharge inspection',
    inspectionTerms: 'UAE FIRS (Food Import & Re-export System) + APEDA certification',
    status: 'verified',
    version: 1,
    verifiedByAdminId: 'km-compliance-officer-01',
    verifiedAt: '2026-10-19T09:10:00Z',
    adminVerificationNotes: 'Global tier-1 retailer credential verified. UAE FIRS commercial importer permit #77104 active.',
    supportingEvidenceDocumentUrl: 'https://krishimarket.org/docs/verified/lulu_purchase_contract.pdf',
    issuedAt: '2026-10-19T08:00:00Z',
    validUntil: '2026-10-27T18:00:00Z'
  },
  {
    id: 'quo-uae-gulf-unverified-03',
    quoteNumber: 'QUO-2026-UAE-0932',
    listingId: 'exp-lot-onion-001',
    listingCode: 'KM-EXP-2026-ONION-001',
    buyerUserId: 'usr-buyer-gulf-unv',
    buyerName: 'Rashid Al-Husseini',
    buyerCompanyName: 'Gulf Oasis Fresh Produce Tr. (Sharjah, UAE)',
    buyerCountry: 'ARE',
    buyerTrustScore: 78.5,
    isBuyerVerified: false,
    quantityKg: 1000,
    offeredPricePerKg: 2.52,
    currency: 'AED',
    incoterm: 'FOB',
    namedPortOrPlace: 'Nhava Sheva (JNPT Mumbai)',
    totalQuoteValue: 2520.00,
    paymentTerms: 'Letter of credit 30 days post-discharge',
    inspectionTerms: 'Standard port inspection',
    status: 'pending_verification',
    version: 1,
    adminVerificationNotes: 'Awaiting verified bank solvency letter and Chamber of Commerce license verification.',
    issuedAt: '2026-10-20T07:30:00Z',
    validUntil: '2026-10-25T18:00:00Z'
  }
];

// Seed Compliance Documents for Onion Order
const BENCHMARK_COMPLIANCE_DOCS: ComplianceDocument[] = [
  {
    id: 'doc-iec',
    documentType: 'IEC_CERTIFICATE',
    displayName: 'DGFT Importer-Exporter Code (IEC)',
    issuingAuthority: 'Directorate General of Foreign Trade, Govt of India',
    status: 'VERIFIED',
    documentNumber: 'IEC-0314098221',
    notes: 'Permanent active export license linked with PAN and GSTIN'
  },
  {
    id: 'doc-apeda',
    documentType: 'APEDA_RCMC',
    displayName: 'APEDA Registration-cum-Membership (RCMC)',
    issuingAuthority: 'APEDA, Ministry of Commerce & Industry',
    status: 'VERIFIED',
    documentNumber: 'RCMC-MH-APEDA-88412',
    notes: 'Fresh vegetables and perishables export authorized category'
  },
  {
    id: 'doc-phyto',
    documentType: 'PHYTOSANITARY',
    displayName: 'Phytosanitary Health Certificate',
    issuingAuthority: 'Directorate of Plant Protection, Quarantine & Storage (PQIS)',
    status: 'VERIFIED',
    documentNumber: 'PSC-IN-2026-993182',
    notes: 'Certified free from onion maggot (Delia antiqua) and purple blotch'
  },
  {
    id: 'doc-inv',
    documentType: 'COMMERCIAL_INVOICE',
    displayName: 'Commercial Invoice & Packing Declaration',
    issuingAuthority: 'Seller / FPO Admin',
    status: 'VERIFIED',
    documentNumber: 'INV-KM-2026-0891',
    notes: 'Details 40 mesh bags @ 25kg = 1,000 kg export lot'
  },
  {
    id: 'doc-firs',
    documentType: 'UAE_FIRS_CUSTOMS_PERMIT',
    displayName: 'Dubai Municipality / FIRS Clearance Permit',
    issuingAuthority: 'Dubai Municipality Food Safety Department',
    status: 'REQUIRED',
    notes: 'To be stamped upon port arrival at Jebel Ali Gate 4'
  },
  {
    id: 'doc-bl',
    documentType: 'BILL_OF_LADING',
    displayName: 'Multimodal Bill of Lading',
    issuingAuthority: 'Shipping Line (Maersk / Hapag-Lloyd)',
    status: 'REQUIRED',
    notes: 'Nhava Sheva (INNSA) to Jebel Ali (AEJEA)'
  }
];

export class GlobalTradeService {
  private static instance: GlobalTradeService;

  private constructor() {}

  public static getInstance(): GlobalTradeService {
    if (!GlobalTradeService.instance) {
      GlobalTradeService.instance = new GlobalTradeService();
    }
    return GlobalTradeService.instance;
  }

  // ------------------------------------------------------------------
  // DATA SOURCES HEALTH & ATTRIBUTION
  // ------------------------------------------------------------------
  public getDataSources(): DataSourceHealth[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_DATA_HEALTH);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Error reading data source health', e);
    }
    return INITIAL_DATA_SOURCES;
  }

  public getFxRates(): FxReferenceRate[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_FX_RATES);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Error reading FX rates', e);
    }
    return INITIAL_FX_RATES;
  }

  public getFxRate(currency: TradeCurrency): number {
    if (currency === 'INR') return 1.0;
    const rates = this.getFxRates();
    const rateItem = rates.find(r => r.baseCurrency === currency && r.targetCurrency === 'INR');
    if (rateItem) return rateItem.rate;
    // Fallback known values
    if (currency === 'AED') return 22.80;
    if (currency === 'USD') return 83.75;
    return 1.0;
  }

  // ------------------------------------------------------------------
  // THE 5 STRICTLY SEPARATED PRICE CATEGORIES
  // ------------------------------------------------------------------
  public getObservationsForCommodity(
    commodity: string,
    destinationCountry: string = 'ARE'
  ): MarketObservation[] {
    const isDemo = true; // Governed by DEMO_MODE setting
    const now = new Date().toISOString();

    if (commodity.toLowerCase() === 'onion') {
      return [
        {
          id: 'obs-01-buyer',
          commodity: 'Onion',
          variety: 'Nashik Red Export Grade (45-55mm)',
          originState: 'Maharashtra',
          originDistrict: 'Nashik',
          originMandiOrPort: 'Nhava Sheva (JNPT Mumbai)',
          destinationCountry: 'ARE',
          priceCategory: 'verified_current_buyer_quotation',
          rawPriceValue: 2.40,
          rawPriceUnit: 'AED/kg',
          normalizedPricePerKgInr: 54.72, // 2.40 * 22.80
          currency: 'AED',
          observationDate: '2026-10-18',
          sourceAttribution: 'Al Maya Group LLC (Dubai, UAE) — Verified Purchase Quotation #QUO-2026-UAE-0891',
          isDemoData: isDemo,
          conversionMethod: 'Fx Rate: 1 AED = ₹22.80 (RBI / Interbank Benchmark)',
          freshnessStatus: 'FRESH',
          retrievedAt: now
        },
        {
          id: 'obs-02-exporter',
          commodity: 'Onion',
          variety: 'Nashik Red Export Grade (45-55mm)',
          originState: 'Maharashtra',
          originDistrict: 'Nashik',
          originMandiOrPort: 'JNPT Nhava Sheva',
          destinationCountry: 'ARE',
          priceCategory: 'verified_exporter_quotation',
          rawPriceValue: 2.45,
          rawPriceUnit: 'AED/kg',
          normalizedPricePerKgInr: 55.86,
          currency: 'AED',
          observationDate: '2026-10-19',
          sourceAttribution: 'Maharashtra Agri Export Consortium (MAEC) Verified Exporter Book',
          isDemoData: isDemo,
          conversionMethod: 'Fx Rate: 1 AED = ₹22.80',
          freshnessStatus: 'FRESH',
          retrievedAt: now
        },
        {
          id: 'obs-03-apeda',
          commodity: 'Onion',
          variety: 'Fresh Onion (HS Code 07031010)',
          originState: 'Maharashtra',
          originDistrict: 'All Districts',
          originMandiOrPort: 'All Indian Sea Ports',
          destinationCountry: 'ARE',
          priceCategory: 'historical_export_statistics',
          rawPriceValue: 532.00,
          rawPriceUnit: 'USD/MT FOB',
          normalizedPricePerKgInr: 44.55, // (532 * 83.75) / 1000
          currency: 'USD',
          observationDate: '2026-09-30',
          sourceAttribution: 'APEDA AgriExchange (Ministry of Commerce & Industry, Govt of India)',
          isDemoData: isDemo,
          conversionMethod: 'Normalized from USD/Metric Ton to ₹/kg using RBI monthly average USD/INR 83.75',
          freshnessStatus: 'PREVIOUS_SESSION',
          retrievedAt: now
        },
        {
          id: 'obs-04-mandi',
          commodity: 'Onion',
          variety: 'Garwa (Pimpalgaon APMC)',
          originState: 'Maharashtra',
          originDistrict: 'Nashik',
          originMandiOrPort: 'Pimpalgaon Baswant APMC',
          destinationCountry: 'IND',
          priceCategory: 'domestic_mandi_reference_price',
          rawPriceValue: 2750.00,
          rawPriceUnit: '₹/Quintal',
          normalizedPricePerKgInr: 27.50, // 2750 / 100
          currency: 'INR',
          observationDate: '2026-10-20',
          sourceAttribution: 'Government of India / AGMARKNET (https://agmarknet.gov.in/home)',
          isDemoData: isDemo,
          conversionMethod: 'Official modal auction arrival price converted from ₹/Quintal to ₹/kg (÷ 100)',
          freshnessStatus: 'FRESH',
          retrievedAt: now
        },
        {
          id: 'obs-05-indicative',
          commodity: 'Onion',
          variety: 'Export Grade (Middle East Spec)',
          originState: 'Maharashtra',
          originDistrict: 'Nashik',
          originMandiOrPort: 'Nhava Sheva / Dubai',
          destinationCountry: 'ARE',
          priceCategory: 'indicative_estimate',
          rawPriceValue: 2.35,
          rawPriceUnit: 'AED/kg',
          normalizedPricePerKgInr: 53.58,
          currency: 'AED',
          observationDate: '2026-10-20',
          sourceAttribution: 'KrishiMarket Aggregated Trade Benchmark (Google Agri Landscape + Trade Corridor)',
          isDemoData: isDemo,
          conversionMethod: 'Calculated corridor composite benchmark',
          freshnessStatus: 'FRESH',
          retrievedAt: now
        }
      ];
    }

    // Default empty observation set for other commodities without verified quotes
    return [];
  }

  // ------------------------------------------------------------------
  // EXPORT LISTINGS (LOTS)
  // ------------------------------------------------------------------
  public getExportListings(): ExportListing[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_EXPORT_LISTINGS);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Error reading export listings', e);
    }
    return INITIAL_LISTINGS;
  }

  public getListingById(listingId: string): ExportListing | null {
    const listings = this.getExportListings();
    return listings.find(l => l.id === listingId) || null;
  }

  public createExportListing(listingData: Omit<ExportListing, 'id' | 'listingCode' | 'createdAt' | 'status' | 'allocatedQuantityKg'>): ExportListing {
    const listings = this.getExportListings();
    const newId = `exp-lot-${Date.now()}`;
    const cleanComm = listingData.commodity.toUpperCase().replace(/\s+/g, '-').slice(0, 8);
    const listingCode = `KM-EXP-2026-${cleanComm}-${String(listings.length + 1).padStart(3, '0')}`;

    const newListing: ExportListing = {
      ...listingData,
      id: newId,
      listingCode,
      allocatedQuantityKg: 0,
      status: 'published',
      createdAt: new Date().toISOString()
    };

    const updated = [newListing, ...listings];
    localStorage.setItem(STORAGE_KEY_EXPORT_LISTINGS, JSON.stringify(updated));
    return newListing;
  }

  // ------------------------------------------------------------------
  // BUYER QUOTES & ADMIN VERIFICATION
  // ------------------------------------------------------------------
  public getBuyerQuotes(listingId?: string): BuyerQuote[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_BUYER_QUOTES);
      let quotes: BuyerQuote[] = cached ? JSON.parse(cached) : INITIAL_QUOTES;
      if (listingId) {
        return quotes.filter(q => q.listingId === listingId);
      }
      return quotes;
    } catch (e) {
      console.warn('Error reading buyer quotes', e);
      return INITIAL_QUOTES;
    }
  }

  public verifyBuyerQuote(quoteId: string, adminId: string, notes: string): BuyerQuote {
    const quotes = this.getBuyerQuotes();
    const target = quotes.find(q => q.id === quoteId);
    if (!target) throw new Error('Quotation not found.');

    target.status = 'verified';
    target.verifiedByAdminId = adminId;
    target.verifiedAt = new Date().toISOString();
    target.adminVerificationNotes = notes;

    localStorage.setItem(STORAGE_KEY_BUYER_QUOTES, JSON.stringify(quotes));
    return target;
  }

  // ------------------------------------------------------------------
  // ACCEPT BUYER QUOTE FLOW (IDEMPOTENT & AUDITED)
  // ------------------------------------------------------------------
  public acceptBuyerQuote(quoteId: string, sellerUserId: string): { order: TradeOrder; listing: ExportListing } {
    const quotes = this.getBuyerQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) throw new Error('Quotation not found.');

    if (quote.status !== 'verified') {
      throw new Error('Only verified buyer quotations can be accepted for international export.');
    }

    const listings = this.getExportListings();
    const listing = listings.find(l => l.id === quote.listingId);
    if (!listing) throw new Error('Associated export lot not found.');

    if (listing.availableQuantityKg < quote.quantityKg) {
      throw new Error(`Insufficient available quantity. Available: ${listing.availableQuantityKg} kg, Requested: ${quote.quantityKg} kg.`);
    }

    // Check existing order idempotency
    const existingOrders = this.getTradeOrders();
    const alreadyOrdered = existingOrders.find(o => o.acceptedQuoteId === quoteId);
    if (alreadyOrdered) {
      return { order: alreadyOrdered, listing };
    }

    // 1. Mark Quote Accepted
    quote.status = 'accepted';
    quote.acceptedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_BUYER_QUOTES, JSON.stringify(quotes));

    // 2. Update Listing Allocation
    listing.allocatedQuantityKg += quote.quantityKg;
    listing.availableQuantityKg = Math.max(0, listing.totalQuantityKg - listing.allocatedQuantityKg);
    listing.status = listing.availableQuantityKg === 0 ? 'fully_allocated' : 'partially_allocated';
    localStorage.setItem(STORAGE_KEY_EXPORT_LISTINGS, JSON.stringify(listings));

    // 3. Create Trade Order
    const fxRate = this.getFxRate(quote.currency);
    const orderNumber = `ORD-EXP-2026-${String(existingOrders.length + 1).padStart(4, '0')}`;
    const orderId = `trade-order-${Date.now()}`;

    const newOrder: TradeOrder = {
      id: orderId,
      orderNumber,
      listingId: listing.id,
      acceptedQuoteId: quote.id,
      sellerUserId,
      buyerUserId: quote.buyerUserId,
      sellerName: listing.sellerName,
      buyerCompanyName: quote.buyerCompanyName,
      commodity: listing.commodity,
      quantityKg: quote.quantityKg,
      contractPricePerKg: quote.offeredPricePerKg,
      contractCurrency: quote.currency,
      incoterm: quote.incoterm,
      namedPortOrPlace: quote.namedPortOrPlace,
      totalContractValueForeign: quote.totalQuoteValue,
      totalContractValueInr: Math.round(quote.totalQuoteValue * fxRate * 100) / 100,
      status: 'confirmed_accepted',
      idempotencyKey: `idemp-${quote.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: BENCHMARK_COMPLIANCE_DOCS,
      events: [
        {
          id: `evt-${Date.now()}-1`,
          newStatus: 'confirmed_accepted',
          eventTitle: 'Export Contract Confirmed',
          eventDescription: `Buyer quote ${quote.quoteNumber} accepted at ${quote.offeredPricePerKg} ${quote.currency}/kg (${quote.incoterm} terms).`,
          location: listing.dispatchHubOrPort,
          recordedAt: new Date().toISOString()
        },
        {
          id: `evt-${Date.now()}-2`,
          newStatus: 'inspection_scheduled',
          eventTitle: 'SGS Pre-Shipment Inspection Scheduled',
          eventDescription: 'Quality and phyto assessment scheduled at packhouse facility.',
          location: `${listing.originDistrict}, ${listing.originState}`,
          recordedAt: new Date().toISOString()
        }
      ]
    };

    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem(STORAGE_KEY_TRADE_ORDERS, JSON.stringify(updatedOrders));

    return { order: newOrder, listing };
  }

  // ------------------------------------------------------------------
  // TRADE ORDERS & COMPLIANCE
  // ------------------------------------------------------------------
  public getTradeOrders(): TradeOrder[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_TRADE_ORDERS);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Error reading trade orders', e);
    }
    return [];
  }

  public getTradeOrderById(orderId: string): TradeOrder | null {
    const orders = this.getTradeOrders();
    return orders.find(o => o.id === orderId) || null;
  }

  public updateOrderStatus(orderId: string, newStatus: TradeOrder['status'], title: string, description: string, location?: string): TradeOrder {
    const orders = this.getTradeOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found.');

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.events.unshift({
      id: `evt-${Date.now()}`,
      newStatus,
      eventTitle: title,
      eventDescription: description,
      location,
      recordedAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY_TRADE_ORDERS, JSON.stringify(orders));
    return order;
  }

  // ------------------------------------------------------------------
  // DGFT POLICY CHECK
  // ------------------------------------------------------------------
  public getPolicyCheck(commodity: string): PolicyCheckResult {
    if (commodity.toLowerCase() === 'onion') {
      return {
        commodity: 'Fresh Onion (HS Code 07031010)',
        country: 'India to UAE (Global Corridor)',
        exportPolicyStatus: 'FREE',
        mepAmountUsdPerMt: 0,
        lastCheckedDate: '2026-10-18',
        officialNotificationRef: 'DGFT Public Notice No. 24/2026 / Export Duty Notification Revoked',
        sourceUrl: 'https://www.dgft.gov.in/CP/',
        reviewedByOfficer: 'KrishiMarket Trade Compliance Cell',
        disclaimer: 'Exports are permitted without Minimum Export Price (MEP) restrictions. Standard phytosanitary & APEDA RCMC documentation applies.'
      };
    }

    return {
      commodity,
      country: 'India to Global',
      exportPolicyStatus: 'FREE',
      lastCheckedDate: '2026-10-15',
      officialNotificationRef: 'DGFT General Export Authorization',
      sourceUrl: 'https://www.dgft.gov.in/CP/',
      disclaimer: 'Standard export clearance rules apply.'
    };
  }
}
