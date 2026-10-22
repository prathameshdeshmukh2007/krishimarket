// ====================================================================
// KRISHIMARKET: GLOBAL TRADE MODULE TYPES
// Comprehensive types for International Agri Trade, Incoterms 2020,
// Verified Quotations, Net Return Calculator, and Compliance Tracking.
// ====================================================================

export type LanguageCode = 'en' | 'hi' | 'mr';

export type TradeCurrency = 'INR' | 'USD' | 'AED';

export type IncotermType = 
  | 'EXW' // Ex Works
  | 'FCA' // Free Carrier
  | 'FAS' // Free Alongside Ship
  | 'FOB' // Free on Board (Named Port of Shipment, e.g. Nhava Sheva)
  | 'CFR' // Cost and Freight
  | 'CIF' // Cost, Insurance and Freight (Named Port of Destination, e.g. Jebel Ali)
  | 'CPT' // Carriage Paid To
  | 'CIP' // Carriage and Insurance Paid To
  | 'DAP' // Delivered at Place
  | 'DPU' // Delivered at Place Unloaded
  | 'DDP'; // Delivered Duty Paid

export type UserTradeRole = 'farmer' | 'fpo_admin' | 'buyer' | 'exporter' | 'platform_admin';

export type ExportListingStatus = 
  | 'draft' 
  | 'published' 
  | 'negotiating' 
  | 'partially_allocated' 
  | 'fully_allocated' 
  | 'closed' 
  | 'cancelled';

export type QuoteStatus = 
  | 'pending_verification' 
  | 'verified' 
  | 'rejected_by_admin' 
  | 'under_review' 
  | 'accepted' 
  | 'countered' 
  | 'expired' 
  | 'cancelled';

export type TradeOrderStatus = 
  | 'confirmed_accepted' 
  | 'inspection_scheduled' 
  | 'inspection_passed' 
  | 'packing_in_progress' 
  | 'customs_cleared' 
  | 'shipped_in_transit' 
  | 'arrived_destination' 
  | 'delivered' 
  | 'completed_settled' 
  | 'cancelled' 
  | 'disputed';

// The 5 Strictly Separated Price Categories (No Mixing Permitted)
export type ObservationPriceCategory = 
  | 'verified_current_buyer_quotation'
  | 'verified_exporter_quotation'
  | 'historical_export_statistics'
  | 'domestic_mandi_reference_price'
  | 'indicative_estimate';

export interface MarketObservation {
  id: string;
  commodity: string;
  variety?: string;
  originState: string;
  originDistrict: string;
  originMandiOrPort: string;
  destinationCountry: string; // ISO 3166-1 alpha-3, e.g. 'ARE', 'IND'
  priceCategory: ObservationPriceCategory;
  rawPriceValue: number;
  rawPriceUnit: string; // e.g. '₹/Quintal', 'AED/MT', 'USD/kg'
  normalizedPricePerKgInr: number;
  currency: TradeCurrency;
  observationDate: string; // YYYY-MM-DD
  sourceId?: string;
  sourceAttribution: string; // e.g. 'Government of India / AGMARKNET' or 'APEDA AgriExchange'
  isDemoData: boolean;
  conversionMethod?: string;
  freshnessStatus: 'FRESH' | 'PREVIOUS_SESSION' | 'STALE';
  retrievedAt: string;
}

export interface DataSourceHealth {
  id: string;
  sourceCode: string;
  displayName: string;
  homepageUrl: string;
  reportingFrequency: string;
  isActive: boolean;
  lastSuccessfulSync?: string;
  lastFailureAt?: string;
  consecutiveFailures: number;
  healthStatus: 'HEALTHY' | 'STALE' | 'DEGRADED' | 'UNAVAILABLE';
  recordCount: number;
  attributionNotice: string;
}

export interface FxReferenceRate {
  baseCurrency: TradeCurrency;
  targetCurrency: TradeCurrency;
  rate: number;
  isPeggedReference: boolean; // true for AED/USD 3.6725
  sourceName: string;
  observationTimestamp: string;
  retrievedAt: string;
}

export interface ExportListing {
  id: string;
  listingCode: string; // e.g. 'KM-EXP-2026-ONION-001'
  sellerUserId: string;
  sellerName: string;
  sellerPhone: string;
  sellerOrganizationName?: string;
  commodity: string; // e.g. 'Onion'
  variety: string; // e.g. 'Nashik Red (Garwa)'
  grade: string; // e.g. 'Export Grade A+ (45mm - 55mm)'
  totalQuantityKg: number; // e.g. 1000
  availableQuantityKg: number;
  allocatedQuantityKg: number;
  minOrderQuantityKg: number;
  targetDestinationCountry: string; // 'ARE' (UAE)
  targetDestinationPort: string; // 'Jebel Ali Port, Dubai (AEJEA)'
  preferredIncoterm: IncotermType; // 'FOB' or 'CIF'
  preferredCurrency: TradeCurrency; // 'AED', 'USD', 'INR'
  indicativeFobPricePerKg?: number;
  originState: string; // 'Maharashtra'
  originDistrict: string; // 'Nashik'
  dispatchHubOrPort: string; // 'Nhava Sheva (JNPT Mumbai)'
  harvestDate: string;
  packagingDetails: string;
  expectedShrinkagePct: number; // Default 6.00%
  photoUrls: string[];
  status: ExportListingStatus;
  isDemo: boolean;
  createdAt: string;
}

export interface BuyerQuote {
  id: string;
  quoteNumber: string; // e.g. 'QUO-2026-UAE-0891'
  listingId: string;
  listingCode: string;
  buyerUserId: string;
  buyerName: string;
  buyerCompanyName: string;
  buyerCountry: string; // 'ARE'
  buyerTrustScore: number; // e.g. 96.5
  isBuyerVerified: boolean;
  quantityKg: number;
  offeredPricePerKg: number;
  currency: TradeCurrency;
  incoterm: IncotermType;
  namedPortOrPlace: string; // 'FOB Nhava Sheva (INNSA)'
  totalQuoteValue: number;
  paymentTerms: string;
  inspectionTerms: string;
  status: QuoteStatus;
  version: number;
  verifiedByAdminId?: string;
  verifiedAt?: string;
  adminVerificationNotes?: string;
  supportingEvidenceDocumentUrl?: string;
  issuedAt: string;
  validUntil: string;
  acceptedAt?: string;
  rejectionReason?: string;
}

export type CostCategory = 
  | 'sorting_grading'
  | 'packing_materials'
  | 'inland_transport'
  | 'loading_handling'
  | 'inspection_certification'
  | 'customs_clearance'
  | 'ocean_freight'
  | 'marine_insurance'
  | 'port_charges'
  | 'currency_conversion'
  | 'export_duty';

export interface ExportCostItem {
  id: string;
  category: CostCategory;
  displayTitle: string;
  payerParty: 'SELLER' | 'BUYER';
  amountCurrency: TradeCurrency;
  amount: number;
  amountInr: number;
  isEstimated: boolean;
  documentationRef?: string;
  note?: string;
}

export interface NetReturnCalculationInput {
  lotQuantityKg: number;
  shrinkageRejectionPct?: number; // e.g. 6.00%
  unitPrice: number;
  currency: TradeCurrency;
  incoterm: IncotermType;
  namedPortOrPlace: string;
  exchangeRateToInr: number;
  fxRateSource: string;
  fxRateTimestamp: string;
  costOverrides?: Partial<Record<CostCategory, number>>;
  productionCostPerKgInr?: number; // optional
}

export interface NetReturnCalculationResult {
  lotQuantityKg: number;
  shrinkageRejectionPct: number;
  shrinkageRejectionKg: number;
  saleableQuantityKg: number;
  unitPrice: number;
  currency: TradeCurrency;
  exchangeRateToInr: number;
  fxRateSource: string;
  fxRateTimestamp: string;
  incoterm: IncotermType;
  namedPortOrPlace: string;
  grossProceedsForeignCurrency: number;
  grossProceedsInr: number;
  itemizedCosts: ExportCostItem[];
  totalSellerDeductionsInr: number;
  netProceedsInr: number;
  netPerKgInr: number;
  productionCostPerKgInr?: number;
  estimatedFarmingProfitInr?: number;
  estimatedFarmingProfitPerKgInr?: number;
  calculatedAt: string;
  summarySentenceEn: string;
  summarySentenceHi: string;
  summarySentenceMr: string;
}

export interface ComplianceDocument {
  id: string;
  documentType: 
    | 'IEC_CERTIFICATE'
    | 'APEDA_RCMC'
    | 'COMMERCIAL_INVOICE'
    | 'PACKING_LIST'
    | 'PHYTOSANITARY'
    | 'BILL_OF_LADING'
    | 'CERTIFICATE_OF_ORIGIN'
    | 'UAE_FIRS_CUSTOMS_PERMIT'
    | 'SGS_INSPECTION_REPORT';
  displayName: string;
  issuingAuthority: string;
  status: 'REQUIRED' | 'UPLOADED' | 'VERIFIED' | 'EXEMPT';
  documentNumber?: string;
  fileUrl?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface PolicyCheckResult {
  commodity: string;
  country: string;
  exportPolicyStatus: 'FREE' | 'RESTRICTED' | 'PROHIBITED' | 'MINIMUM_EXPORT_PRICE_ACTIVE';
  mepAmountUsdPerMt?: number; // Minimum Export Price if active
  lastCheckedDate: string;
  officialNotificationRef: string;
  sourceUrl: string;
  reviewedByOfficer?: string;
  disclaimer: string;
}

export interface TradeOrder {
  id: string;
  orderNumber: string;
  listingId: string;
  acceptedQuoteId: string;
  sellerUserId: string;
  buyerUserId: string;
  sellerName: string;
  buyerCompanyName: string;
  commodity: string;
  quantityKg: number;
  contractPricePerKg: number;
  contractCurrency: TradeCurrency;
  incoterm: IncotermType;
  namedPortOrPlace: string;
  totalContractValueForeign: number;
  totalContractValueInr: number;
  status: TradeOrderStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  documents: ComplianceDocument[];
  events: Array<{
    id: string;
    newStatus: TradeOrderStatus;
    eventTitle: string;
    eventDescription: string;
    location?: string;
    recordedAt: string;
  }>;
}
