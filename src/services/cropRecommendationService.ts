import { 
  SoilType, 
  SeasonType, 
  WaterAvailabilityType, 
  CropRecommendationItem, 
  SeedRecommendationItem, 
  ExoticCropInfo,
  WeatherHazardAlert,
  AgriNewsItem
} from '../types';

export const VERIFIED_SEEDS_DATABASE: SeedRecommendationItem[] = [
  // Tomato Seeds
  {
    id: 'seed-tom-01',
    crop: 'Tomato',
    seedVariety: 'Abhinav (F1 Hybrid)',
    brandCompany: 'Syngenta India',
    durationDays: 130,
    seedRatePerAcre: '40 - 50 grams',
    expectedYieldPerAcre: '25 - 32 Tonnes',
    bestSoil: ['Black Cotton', 'Red Loamy', 'Clay'],
    bestSeason: ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'],
    keyFeatures: ['Deep red firm fruits', 'High shelf life (8-10 days)', 'Superb long-distance transport tolerance'],
    diseaseResistance: ['Tomato Leaf Curl Virus (ToLCV)', 'Bacterial Wilt'],
    simpleExplanation: 'Very popular hybrid with firm fruits that fetch premium wholesale rates in distant markets.'
  },
  {
    id: 'seed-tom-02',
    crop: 'Tomato',
    seedVariety: 'Shivam / US-440',
    brandCompany: 'Seminis / Bayer CropScience',
    durationDays: 120,
    seedRatePerAcre: '50 grams',
    expectedYieldPerAcre: '28 - 35 Tonnes',
    bestSoil: ['Red Loamy', 'Sandy Loam', 'Alluvial'],
    bestSeason: ['Kharif (Monsoon)', 'Rabi (Winter)'],
    keyFeatures: ['High continuous picking potential', 'Uniform round oval fruits (80-90g)', 'Strong plant vigor'],
    diseaseResistance: ['Early Blight', 'Fusarium Wilt'],
    simpleExplanation: 'High-yielding hybrid with early first harvest within 60-65 days after transplanting.'
  },

  // Onion Seeds
  {
    id: 'seed-oni-01',
    crop: 'Onion',
    seedVariety: 'Bhima Super (Red)',
    brandCompany: 'ICAR - Directorate of Onion & Garlic Research (DOGR)',
    durationDays: 110,
    seedRatePerAcre: '3.5 - 4.0 kg',
    expectedYieldPerAcre: '10 - 12 Tonnes',
    bestSoil: ['Black Cotton', 'Sandy Loam', 'Red Loamy'],
    bestSeason: ['Kharif (Monsoon)', 'Late Kharif'],
    keyFeatures: ['Attractive dark red globes', 'High pungency', 'Low double bulbs (<2%)'],
    diseaseResistance: ['Purple Blotch tolerance', 'Stemphylium Blight'],
    simpleExplanation: 'Official ICAR certified Kharif onion variety that matures early and tolerates erratic monsoon spells.'
  },
  {
    id: 'seed-oni-02',
    crop: 'Onion',
    seedVariety: 'AgriFound Light Red (ALR) / Gavran Garwa',
    brandCompany: 'National Horticultural Research & Development Foundation (NHRDF)',
    durationDays: 150,
    seedRatePerAcre: '4.0 kg',
    expectedYieldPerAcre: '14 - 16 Tonnes',
    bestSoil: ['Black Cotton', 'Clay', 'Alluvial'],
    bestSeason: ['Rabi (Winter)'],
    keyFeatures: ['Superior dry storage capability (5-6 months)', 'Tight skin adherence', 'Uniform medium size'],
    diseaseResistance: ['Storage Rot tolerance', 'Thrips tolerance'],
    simpleExplanation: 'The gold standard storage onion in Maharashtra; best if you plan to store in chawl for future price rise.'
  },

  // Potato Seeds
  {
    id: 'seed-pot-01',
    crop: 'Potato',
    seedVariety: 'Kufri Chipsona-1 / Kufri Jyoti',
    brandCompany: 'ICAR - Central Potato Research Institute (CPRI)',
    durationDays: 95,
    seedRatePerAcre: '8 - 10 Quintals (Seed Tubers)',
    expectedYieldPerAcre: '12 - 15 Tonnes',
    bestSoil: ['Sandy Loam', 'Alluvial', 'Red Loamy'],
    bestSeason: ['Rabi (Winter)'],
    keyFeatures: ['High dry matter (>21%)', 'Low reducing sugars', 'Preferred by industrial chip manufacturers'],
    diseaseResistance: ['Late Blight resistant', 'Potato Leafroll Virus'],
    simpleExplanation: 'Dual-purpose variety ideal for both household kitchen sales and premium institutional food processing.'
  },

  // Grapes
  {
    id: 'seed-gra-01',
    crop: 'Grapes',
    seedVariety: 'Thompson Seedless / Sonaka (Cuttings/Rootstock Dogridge)',
    brandCompany: 'ICAR - National Research Centre for Grapes (NRCG)',
    durationDays: 140,
    seedRatePerAcre: '800 - 1000 rootstock vines',
    expectedYieldPerAcre: '10 - 14 Tonnes',
    bestSoil: ['Black Cotton', 'Red Loamy'],
    bestSeason: ['Rabi (Winter)', 'Summer'],
    keyFeatures: ['Elongated amber sweet berries (Brix 18-20°)', 'Export grade quality', 'High bunch uniformity'],
    diseaseResistance: ['Downy Mildew tolerance with regular canopy spray', 'Powdery Mildew'],
    simpleExplanation: 'Standard premium export grape in the Nashik-Sangli vineyard belt.'
  },

  // Green Peas
  {
    id: 'seed-pea-01',
    crop: 'Green Peas',
    seedVariety: 'Arka Ajit / GS-10',
    brandCompany: 'Advanta Seeds / IIHR Bangalore',
    durationDays: 65,
    seedRatePerAcre: '30 - 35 kg',
    expectedYieldPerAcre: '3.5 - 4.5 Tonnes',
    bestSoil: ['Sandy Loam', 'Alluvial', 'Red Loamy'],
    bestSeason: ['Rabi (Winter)'],
    keyFeatures: ['Sweet tender pods with 8-10 uniform peas', 'Early single/double harvest', 'Soil nitrogen fixing'],
    diseaseResistance: ['Powdery Mildew resistant', 'Rust resistant'],
    simpleExplanation: 'Fast 65-day short-duration cash crop that improves your soil fertility before summer sowing.'
  }
];

export const EXOTIC_CROPS_CATALOG: ExoticCropInfo[] = [
  {
    id: 'exotic-dragon-fruit',
    name: 'Dragon Fruit (Pitaya)',
    hindiName: 'ड्रैगन फ्रूट',
    marathiName: 'ड्रॅगन फ्रूट',
    icon: '🐉',
    image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=800&auto=format&fit=crop&q=80',
    summary: 'High-value perennial cactus fruit with low water needs and rapid harvest cycles (25-30 years plant life).',
    howToPlant: 'Plant 4 rooted cuttings around a reinforced concrete pole (RCC) with a top tire/ring trellis. Space poles 3m x 3m (approx. 450 poles/acre = 1,800 plants).',
    soil: 'Well-drained sandy loam or gravelly red soil with pH 5.5 to 7.0. Strict avoidance of waterlogging.',
    season: 'Planting during monsoon (June-August). Flowering starts May and fruit pickings occur June to November.',
    seedOrPlantingMaterial: 'Mature stem cuttings (12-15 inches) treated with fungicide or certified rooted saplings.',
    waterRequirements: 'Low water requirement (approx. 2-3 liters/pole/day via drip irrigation).',
    basicCultivation: [
      'Install sturdy cement poles with top ring support.',
      'Apply organic farmyard manure + neem cake + DAP at the base twice a year.',
      'Prune drooping canopy shoots after November harvest to encourage fresh fruiting branches.',
      'Use drip lines along poles to deliver precise micro-irrigation.'
    ],
    harvestTimeline: 'First commercial harvest in 14-18 months. Continuous picking every 20 days between June-Nov.',
    marketOpportunity: 'Surging demand in metro supermarkets, juice bars, and fitness retail. Farmgate price: ₹120–₹180/kg.',
    samplePriceRange: '₹120 – ₹200/kg',
    potentialBuyers: ['Metro Retail Chains (Reliance Fresh, Nature’s Basket)', 'Export aggregators (Gulf/UAE)', 'City wholesale fruit mandis']
  },
  {
    id: 'exotic-strawberry',
    name: 'Strawberry (Winter Dawn / Sweet Charlie)',
    hindiName: 'स्ट्रॉबेरी',
    marathiName: 'स्ट्रॉबेरी',
    icon: '🍓',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80',
    summary: 'High-margin winter cash crop cultivated on silver-black plastic mulch with drip irrigation.',
    howToPlant: 'Raised beds (1m width, 30cm height) covered with 25-micron silver-black plastic mulch. Plant 22,000-24,000 runner saplings per acre.',
    soil: 'Rich, well-aerated sandy loam with high organic matter and pH 5.5 to 6.5.',
    season: 'Planting in September-October (post-monsoon). Harvesting December to March.',
    seedOrPlantingMaterial: 'Cold-treated tissue culture mother runners imported or from certified Mahabaleshwar nurseries.',
    waterRequirements: 'Moderate water requirement via daily drip fertigation (1.5 - 2 hours).',
    basicCultivation: [
      'Prepare raised beds mixed with 20 tonnes compost + Trichoderma per acre.',
      'Lay drip lines and punch holes in plastic mulch at 30cm spacing.',
      'Maintain regular water-soluble fertigation (19:19:19, 0:52:34, Calcium Nitrate).',
      'Harvest fruit early morning with stems intact directly into punnet boxes.'
    ],
    harvestTimeline: 'Harvest begins 60-70 days after planting. Multiple pickings every 3-4 days for 90 days.',
    marketOpportunity: 'High demand in ice cream plants, bakeries, processing hubs, and direct city retail. Spot rate ₹180–₹350/kg.',
    samplePriceRange: '₹180 – ₹320/kg',
    potentialBuyers: ['Ice cream & jam processors (Mapro, Mala’s)', 'Urban supermarkets', 'Direct-to-consumer farmgate tourism']
  },
  {
    id: 'exotic-avocado',
    name: 'Avocado (Hass / Pinkerton)',
    hindiName: 'एवोकाडो (बटर फ्रूट)',
    marathiName: 'एव्होकॅडो (बटर फ्रूट)',
    icon: '🥑',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80',
    summary: 'Global superfood with massive domestic demand; long-living orchard tree requiring mild subtropical climate.',
    howToPlant: 'Orchard pit planting (2ft x 2ft pits) spaced 5m x 5m (approx. 160 trees per acre). Intercropping possible for first 3 years.',
    soil: 'Deep well-draining red loamy or alluvial soil with pH 5.5 to 6.8. Sensitive to saline and waterlogged soils.',
    season: 'Planting at onset of monsoon (June-July). Flowering in Jan-Feb, harvest in Aug-October.',
    seedOrPlantingMaterial: 'Grafted Hass saplings on rootstock.',
    waterRequirements: 'Medium water requirement; sensitive to water stress during flowering and fruit setting.',
    basicCultivation: [
      'Dig 3ft pits filled with topsoil, cow dung manure, and bone meal.',
      'Plant grafted trees ensuring graft union is 6 inches above soil level.',
      'Mulch the tree basin with dry leaves to retain moisture.',
      'Protect young trees from harsh frost and scorching summer winds.'
    ],
    harvestTimeline: 'First harvest in year 3-4; peak commercial yield from year 5 to 30.',
    marketOpportunity: 'Metro demand exceeds domestic supply by 800%. Farmgate realization: ₹150–₹260/kg.',
    samplePriceRange: '₹150 – ₹280/kg',
    potentialBuyers: ['Gourmet retail chains', 'Hospitality & 5-Star hotels', 'Direct fruit aggregators']
  },
  {
    id: 'exotic-broccoli',
    name: 'Broccoli (Green Magic / Sakata F1)',
    hindiName: 'ब्रोकली (हरी फूलगोभी)',
    marathiName: 'ब्रोकोली (हिरवी फूलगोभी)',
    icon: '🥦',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&auto=format&fit=crop&q=80',
    summary: 'Cool-season vegetable commanding 3x the price of ordinary cauliflower in urban markets.',
    howToPlant: 'Transplant 25-day old nursery seedlings on raised beds spaced 45cm x 45cm (approx. 20,000 plants per acre).',
    soil: 'Fertile loamy soil rich in humus with pH 6.0 to 7.0.',
    season: 'Winter / Rabi crop (October to February in North/Central/West India; year-round in cool hilly areas).',
    seedOrPlantingMaterial: 'F1 Hybrid Broccoli seeds (Green Magic, Lucky, Marathon).',
    waterRequirements: 'Regular light irrigation to keep topsoil moist; avoid overhead watering on maturing heads.',
    basicCultivation: [
      'Raise nursery seedlings in pro-trays with coco-peat.',
      'Transplant in evening hours followed by immediate light irrigation.',
      'Side-dress with Boron and Molybdenum to prevent hollow stems.',
      'Harvest compact dark green heads with 10-15cm stalk before florets begin to open.'
    ],
    harvestTimeline: 'Harvest ready in 60-70 days from transplanting.',
    marketOpportunity: 'Steady demand from quick-commerce apps (Blinkit, Zepto, BigBasket) and hotels. Rate: ₹40–₹80/kg.',
    samplePriceRange: '₹40 – ₹90/kg',
    potentialBuyers: ['Quick commerce grocery dark stores', 'Hotel & catering suppliers', 'Metro vegetable mandis']
  },
  {
    id: 'exotic-lettuce',
    name: 'Hydroponic / Open Lettuce (Iceberg & Romaine)',
    hindiName: 'लेट्यूस (सलाद पत्ता)',
    marathiName: 'हायड्रोपोनिक लेट्यूस',
    icon: '🥬',
    image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=800&auto=format&fit=crop&q=80',
    summary: 'Ultra-fast 35-45 day salad crop ideal for shade-net polyhouses and protected open-field farming.',
    howToPlant: 'Transplant seedlings into nutrient film technique (NFT) pipes or raised beds with silver mulch at 20cm spacing.',
    soil: 'Coco-peat hydroponic channels or porous sandy loam rich in organic matter.',
    season: 'Autumn to early spring (September to March in plains; round the year in polyhouse).',
    seedOrPlantingMaterial: 'Pelleted certified Iceberg, Butterhead, or Romaine seeds.',
    waterRequirements: 'Continuous recirculating nutrient water (EC 1.4-1.8, pH 5.8-6.2).',
    basicCultivation: [
      'Germinate seeds in 1-inch rockwool/sponge cubes under shade.',
      'Transfer to grow channels when 3-4 true leaves emerge.',
      'Maintain automated water temperature below 24°C in summer.',
      'Harvest whole heads early in the morning and pack in food-grade perforated sleeves.'
    ],
    harvestTimeline: 'Very fast 35–45 days cycle allowing 7–8 crop rotations per year.',
    marketOpportunity: 'Fast-food burger chains (McDonald’s, Burger King, Subway), salad cafes, and high-end restaurants.',
    samplePriceRange: '₹50 – ₹110/kg',
    potentialBuyers: ['Institutional fast-food vendors', 'Salad delivery brands', 'Gourmet supermarkets']
  },
  {
    id: 'exotic-cherry-tomato',
    name: 'Exotic Cherry Tomato (Red & Yellow Sweet)',
    hindiName: 'चेरी टमाटर',
    marathiName: 'चेरी टोमॅटो',
    icon: '🍅',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    summary: 'Bite-sized sweet salad tomatoes commanding 3x higher price per kg than standard round tomatoes.',
    howToPlant: 'Staked vertical trellising in polyhouse or open shade-net with drip irrigation.',
    soil: 'Rich loamy soil with excellent drainage and pH 6.0 to 6.8.',
    season: 'Round the year in polyhouse; August to February in open fields.',
    seedOrPlantingMaterial: 'F1 Hybrid Cherry Tomato seeds (Rubyno, Golden Sweet, Sweet 100).',
    waterRequirements: 'Precise drip irrigation to avoid fruit cracking.',
    basicCultivation: [
      'Single-stem or double-stem string trellising up to 8-10 feet height.',
      'Regular pruning of side suckers every week.',
      'Balanced calcium & potassium fertigation for high brix sweetness and crack resistance.',
      'Harvest in clusters when uniformly colored.'
    ],
    harvestTimeline: 'First harvest in 65 days; continuous harvest for 6-8 months in polyhouse.',
    marketOpportunity: 'Huge demand in modern retail, hotel buffets, and urban households. Farmgate price: ₹50–₹110/kg.',
    samplePriceRange: '₹50 – ₹120/kg',
    potentialBuyers: ['Retail supermarket chains', 'Flight catering & 5-star hotels', 'Organic food stores']
  }
];

export const MOCK_WEATHER_HAZARDS: WeatherHazardAlert[] = [
  {
    id: 'haz-01',
    type: 'HEAVY_RAIN',
    title: 'Heavy Rainfall Warning (Yellow Alert)',
    titleHi: 'भारी बारिश की चेतावनी (येलो अलर्ट)',
    titleMr: 'मुसळधार पावसाचा इशारा (यलो अलर्ट)',
    description: 'Moderate to heavy rain expected across Nashik, Pune, and Ahmednagar over the next 36 hours.',
    descriptionHi: 'अगले 36 घंटों में नासिक, पुणे और अहमदनगर में मध्यम से भारी बारिश की संभावना।',
    descriptionMr: 'पुढील ३६ तासांत नाशिक, पुणे व अहमदनगर जिल्ह्यात मध्यम ते मुसळधार पावसाचा अंदाज.',
    severity: 'WARNING',
    district: 'Nashik, Maharashtra',
    farmerAdvice: 'Clear field drainage channels immediately to prevent water accumulation near tomato & onion root zones.',
    farmerAdviceHi: 'टमाटर और प्याज की जड़ों में जलभराव रोकने के लिए खेत की जलनिकासी नालियों को तुरंत साफ करें।',
    farmerAdviceMr: 'टोमॅटो व कांद्याच्या मुळाजवळ पाणी साचू नये म्हणून शेतातील पाण्याचा निचरा त्वरित करा.',
    validUntil: 'Tomorrow 18:00'
  },
  {
    id: 'haz-02',
    type: 'STRONG_WIND',
    title: 'Gusty Winds Alert (40-50 km/h)',
    titleHi: 'तेज हवाओं का अलर्ट (40-50 किमी/घंटा)',
    titleMr: 'वादळी वाऱ्याचा इशारा (४०-५० किमी/तास)',
    description: 'Gusty surface winds expected during afternoon hours.',
    descriptionHi: 'दोपहर के समय तेज सतही हवाएं चलने की संभावना।',
    descriptionMr: 'दुपारच्या वेळी वेगवान वारे वाहण्याची शक्यता.',
    severity: 'INFO',
    district: 'Solapur & Sangli, Maharashtra',
    farmerAdvice: 'Support banana and grape trellises with bamboo stakes; postpone foliar spraying until winds subside.',
    farmerAdviceHi: 'केले और अंगूर की बेलों को सहारा दें; हवा शांत होने तक किसी भी कीटनाशक छिड़काव को टालें।',
    farmerAdviceMr: 'केळी व द्राक्ष मांडवांना बांबूचा आधार द्या; वारा शांत होईपर्यंत फवारणी पुढे ढकला.',
    validUntil: '30 Aug 2026'
  }
];

export const MOCK_AGRI_NEWS: AgriNewsItem[] = [
  {
    id: 'news-01',
    title: 'PM-Kisan 18th Installment: Direct Benefit Transfer for Eligible Farmers',
    titleHi: 'पीएम-किसान 18वीं किस्त: पात्र किसानों के बैंक खातों में सीधी राशि जारी',
    titleMr: 'पीएम-किसान १८ वा हप्ता: पात्र शेतकऱ्यांच्या बँक खात्यात थेट रक्कम जमा',
    category: 'SCHEME',
    summary: 'Government announces release of ₹2,000 quarterly financial support directly into Aadhaar-linked farmer bank accounts.',
    summaryHi: 'सरकार ने आधार से जुड़े किसान बैंक खातों में ₹2,000 की वित्तीय सहायता जारी करने की घोषणा की।',
    summaryMr: 'शासनाने आधार संलग्न शेतकरी बँक खात्यात ₹२,००० ची थेट आर्थिक मदत जमा करण्याची घोषणा केली.',
    date: '28 Aug 2026',
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    isGovernmentScheme: true,
    linkText: 'Check PM-Kisan Portal'
  },
  {
    id: 'news-02',
    title: 'e-NAM Mandi Integration: Zero Intermediary Inter-State Produce Trading Expanded',
    titleHi: 'e-NAM मंडी एकीकरण: 100 नई मंडियों में अंतर-राज्यीय सीधी फसल बिक्री शुरू',
    titleMr: 'e-NAM बाजार समिती: थेट आंतरराज्यीय शेतमाल विक्रीसाठी १०० नवीन बाजार समित्या जोडल्या',
    category: 'MARKET',
    summary: 'National Agriculture Market adds single-license electronic trading across 100 new APMCs with digital assaying and prompt settlement.',
    summaryHi: 'राष्ट्रीय कृषि बाजार (e-NAM) ने डिजिटल गुणवत्ता परीक्षण और त्वरित भुगतान के साथ 100 नई मंडियों को जोड़ा।',
    summaryMr: 'राष्ट्रीय कृषी बाजाराने डिजिटल प्रतवारी आणि जलद बँक पेमेंटसह १०० नवीन बाजार समित्यांचा समावेश केला.',
    date: '27 Aug 2026',
    source: 'National Agriculture Market (e-NAM)',
    isGovernmentScheme: true,
    linkText: 'Explore e-NAM Mandis'
  },
  {
    id: 'news-03',
    title: 'Kharif Onion & Tomato Production Outlook: Robust Export Demand from Middle East',
    titleHi: 'खरीफ प्याज व टमाटर परिदृश्य: खाड़ी देशों से मजबूत निर्यात मांग की संभावना',
    titleMr: 'खरीप कांदा व टोमॅटो अंदाज: आखाती देशांतून निर्यातीला मोठी मागणी',
    category: 'MARKET',
    summary: 'Horticultural aggregators report 22% increase in forward bookings for Maharashtra table grapes, red onion, and high-brix tomatoes.',
    summaryHi: 'महाराष्ट्र के अंगूर, लाल प्याज और टमाटर के लिए विदेशी खरीदारों से अग्रिम बुकिंग में 22% की वृद्धि।',
    summaryMr: 'महाराष्ट्रातील द्राक्षे, कांदा आणि टोमॅटोसाठी परदेशी खरेदीदारांकडून आगाऊ बुकिंगमध्ये २२% वाढ.',
    date: '26 Aug 2026',
    source: 'APEDA Agri Export Development Authority',
    isGovernmentScheme: false
  },
  {
    id: 'news-04',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY): Kharif Crop Enrollment Window Open',
    titleHi: 'प्रधानमंत्री फसल बीमा योजना: खरीफ फसल बीमा नामांकन की समयसीमा खुली',
    titleMr: 'प्रधानमंत्री पीक विमा योजना: खरीप पीक विमा अर्ज भरण्याची मुदत सुरू',
    category: 'SCHEME',
    summary: 'Enroll your notified crops with just 2% premium for food grains and 5% for horticultural produce against natural calamities.',
    summaryHi: 'प्राकृतिक आपदाओं से सुरक्षा के लिए खाद्यान्न फसलों पर केवल 2% और बागवानी फसलों पर 5% प्रीमियम देकर बीमा कराएं।',
    summaryMr: 'नैसर्गिक आपत्तीपासून संरक्षणासाठी अन्नधान्य पिकांवर २% आणि फळबाग पिकांवर ५% हप्त्यात पीक विमा नोंदणी करा.',
    date: '25 Aug 2026',
    source: 'Department of Agriculture & Farmers Welfare',
    isGovernmentScheme: true,
    linkText: 'PMFBY Portal'
  }
];

export function getCropRecommendation(params: {
  soilType: SoilType;
  district: string;
  season: SeasonType;
  waterAvailability: WaterAvailabilityType;
  previousCrops?: string[];
  pastEarningsAvg?: number;
}): CropRecommendationItem {
  const { soilType, season, waterAvailability } = params;

  // Multi-factor agronomic scoring logic
  if (soilType === 'Black Cotton' || soilType === 'Clay') {
    if (waterAvailability === 'Abundant (Canal/River)' || waterAvailability === 'Medium (Borewell/Well)') {
      return {
        cropName: 'Tomato',
        hindiName: 'टमाटर',
        marathiName: 'टोमॅटो',
        icon: '🍅',
        variety: 'Abhinav / Shivam Hybrid (High-Yield Commercial)',
        recommendedReason: 'High market demand, strong upcoming festive season price trend, and perfect compatibility with nutrient-rich black soil.',
        keyDrivers: [
          'Black soil retains moisture and potassium required for heavy tomato fruit setting.',
          'Wholesale APMC prices have shown consistent +8% to +14% weekly strength.',
          'Short duration (60-70 days first picking) allows quick cashflow before the next planting cycle.'
        ],
        alternatives: [
          { cropName: 'Onion', icon: '🧅', reason: 'Excellent 5-month storage potential in black soil with steady mandi demand.' },
          { cropName: 'Green Peas', icon: '🫛', reason: 'Short 65-day cash crop with high protein demand and natural soil nitrogen enrichment.' },
          { cropName: 'Capsicum', icon: '🫑', reason: 'High realization in polyhouse or shaded cultivation.' }
        ],
        suitabilityScore: 94,
        soilSuitability: 'Excellent (High water retention & potassium availability)',
        waterRequirement: 'Medium to High (Drip fertigation every 2 days)',
        expectedDurationDays: 120,
        estimatedPriceRange: '₹22 – ₹32/kg (₹2,200 – ₹3,200/quintal)',
        farmingConsiderations: [
          'Use raised beds with silver mulch to avoid soil-borne root wilt.',
          'Install bamboo or wire staking at 30 days for maximum Grade A fruit development.',
          'Provide soluble Calcium Nitrate during flowering to prevent blossom end rot.'
        ],
        marketOpportunity: 'High demand from metro terminal mandis, ketchup food processors, and direct retail chains.'
      };
    } else {
      // Low water on black soil
      return {
        cropName: 'Onion',
        hindiName: 'प्याज',
        marathiName: 'कांदा',
        icon: '🧅',
        variety: 'Bhima Super / Gavran Red',
        recommendedReason: 'Low water requirement, hardy root system, and strong dry-chawl storage potential.',
        keyDrivers: [
          'Requires 40% less water than leafy vegetables and thrives on deep moisture in black soil.',
          'Flexible harvest window; can be stored on-farm for 3-5 months if market prices dip.',
          'Steady buyer demand from retail aggregators and wholesale mandis.'
        ],
        alternatives: [
          { cropName: 'Gram / Chickpea (Harbara)', icon: '🌱', reason: 'Very low water crop that enriches nitrogen.' },
          { cropName: 'Pomegranate', icon: '🍎', reason: 'Drought-tolerant high value fruit orchard.' }
        ],
        suitabilityScore: 91,
        soilSuitability: 'Very High (Ideal for bulb formation in deep soil)',
        waterRequirement: 'Low to Moderate (Drip or light furrow irrigation)',
        expectedDurationDays: 115,
        estimatedPriceRange: '₹24 – ₹30/kg (₹2,400 – ₹3,000/quintal)',
        farmingConsiderations: [
          'Stop irrigation 10-12 days before harvest to allow neck drying.',
          'Cure harvested bulbs in shade for 7 days before storage.'
        ],
        marketOpportunity: 'Daily consumption staple with consistent buyer bids across all APMC mandis.'
      };
    }
  } else if (soilType === 'Sandy Loam' || soilType === 'Alluvial') {
    return {
      cropName: 'Potato',
      hindiName: 'आलू',
      marathiName: 'बटाटा',
      icon: '🥔',
      variety: 'Kufri Chipsona / Kufri Jyoti',
      recommendedReason: 'Porous, loose sandy loam allows uninterrupted tuber expansion and high Grade A shape uniformity.',
      keyDrivers: [
        'Sandy loam prevents tuber deformity and reduces harvesting digging labor.',
        'Heavy industrial demand from potato chip and snack processing units.',
        'Cold storage infrastructure is widely accessible in western & northern hubs.'
      ],
      alternatives: [
        { cropName: 'Carrot', icon: '🥕', reason: 'Uniform long roots develop best in loose sandy loam.' },
        { cropName: 'Watermelon', icon: '🍉', reason: 'High summer dessert fruit with quick 75-day turnaround.' },
        { cropName: 'Green Chilli', icon: '🌶️', reason: 'Continuous picking for 5-6 months with low moisture stress.' }
      ],
      suitabilityScore: 92,
      soilSuitability: 'Excellent (Loose aerated texture ideal for root/tuber crops)',
      waterRequirement: 'Moderate (Light frequent irrigations)',
      expectedDurationDays: 95,
      estimatedPriceRange: '₹18 – ₹24/kg (₹1,800 – ₹2,400/quintal)',
      farmingConsiderations: [
        'Earthing up at 30 and 45 days is essential to prevent greening of tubers from sunlight.',
        'Treat seed tubers with fungicide before sowing to prevent Late Blight.'
      ],
      marketOpportunity: 'Large-scale bulk buying by snack companies and potato cold-storage operators.'
    };
  } else {
    // Red Loamy Soil (Ideal for Grapes, Pomegranate, Exotic crops)
    return {
      cropName: 'Grapes',
      hindiName: 'अंगूर',
      marathiName: 'द्राक्षे',
      icon: '🍇',
      variety: 'Thompson Seedless / Sonaka Export Grade',
      recommendedReason: 'Red loamy soil provides exceptional drainage and mineral balance needed for high-sugar fruit development.',
      keyDrivers: [
        'Red soil naturally warms up during winter, promoting uniform bud break and berry elongation.',
        'Strong export demand with high price premiums for Grade A+ (Brix 18+).',
        'Direct procurement visits by retail chains and international exporters.'
      ],
      alternatives: [
        { cropName: 'Pomegranate', icon: '🍎', reason: 'Thrives in red soil with high drought resilience.' },
        { cropName: 'Tomato', icon: '🍅', reason: 'Fast cash crop with high yield in red loamy soils.' },
        { cropName: 'Strawberry', icon: '🍓', reason: 'High winter profit on plastic mulch.' }
      ],
      suitabilityScore: 95,
      soilSuitability: 'Optimal (Free drainage prevents root rot and boosts sugar brix)',
      waterRequirement: 'Controlled Drip (Sub-surface or micro-drip)',
      expectedDurationDays: 140,
      estimatedPriceRange: '₹75 – ₹95/kg (₹7,500 – ₹9,500/quintal)',
      farmingConsiderations: [
        'Strict canopy management and bunch dipping for berry elongation.',
        'Maintain biological spray schedules to ensure zero chemical residue for export clearance.'
      ],
      marketOpportunity: 'Export contracts with European and Middle Eastern food procurement aggregators.'
    };
  }
}
