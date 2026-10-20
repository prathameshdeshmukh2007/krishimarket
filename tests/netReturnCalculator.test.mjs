// ====================================================================
// TEST SUITE: NET RETURN CALCULATOR (1,000 kg Onion to UAE Test Case)
// Covers Incoterms 2020 (FOB vs CIF), Shrinkage, Exchange Rates,
// Currency Conversions, Zero Double-Counting, and Error Edge Cases.
// ====================================================================

import assert from 'node:assert';
import { calculateNetReturn, determineCostPayer } from '../src/services/netReturnCalculator.js';

console.log('🧪 Running KrishiMarket Net Return Calculator Tests...\n');

// --------------------------------------------------------------------
// TEST 1: The Benchmark 1,000 kg Export Onion to UAE via FOB Nhava Sheva
// --------------------------------------------------------------------
{
  console.log('▶ Test 1: 1,000 kg Onion to UAE (FOB Nhava Sheva at 2.40 AED/kg, FX = 22.80 INR/AED)');
  
  const result = calculateNetReturn({
    lotQuantityKg: 1000,
    shrinkageRejectionPct: 6.0, // 6% standard shrinkage
    unitPrice: 2.40, // 2.40 AED/kg
    currency: 'AED',
    incoterm: 'FOB',
    namedPortOrPlace: 'FOB Nhava Sheva (INNSA)',
    exchangeRateToInr: 22.80, // 1 AED = 22.80 INR
    fxRateSource: 'Reference Exchange Rate (AED Peg 3.6725 / USD-INR 83.72)',
    fxRateTimestamp: '2026-10-20T05:00:00Z',
    productionCostPerKgInr: 14.50 // ₹14.50/kg cost of cultivation
  });

  // Verify shrinkage & saleable quantity
  assert.strictEqual(result.shrinkageRejectionKg, 60, 'Shrinkage must be 60 kg (6% of 1000 kg)');
  assert.strictEqual(result.saleableQuantityKg, 940, 'Saleable quantity must be 940 kg');

  // Verify gross proceeds
  // 940 kg * 2.40 AED = 2,256.00 AED
  assert.strictEqual(result.grossProceedsForeignCurrency, 2256.00, 'Gross foreign proceeds must be 2,256.00 AED');
  // 2,256.00 AED * 22.80 INR/AED = 51,436.80 INR
  assert.strictEqual(result.grossProceedsInr, 51436.80, 'Gross INR proceeds must be ₹51,436.80');

  // Verify FOB Incoterm: Ocean freight and marine insurance must be paid by BUYER, not SELLER
  const freight = result.itemizedCosts.find(c => c.category === 'ocean_freight');
  const insurance = result.itemizedCosts.find(c => c.category === 'marine_insurance');
  const sorting = result.itemizedCosts.find(c => c.category === 'sorting_grading');
  const inlandTransport = result.itemizedCosts.find(c => c.category === 'inland_transport');

  assert.strictEqual(freight?.payerParty, 'BUYER', 'Under FOB, Ocean Freight must be borne by BUYER');
  assert.strictEqual(insurance?.payerParty, 'BUYER', 'Under FOB, Marine Insurance must be borne by BUYER');
  assert.strictEqual(sorting?.payerParty, 'SELLER', 'Sorting must be borne by SELLER');
  assert.strictEqual(inlandTransport?.payerParty, 'SELLER', 'Inland transport to port must be borne by SELLER');

  // Verify net per kg and deductions
  assert(result.totalSellerDeductionsInr > 0, 'Seller deductions must be greater than zero');
  assert(result.netProceedsInr < result.grossProceedsInr, 'Net proceeds must equal gross minus deductions');
  assert.strictEqual(result.netProceedsInr, result.grossProceedsInr - result.totalSellerDeductionsInr);
  
  // Verify net per kg is calculated on saleable quantity (940 kg)
  const expectedNetPerKg = Math.round((result.netProceedsInr / 940) * 100) / 100;
  assert.strictEqual(result.netPerKgInr, expectedNetPerKg, 'Net per kg must equal net proceeds / 940 kg');

  // Verify farming profit calculation when production cost is known
  assert(result.estimatedFarmingProfitInr !== undefined, 'Farming profit should be calculated when production cost is given');
  assert.strictEqual(result.estimatedFarmingProfitInr, Math.round((result.netProceedsInr - (14.50 * 1000)) * 100) / 100);

  // Check language summary sentence
  assert(result.summarySentenceEn.includes('You may receive ₹'), 'English summary sentence missing expected phrasing');
  assert(result.summarySentenceHi.includes('प्रति किलो मिल सकते हैं'), 'Hindi summary missing natural phrasing');
  assert(result.summarySentenceMr.includes('प्रति किलो मिळू शकतात'), 'Marathi summary missing natural phrasing');

  console.log(`  ✓ Gross: ₹${result.grossProceedsInr} | Deductions: ₹${result.totalSellerDeductionsInr} | Net: ₹${result.netProceedsInr} (₹${result.netPerKgInr}/kg)`);
  console.log(`  ✓ Summary: "${result.summarySentenceEn}"`);
}

// --------------------------------------------------------------------
// TEST 2: FOB vs CIF Incoterms 2020 Comparison (No Double Counting)
// --------------------------------------------------------------------
{
  console.log('\n▶ Test 2: FOB vs CIF Incoterms Cost Allocation (Zero Double-Counting)');

  const fobResult = calculateNetReturn({
    lotQuantityKg: 1000,
    unitPrice: 3.00,
    currency: 'AED',
    incoterm: 'FOB',
    namedPortOrPlace: 'Nhava Sheva',
    exchangeRateToInr: 22.80,
    fxRateSource: 'Test',
    fxRateTimestamp: '2026-10-20'
  });

  const cifResult = calculateNetReturn({
    lotQuantityKg: 1000,
    unitPrice: 3.00,
    currency: 'AED',
    incoterm: 'CIF',
    namedPortOrPlace: 'Jebel Ali',
    exchangeRateToInr: 22.80,
    fxRateSource: 'Test',
    fxRateTimestamp: '2026-10-20'
  });

  // Under CIF, seller pays ocean freight (6,200) + insurance (850) = 7,050 INR more
  const difference = cifResult.totalSellerDeductionsInr - fobResult.totalSellerDeductionsInr;
  assert.strictEqual(difference, 6200 + 850, 'CIF deductions must exceed FOB by exactly Freight (6200) + Insurance (850)');
  assert(cifResult.netProceedsInr < fobResult.netProceedsInr, 'Net proceeds under CIF must be lower due to freight & insurance');
  console.log(`  ✓ FOB Deductions: ₹${fobResult.totalSellerDeductionsInr} vs CIF Deductions: ₹${cifResult.totalSellerDeductionsInr} (Delta: ₹${difference})`);
}

// --------------------------------------------------------------------
// TEST 3: Validation and Error Edge Cases
// --------------------------------------------------------------------
{
  console.log('\n▶ Test 3: Validation & Boundary Edge Cases');

  // Negative / Zero quantity
  assert.throws(() => {
    calculateNetReturn({
      lotQuantityKg: 0,
      unitPrice: 2.50,
      currency: 'AED',
      incoterm: 'FOB',
      namedPortOrPlace: 'JNPT',
      exchangeRateToInr: 22.80,
      fxRateSource: 'Test',
      fxRateTimestamp: '2026-10-20'
    });
  }, /Lot quantity must be greater than zero/, 'Should reject 0 kg lot quantity');

  // Negative / Zero unit price
  assert.throws(() => {
    calculateNetReturn({
      lotQuantityKg: 1000,
      unitPrice: 0,
      currency: 'AED',
      incoterm: 'FOB',
      namedPortOrPlace: 'JNPT',
      exchangeRateToInr: 22.80,
      fxRateSource: 'Test',
      fxRateTimestamp: '2026-10-20'
    });
  }, /Unit price must be greater than zero/, 'Should reject 0 unit price');

  // Unrealistic shrinkage percentage (>30%)
  assert.throws(() => {
    calculateNetReturn({
      lotQuantityKg: 1000,
      shrinkageRejectionPct: 35,
      unitPrice: 2.50,
      currency: 'AED',
      incoterm: 'FOB',
      namedPortOrPlace: 'JNPT',
      exchangeRateToInr: 22.80,
      fxRateSource: 'Test',
      fxRateTimestamp: '2026-10-20'
    });
  }, /Shrinkage percentage must be between 0% and 30%/, 'Should reject excessive shrinkage');

  // Unknown production cost: Ensure farming profit is NOT populated and never called profit
  const noProductionCostResult = calculateNetReturn({
    lotQuantityKg: 1000,
    unitPrice: 2.50,
    currency: 'AED',
    incoterm: 'FOB',
    namedPortOrPlace: 'JNPT',
    exchangeRateToInr: 22.80,
    fxRateSource: 'Test',
    fxRateTimestamp: '2026-10-20'
  });
  assert.strictEqual(noProductionCostResult.estimatedFarmingProfitInr, undefined, 'Farming profit must be undefined if production cost is unknown');

  console.log('  ✓ Edge case validations passed successfully');
}

console.log('\n✅ All Net Return Calculator Unit Tests Passed (3/3 Suites Clean)!\n');
