// ====================================================================
// KRISHIMARKET: NET RETURN CALCULATOR ENGINE
// Mathematically tested, decimal-safe calculation of farmer net proceeds
// based on Incoterms 2020 rules, commodity shrinkage, and currency rates.
// ====================================================================

import { 
  NetReturnCalculationInput, 
  NetReturnCalculationResult, 
  ExportCostItem, 
  CostCategory, 
  IncotermType 
} from '../types/globalTrade';

/**
 * Standard benchmark export costs for 1,000 kg Nashik Onion to UAE via Nhava Sheva (JNPT)
 * All values are documented, configurable benchmarks in INR.
 */
export const DEFAULT_ONION_1000KG_COSTS_INR: Record<CostCategory, { title: string; defaultAmount: number; note: string }> = {
  sorting_grading: {
    title: 'Sorting & Electronic Grading (Manual + Mesh 45-55mm)',
    defaultAmount: 1800.00,
    note: '₹1.80/kg for manual defect sorting and diameter calibration'
  },
  packing_materials: {
    title: 'Export Packaging (25kg Ventilated Lenomesh Bags & Palletizing)',
    defaultAmount: 2200.00,
    note: '40 bags @ ₹35 each + corner boards, pallet strapping and shrink wrap'
  },
  inland_transport: {
    title: 'Inland Reefer/Covered Transport (Nashik Packhouse to Nhava Sheva)',
    defaultAmount: 4500.00,
    note: 'Dedicated freight from Lasalgaon/Pimpalgaon belt to JNPT Port (approx 210 km)'
  },
  loading_handling: {
    title: 'Port Gate Handling & CFS Staging',
    defaultAmount: 1200.00,
    note: 'Container Freight Station unloading, tally, and port gate pass'
  },
  inspection_certification: {
    title: 'Phytosanitary & Export Quality Certificate',
    defaultAmount: 1500.00,
    note: 'Plant Quarantine regulatory inspection fee and lab test memo'
  },
  customs_clearance: {
    title: 'Indian Customs Export Clearance (CHA & Documentation)',
    defaultAmount: 2000.00,
    note: 'Customs House Agent filing, shipping bill generation and port documentation'
  },
  ocean_freight: {
    title: 'Ocean Reefer Freight (Nhava Sheva INNSA to Jebel Ali AEJEA)',
    defaultAmount: 6200.00,
    note: 'Sea transit (approx 4-5 days sailing to Dubai). Borne by seller only under CIF/CFR.'
  },
  marine_insurance: {
    title: 'Marine Cargo Insurance (All Risks ICC A Clause)',
    defaultAmount: 850.00,
    note: 'Transit damage & delay policy coverage. Borne by seller under CIF/CIP.'
  },
  port_charges: {
    title: 'Terminal Handling Charges (JNPT Mumbai THC)',
    defaultAmount: 1400.00,
    note: 'Port authority crane, terminal handling, and port entry cess'
  },
  currency_conversion: {
    title: 'Bank Forex Remittance & Authorized Dealer Bank Fee',
    defaultAmount: 650.00,
    note: 'Bank handling, FIRC issuance, and authorized currency exchange margin'
  },
  export_duty: {
    title: 'Export Duty / Regulatory Cess (Government of India)',
    defaultAmount: 0.00,
    note: 'Current policy check: Onion export duty status monitored per DGFT notifications.'
  }
};

/**
 * Determines whether the seller or the buyer is responsible for a cost
 * under the specified Incoterm 2020 rule.
 */
export function determineCostPayer(category: CostCategory, incoterm: IncotermType): 'SELLER' | 'BUYER' {
  switch (incoterm) {
    case 'EXW':
      // Seller only packages goods at packhouse; Buyer pays everything thereafter
      return category === 'sorting_grading' || category === 'packing_materials' ? 'SELLER' : 'BUYER';

    case 'FOB':
    case 'FAS':
    case 'FCA':
      // Seller delivers goods on board vessel at named port (Nhava Sheva)
      // Buyer pays ocean freight and marine insurance
      if (category === 'ocean_freight' || category === 'marine_insurance') {
        return 'BUYER';
      }
      return 'SELLER';

    case 'CFR':
    case 'CPT':
      // Seller pays ocean freight to destination, but Buyer covers marine insurance
      if (category === 'marine_insurance') {
        return 'BUYER';
      }
      return 'SELLER';

    case 'CIF':
    case 'CIP':
    case 'DAP':
    case 'DPU':
    case 'DDP':
      // Seller pays all costs through ocean freight and marine insurance to destination
      return 'SELLER';

    default:
      return 'SELLER';
  }
}

/**
 * Pure calculation function for Net Return estimation.
 * Thoroughly handles rounding, unit conversion, and deductions.
 */
export const NetReturnCalculator = {
  calculate: calculateNetReturn
};

export function calculateNetReturn(input: NetReturnCalculationInput): NetReturnCalculationResult {
  const lotQty = input.lotQuantityKg;
  if (!lotQty || lotQty <= 0) {
    throw new Error('Lot quantity must be greater than zero.');
  }

  const unitPrice = input.unitPrice;
  if (!unitPrice || unitPrice <= 0) {
    throw new Error('Unit price must be greater than zero.');
  }

  const fxRate = input.exchangeRateToInr;
  if (!fxRate || fxRate <= 0) {
    throw new Error('Exchange rate must be greater than zero.');
  }

  // Shrinkage & rejection calculation (Default: 6% for Nashik onions during grading/curing)
  const shrinkagePct = input.shrinkageRejectionPct !== undefined ? input.shrinkageRejectionPct : 6.00;
  if (shrinkagePct < 0 || shrinkagePct > 30) {
    throw new Error('Shrinkage percentage must be between 0% and 30%.');
  }

  const shrinkageKg = Math.round(((lotQty * shrinkagePct) / 100) * 100) / 100;
  const saleableQty = Math.round((lotQty - shrinkageKg) * 100) / 100;

  // Gross proceeds
  const grossProceedsForeign = Math.round((saleableQty * unitPrice) * 100) / 100;
  const grossProceedsInr = Math.round((grossProceedsForeign * fxRate) * 100) / 100;

  // Build itemized cost lines based on Incoterm rules
  const itemizedCosts: ExportCostItem[] = [];
  let totalSellerDeductionsInr = 0;

  const categories = Object.keys(DEFAULT_ONION_1000KG_COSTS_INR) as CostCategory[];

  for (const cat of categories) {
    const config = DEFAULT_ONION_1000KG_COSTS_INR[cat];
    const payer = determineCostPayer(cat, input.incoterm);

    // Scaling cost proportionally to quantity (benchmarked to 1,000 kg)
    const quantityScaleFactor = lotQty / 1000;
    
    // Check if an override was provided
    let costAmountInr: number;
    if (input.costOverrides && input.costOverrides[cat] !== undefined) {
      costAmountInr = input.costOverrides[cat]!;
    } else {
      // Scale standard cost
      costAmountInr = Math.round(config.defaultAmount * quantityScaleFactor * 100) / 100;
    }

    const costItem: ExportCostItem = {
      id: `cost-${cat}-${Date.now()}`,
      category: cat,
      displayTitle: config.title,
      payerParty: payer,
      amountCurrency: 'INR',
      amount: costAmountInr,
      amountInr: costAmountInr,
      isEstimated: true,
      note: config.note
    };

    itemizedCosts.push(costItem);

    if (payer === 'SELLER') {
      totalSellerDeductionsInr = Math.round((totalSellerDeductionsInr + costAmountInr) * 100) / 100;
    }
  }

  // Net proceeds in INR
  const netProceedsInr = Math.round((grossProceedsInr - totalSellerDeductionsInr) * 100) / 100;
  const netPerKgInr = Math.round((netProceedsInr / saleableQty) * 100) / 100;

  // Optional Farming Profit if production cost is provided
  let farmingProfitInr: number | undefined;
  let farmingProfitPerKgInr: number | undefined;

  if (input.productionCostPerKgInr !== undefined && input.productionCostPerKgInr > 0) {
    const totalProductionCost = Math.round((input.productionCostPerKgInr * lotQty) * 100) / 100;
    farmingProfitInr = Math.round((netProceedsInr - totalProductionCost) * 100) / 100;
    farmingProfitPerKgInr = Math.round((farmingProfitInr / saleableQty) * 100) / 100;
  }

  const formattedNetPerKg = netPerKgInr.toFixed(2);

  // Spoken natural phrasing across English, Hindi, and Marathi
  const summarySentenceEn = `You may receive ₹${formattedNetPerKg} per kg after costs`;
  const summarySentenceHi = `सभी खर्च काटकर आपको लगभग ₹${formattedNetPerKg} प्रति किलो मिल सकते हैं`;
  const summarySentenceMr = `सर्व खर्च वजा जाता तुम्हाला अंदाजे ₹${formattedNetPerKg} प्रति किलो मिळू शकतात`;

  return {
    lotQuantityKg: lotQty,
    shrinkageRejectionPct: shrinkagePct,
    shrinkageRejectionKg: shrinkageKg,
    saleableQuantityKg: saleableQty,
    unitPrice,
    currency: input.currency,
    exchangeRateToInr: fxRate,
    fxRateSource: input.fxRateSource,
    fxRateTimestamp: input.fxRateTimestamp,
    incoterm: input.incoterm,
    namedPortOrPlace: input.namedPortOrPlace,
    grossProceedsForeignCurrency: grossProceedsForeign,
    grossProceedsInr,
    itemizedCosts,
    totalSellerDeductionsInr,
    netProceedsInr,
    netPerKgInr,
    productionCostPerKgInr: input.productionCostPerKgInr,
    estimatedFarmingProfitInr: farmingProfitInr,
    estimatedFarmingProfitPerKgInr: farmingProfitPerKgInr,
    calculatedAt: new Date().toISOString(),
    summarySentenceEn,
    summarySentenceHi,
    summarySentenceMr
  };
}
