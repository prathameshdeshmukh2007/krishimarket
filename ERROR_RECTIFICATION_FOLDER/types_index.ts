export type UserRole = 'farmer' | 'buyer' | 'fpo' | 'inspector' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'mr';

export type CropCategory = 'vegetable' | 'fruit' | 'grain' | 'pulse';

export type LotStatus = 
  | 'draft' 
  | 'active' 
  | 'buyer_interest' 
  | 'inspection_requested' 
  | 'inspection_complete' 
  | 'offer_received' 
  | 'accepted' 
  | 'logistics' 
  | 'completed' 
  | 'cancelled';

export type QualityGrade = 'Grade A+' | 'Grade A' | 'Grade B' | 'Grade C' | 'Ungraded';

export type SignalType = 'positive' | 'stable' | 'downward_pressure' | 'high_volatility';

export type DecisionAction = 'SELL_NOW' | 'WAIT' | 'PARTIAL_SELL';

export type SellStoreRecommendationAction = 'SELL_NOW' | 'STORE' | 'MONITOR';

export type DemandLevel = 'HIGH' | 'MODERATE' | 'LOW';

export type ArrivalsLevel = 'HIGH_INFLOW' | 'NORMAL' | 'LOW_SUPPLY';

export type PriceTrendDirection = 'RISING' | 'FALLING' | 'STABLE';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface PricePoint {
  dayLabel: string;
  date: string;
  price: number; // ₹/quintal
  pricePerKg: number; // ₹/kg
  isHistorical?: boolean;
  isCurrent?: boolean;
  isProjected?: boolean;
  expectedMinPrice?: number;
  expectedMaxPrice?: number;
  expectedMinPricePerKg?: number;
  expectedMaxPricePerKg?: number;
}

export interface SellStoreAnalysisInput {
  cropName: string;
  variety?: string;
  currentPricePerQ: number; // in ₹/quintal
  historicalPricesPerQ: number[]; // past 7-14 days prices in ₹/quintal
  priceTrend: PriceTrendDirection;
  marketArrivals: ArrivalsLevel;
  buyerDemand: DemandLevel;
  storageAvailable: boolean;
  storageType?: 'Cold Storage' | 'Dry Warehouse' | 'On-Farm Covered Shed' | 'None';
  storageCostPerDayPerQ: number; // ₹/quintal/day
  expectedSellingPeriodDays: number; // e.g., 7, 14, 30 days
  perishable: boolean;
  shelfLifeDays: number;
}

export interface SellStoreAnalysisResult {
  cropName: string;
  variety: string;
  currentPricePerQ: number;
  currentPricePerKg: number;
  expectedMinPricePerQ: number;
  expectedMaxPricePerQ: number;
  expectedMinPricePerKg: number;
  expectedMaxPricePerKg: number;
  recommendation: SellStoreRecommendationAction;
  suggestedSellingWindow: string; // e.g. "7–10 days" or "Immediate (1–2 days)"
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  whyRecommendation: string;
  keyDrivers: Array<{
    title: string;
    description: string;
    impact: 'POSITIVE_FOR_HOLDING' | 'FAVORS_SELLING_NOW' | 'NEUTRAL_WAIT';
  }>;
  storageEconomics: {
    holdingDays: number;
    totalStorageCostPerQ: number;
    totalStorageCostPerKg: number;
    expectedGrossGainPerQ: number;
    expectedGrossGainPerKg: number;
    expectedNetBenefitPerQ: number;
    expectedNetBenefitPerKg: number;
    isEconomicallyViable: boolean;
  };
  trendChartData: PricePoint[];
  disclaimer: string;
  isSampleData: boolean;
}

export interface Commodity {
  id: string;
  name: string;
  hindiName: string;
  marathiName: string;
  category: CropCategory;
  standardUnit: string;
  shelfLifeDays: number;
  isPerishable: boolean;
  defaultGrade: QualityGrade;
  icon: string;
}

export interface APMCMarket {
  id: string;
  name: string;
  code: string;
  apmcName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  isMajorHub: boolean;
  dailyVolumeTier: 'Tier-1' | 'Tier-2' | 'Tier-3';
}

export interface MarketPriceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  state: string;
  district: string;
  market: string;
  marketId?: string;
  commodity: string;
  commodityId?: string;
  variety: string;
  grade: string;
  minPrice: number; // ₹/quintal
  maxPrice: number; // ₹/quintal
  modalPrice: number; // ₹/quintal
  arrivalQuantity: number; // Tonnes or Quintals
  unit: string;
  source: string;
  sourceUrl?: string;
  dataTimestamp: string;
  fetchedAt: string;
  isDemo?: boolean;
  priceChange1D?: number;
  priceChangePct1D?: number;
}

export interface AgriMarketIndex {
  code: string;
  name: string;
  subtitle: string;
  value: number;
  change1D: number;
  changePct1D: number;
  change7D: number;
  change30D: number;
  methodology: string;
  lastUpdated: string;
  constituents: Array<{
    commodity: string;
    weightPct: number;
    modalPrice: number;
    changePct: number;
  }>;
}

export interface PriceForecast {
  commodity: string;
  market: string;
  variety: string;
  generatedDate: string;
  horizonDays: 3 | 7;
  forecastDate: string;
  predictedMinPrice: number;
  predictedMaxPrice: number;
  predictedModalPrice: number;
  confidencePercentage: number;
  modelName: string;
  featuresUsed: string[];
  disclaimer: string;
}

export interface MarketSignal {
  commodity: string;
  market: string;
  signalType: SignalType;
  strengthScore: number; // 0-100
  reasons: string[];
  priceDeviation30dPct: number;
  arrivalTrendDirection: 'RISING' | 'FALLING' | 'STABLE';
  volatilityIndex: number;
  generatedAt: string;
}

export interface DecisionEngineResult {
  action: DecisionAction;
  sellPercentage: number;
  holdPercentage: number;
  recommendedHoldDays?: number;
  expectedNetRealisationPerQ: number;
  currentModalPricePerQ: number;
  projectedFuturePricePerQ?: number;
  reasons: string[];
  risks: string[];
  breakdown: {
    grossSaleValue: number;
    estimatedTransportCost: number;
    estimatedStorageCost: number;
    estimatedHandlingCost: number;
    netRealisationTotal: number;
  };
  storageArbitrage?: {
    storageDays: number;
    dailyStorageCostPerQ: number;
    totalHoldingCostPerQ: number;
    breakevenPricePerQ: number;
    netBenefitPerQ: number;
  };
}

export interface AIAssessment {
  id: string;
  lotId?: string;
  cropIdentified: string;
  confidenceScore: number;
  colorUniformityPct: number;
  maturityIndexPct: number;
  visibleDefectsPct: number;
  recommendedGrade: QualityGrade;
  disclaimer: string;
  assessmentNotes: string[];
  assessedAt: string;
}

export interface PassportTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  category: 'CREATION' | 'AI_SCAN' | 'INSPECTION' | 'OFFER' | 'LOGISTICS' | 'PAYMENT' | 'FARM_VISIT';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  verifiedHash?: string;
}

export interface CropLot {
  id: string;
  lotCode: string; // #AGRI-2026-NASH-0421
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  state: string;
  district: string;
  village: string;
  commodity: string;
  variety: string;
  quantityQuintals: number;
  expectedHarvestDate: string;
  status: LotStatus;
  expectedPricePerQ: number;
  minAcceptablePricePerQ: number;
  storageAvailable: boolean;
  storageCostPerDayPerQ: number;
  verifiedGrade: QualityGrade;
  aiPreliminaryGrade: QualityGrade;
  aiAssessment?: AIAssessment;
  photos: string[];
  passportEvents: PassportTimelineEvent[];
  offersCount: number;
  bestOfferPerQ?: number;
  createdAt: string;
  isAggregatedFpo?: boolean;
  fpoContributors?: Array<{ farmerName: string; quantityQ: number }>;
  farmAddress?: string;
  farmCoordinates?: { lat: number; lng: number };
}

export interface BuyerOffer {
  id: string;
  lotId: string;
  lotCode: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerType: 'Processor' | 'Retail Chain' | 'Wholesaler' | 'Exporter';
  buyerTrustScore: number;
  buyerCompletedTrades: number;
  isDemoBuyer?: boolean;
  offerPricePerQ: number;
  quantityRequestedQ: number;
  transportPaidBy: 'BUYER' | 'FARMER' | 'SHARED';
  estimatedTransportCostPerQ: number;
  estimatedHandlingCostPerQ: number;
  estimatedNetRealisationPerQ: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  validUntil: string;
  createdAt: string;
  termsNotes?: string;
}

export interface FarmVisitAppointment {
  id: string;
  lotId: string;
  lotCode: string;
  commodity: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmLocation: string;
  merchantId: string;
  merchantName: string;
  merchantCompany: string;
  merchantPhone: string;
  merchantType: string;
  visitDate: string;
  visitTimeSlot: string;
  purpose: 'SAMPLE_TESTING' | 'COMMERCIAL_GRADING' | 'BULK_FARMGATE_PURCHASE';
  status: 'REQUESTED' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  agreedTrade?: {
    quantityQ: number;
    ratePerQ: number;
    totalAmount: number;
    paymentMethod: string;
  };
  createdAt: string;
}

export interface StorageFacility {
  id: string;
  name: string;
  warehouseType: 'Cold Storage' | 'Dry Warehouse' | 'Controlled Atmosphere';
  state: string;
  district: string;
  capacityQuintals: number;
  ratePerMonthPerQ: number;
  ratePerDayPerQ: number;
  tempRange: string;
  humidityRange: string;
  contactPhone: string;
}

export interface DataSyncLog {
  id: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FALLBACK_CACHED' | 'FAILED';
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsRejected: number;
  rejectionReasons: string[];
  latencyMs: number;
  endpoint: string;
  source: string;
}

export interface MarketAnomaly {
  id: string;
  commodity: string;
  market: string;
  type: 'PRICE_SPIKE' | 'PRICE_CRASH' | 'ARRIVAL_SURGE' | 'ARRIVAL_DROP' | 'UNUSUAL_SPREAD';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  headline: string;
  observedValue: string;
  expectedRange: string;
  possibleHypotheses: string[];
  detectedAt: string;
}

export type SoilType = 'Black Cotton' | 'Red Loamy' | 'Sandy Loam' | 'Clay' | 'Alluvial';
export type SeasonType = 'Kharif (Monsoon)' | 'Rabi (Winter)' | 'Zaid (Summer)';
export type WaterAvailabilityType = 'Abundant (Canal/River)' | 'Medium (Borewell/Well)' | 'Low (Rainfed/Drip Only)';

export interface FarmerProfile {
  id: string;
  phoneNumber: string;
  name: string;
  village: string;
  district: string;
  state: string;
  landSizeAcres: number;
  soilType: SoilType;
  waterSource: WaterAvailabilityType;
  preferredLanguage: LanguageCode;
  isVerified: boolean;
  avatarIcon?: string;
}

export type ExpenseCategory = 
  | 'Seeds'
  | 'Fertilizer'
  | 'Pesticides'
  | 'Labour'
  | 'Water/Irrigation'
  | 'Machinery'
  | 'Transport'
  | 'Storage'
  | 'Other';

export interface FarmExpense {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  vendorOrLocation: string;
  note?: string;
  season?: string;
  createdAt: string;
}

export interface FarmEarning {
  id: string;
  crop: string;
  quantitySold: number;
  unit: 'kg' | 'quintal' | 'ton';
  sellingPrice: number; // Rate per unit
  totalEarnings: number;
  date: string; // YYYY-MM-DD
  market: string;
  buyer: string;
  notes?: string;
  createdAt: string;
}

export interface CropRecommendationItem {
  cropName: string;
  hindiName: string;
  marathiName: string;
  icon: string;
  variety: string;
  recommendedReason: string;
  keyDrivers: string[];
  alternatives: Array<{
    cropName: string;
    icon: string;
    reason: string;
  }>;
  suitabilityScore: number;
  soilSuitability: string;
  waterRequirement: string;
  expectedDurationDays: number;
  estimatedPriceRange: string;
  farmingConsiderations: string[];
  marketOpportunity: string;
}

export interface SeedRecommendationItem {
  id: string;
  crop: string;
  seedVariety: string;
  brandCompany: string;
  durationDays: number;
  seedRatePerAcre: string;
  expectedYieldPerAcre: string;
  bestSoil: string[];
  bestSeason: string[];
  keyFeatures: string[];
  diseaseResistance: string[];
  simpleExplanation: string;
}

export interface RatingReview {
  id: string;
  transactionId: string;
  lotId?: string;
  lotCode?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'farmer' | 'buyer';
  targetId: string;
  targetName: string;
  rating: number; // 1 to 5
  reviewText: string;
  date: string;
  isVerifiedTrade: boolean;
}

export interface ExoticCropInfo {
  id: string;
  name: string;
  hindiName: string;
  marathiName: string;
  icon: string;
  image: string;
  summary: string;
  howToPlant: string;
  soil: string;
  season: string;
  seedOrPlantingMaterial: string;
  waterRequirements: string;
  basicCultivation: string[];
  harvestTimeline: string;
  marketOpportunity: string;
  samplePriceRange: string;
  potentialBuyers: string[];
}

export interface AgriNewsItem {
  id: string;
  title: string;
  titleHi: string;
  titleMr: string;
  category: 'SCHEME' | 'MARKET' | 'WEATHER' | 'TECHNOLOGY';
  summary: string;
  summaryHi: string;
  summaryMr: string;
  date: string;
  source: string;
  isGovernmentScheme?: boolean;
  linkText?: string;
}

export interface WeatherHazardAlert {
  id: string;
  type: 'HEAVY_RAIN' | 'FLOOD' | 'STRONG_WIND' | 'HEAT_WAVE' | 'CYCLONE';
  title: string;
  titleHi: string;
  titleMr: string;
  description: string;
  descriptionHi: string;
  descriptionMr: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  district: string;
  farmerAdvice: string;
  farmerAdviceHi: string;
  farmerAdviceMr: string;
  validUntil: string;
}

export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'PAYMENT_RECEIVED' 
  | 'COMPLETED' 
  | 'FAILED';

export interface PaymentRecord {
  id: string;
  transactionId: string;
  paymentRef: string;
  amount: number;
  lotCode: string;
  commodity: string;
  farmerName: string;
  buyerCompany: string;
  date: string;
  status: PaymentStatus;
  qrPayload?: string;
  isDemo?: boolean;
}


