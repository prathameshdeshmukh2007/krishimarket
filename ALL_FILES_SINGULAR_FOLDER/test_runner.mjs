// ====================================================================
// KRISHIMARKET AUTOMATED TEST RUNNER
// Standalone unit tests for Net Return Calculator, Incoterms & Price Rules
// ====================================================================

import assert from 'node:assert';

console.log('🧪 Starting KrishiMarket Global Trade Automated Test Suite...\n');

// 1. Reusable Net Return Calculator implementation in pure JS (matching TypeScript engine)
function determineCostPayer(category, incoterm) {
  switch (incoterm) {
    case 'EXW':
      return category === 'sorting_grading' || category === 'packing_materials' ? 'SELLER' : 'BUYER';
    case 'FOB':
    case 'FAS':
    case 'FCA':
      if (category === 'ocean_freight' || category === 'marine_insurance') return 'BUYER';
      return 'SELLER';
    case 'CFR':
    case 'CPT':
      if (category === 'marine_insurance') return 'BUYER';
      return 'SELLER';
    case 'CIF':
    case 'CIP':
    case 'DAP':
    case 'DPU':
    case 'DDP':
      return 'SELLER';
    default:
      return 'SELLER';
  }
}

const DEFAULT_ONION_1000KG_COSTS_INR = {
  sorting_grading: 1800.00,
  packing_materials: 2200.00,
  inland_transport: 4500.00,
  loading_handling: 1200.00,
  inspection_certification: 1500.00,
  customs_clearance: 2000.00,
  ocean_freight: 6200.00,
  marine_insurance: 850.00,
  port_charges: 1400.00,
  currency_conversion: 650.00,
  export_duty: 0.00
};

function calculateNetReturn(input) {
  const lotQty = input.lotQuantityKg;
  if (!lotQty || lotQty <= 0) throw new Error('Lot quantity must be greater than zero.');
  const unitPrice = input.unitPrice;
  if (!unitPrice || unitPrice <= 0) throw new Error('Unit price must be greater than zero.');
  const fxRate = input.exchangeRateToInr;
  if (!fxRate || fxRate <= 0) throw new Error('Exchange rate must be greater than zero.');

  const shrinkagePct = input.shrinkageRejectionPct !== undefined ? input.shrinkageRejectionPct : 6.00;
  if (shrinkagePct < 0 || shrinkagePct > 30) throw new Error('Shrinkage percentage must be between 0% and 30%.');

  const shrinkageKg = Math.round(((lotQty * shrinkagePct) / 100) * 100) / 100;
  const saleableQty = Math.round((lotQty - shrinkageKg) * 100) / 100;

  const grossProceedsForeign = Math.round((saleableQty * unitPrice) * 100) / 100;
  const grossProceedsInr = Math.round((grossProceedsForeign * fxRate) * 100) / 100;

  let totalSellerDeductionsInr = 0;
  const scale = lotQty / 1000;

  for (const [cat, baseAmount] of Object.entries(DEFAULT_ONION_1000KG_COSTS_INR)) {
    const payer = determineCostPayer(cat, input.incoterm);
    const amount = Math.round(baseAmount * scale * 100) / 100;
    if (payer === 'SELLER') {
      totalSellerDeductionsInr = Math.round((totalSellerDeductionsInr + amount) * 100) / 100;
    }
  }

  const netProceedsInr = Math.round((grossProceedsInr - totalSellerDeductionsInr) * 100) / 100;
  const netPerKgInr = Math.round((netProceedsInr / saleableQty) * 100) / 100;

  let farmingProfitInr = undefined;
  if (input.productionCostPerKgInr !== undefined && input.productionCostPerKgInr > 0) {
    const totalProdCost = Math.round((input.productionCostPerKgInr * lotQty) * 100) / 100;
    farmingProfitInr = Math.round((netProceedsInr - totalProdCost) * 100) / 100;
  }

  return {
    lotQuantityKg: lotQty,
    shrinkageKg,
    saleableQuantityKg: saleableQty,
    grossProceedsForeign,
    grossProceedsInr,
    totalSellerDeductionsInr,
    netProceedsInr,
    netPerKgInr,
    farmingProfitInr,
    summarySentenceEn: `You may receive ₹${netPerKgInr.toFixed(2)} per kg after costs`,
    summarySentenceHi: `सभी खर्च काटकर आपको लगभग ₹${netPerKgInr.toFixed(2)} प्रति किलो मिल सकते हैं`,
    summarySentenceMr: `सर्व खर्च वजा जाता तुम्हाला अंदाजे ₹${netPerKgInr.toFixed(2)} प्रति किलो मिळू शकतात`
  };
}

// --------------------------------------------------------------------
// RUN TESTS
// --------------------------------------------------------------------

// TEST 1: The 1,000 kg Onion to UAE Benchmark
console.log('▶ Test 1: 1,000 kg Onion to UAE at 2.40 AED/kg, FX = 22.80 INR/AED (FOB Nhava Sheva)');
const t1 = calculateNetReturn({
  lotQuantityKg: 1000,
  shrinkageRejectionPct: 6.0,
  unitPrice: 2.40,
  currency: 'AED',
  incoterm: 'FOB',
  exchangeRateToInr: 22.80,
  productionCostPerKgInr: 14.50
});

assert.strictEqual(t1.shrinkageKg, 60, 'Shrinkage must be 60 kg');
assert.strictEqual(t1.saleableQuantityKg, 940, 'Saleable qty must be 940 kg');
assert.strictEqual(t1.grossProceedsForeign, 2256.00, 'Gross AED must be 2,256.00');
assert.strictEqual(t1.grossProceedsInr, 51436.80, 'Gross INR must be 51,436.80');

// Under FOB, total seller deductions = 1800 + 2200 + 4500 + 1200 + 1500 + 2000 + 1400 + 650 = 15,250 INR
assert.strictEqual(t1.totalSellerDeductionsInr, 15250.00, 'FOB deductions must be ₹15,250.00');
assert.strictEqual(t1.netProceedsInr, 36186.80, 'Net INR must be ₹36,186.80');
assert.strictEqual(t1.netPerKgInr, 38.50, 'Net per kg must be ₹38.50/kg');
assert.strictEqual(t1.farmingProfitInr, 21686.80, 'Farming profit must be ₹21,686.80');
assert.strictEqual(t1.summarySentenceEn, 'You may receive ₹38.50 per kg after costs');
console.log(`  ✓ 1,000 kg Lot: Saleable 940 kg | Gross: ₹${t1.grossProceedsInr} | Deductions: ₹${t1.totalSellerDeductionsInr} | Net: ₹${t1.netProceedsInr} (₹${t1.netPerKgInr}/kg)`);
console.log(`  ✓ Natural Phrasing: "${t1.summarySentenceEn}"`);
console.log(`  ✓ Hindi: "${t1.summarySentenceHi}"`);
console.log(`  ✓ Marathi: "${t1.summarySentenceMr}"`);

// TEST 2: FOB vs CIF Deductions (Freight + Insurance)
console.log('\n▶ Test 2: FOB vs CIF Allocation (Zero Double-Counting)');
const fob = calculateNetReturn({ lotQuantityKg: 1000, unitPrice: 3.00, currency: 'AED', incoterm: 'FOB', exchangeRateToInr: 22.80 });
const cif = calculateNetReturn({ lotQuantityKg: 1000, unitPrice: 3.00, currency: 'AED', incoterm: 'CIF', exchangeRateToInr: 22.80 });
const diff = cif.totalSellerDeductionsInr - fob.totalSellerDeductionsInr;
assert.strictEqual(diff, 6200 + 850, 'CIF must exceed FOB by Ocean Freight (6,200) + Marine Insurance (850)');
console.log(`  ✓ FOB Deductions: ₹${fob.totalSellerDeductionsInr} | CIF Deductions: ₹${cif.totalSellerDeductionsInr} (Delta: ₹${diff})`);

// TEST 3: Validation Boundaries
console.log('\n▶ Test 3: Validation Boundaries');
assert.throws(() => calculateNetReturn({ lotQuantityKg: 0, unitPrice: 2, exchangeRateToInr: 22 }), /Lot quantity must be greater than zero/);
assert.throws(() => calculateNetReturn({ lotQuantityKg: 100, unitPrice: 0, exchangeRateToInr: 22 }), /Unit price must be greater than zero/);
assert.throws(() => calculateNetReturn({ lotQuantityKg: 100, unitPrice: 2, exchangeRateToInr: 0 }), /Exchange rate must be greater than zero/);
assert.throws(() => calculateNetReturn({ lotQuantityKg: 100, unitPrice: 2, exchangeRateToInr: 22, shrinkageRejectionPct: 40 }), /Shrinkage percentage must be between 0% and 30%/);

// Unknown production cost: farmingProfitInr must be undefined
const noProd = calculateNetReturn({ lotQuantityKg: 1000, unitPrice: 2, currency: 'AED', incoterm: 'FOB', exchangeRateToInr: 22.80 });
assert.strictEqual(noProd.farmingProfitInr, undefined, 'Farming profit must be undefined if production cost is missing');
console.log('  ✓ All boundary validations passed cleanly');

console.log('\n🎉 ALL TESTS PASSED! 3/3 Test Suites Succeeded.\n');
