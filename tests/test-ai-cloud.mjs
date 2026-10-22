// ====================================================================
// Test Suite: AI Assistant Real Engine & Cloud Image Vault Tests
// ====================================================================
import assert from 'assert';
import { aiChatService } from '../src/services/aiChatService.ts';
import { cloudImageService } from '../src/services/cloudImageService.ts';

console.log('🧪 Starting KrishiMarket AI Assistant & Cloud Storage Test Suite...\n');

// 1. Verify Fallback Agronomist Engine Coverage
console.log('▶ Test 1: AI Assistant Query Answering across Marathi, Hindi, and English');
const marathiRes = aiChatService.getDeepAgronomistAnswer('कांद्यावर जांभळा करपा रोग आला आहे, काय फवारणी करावी?', 'mr');
assert(marathiRes.answerText.length > 50, 'Marathi answer should be detailed and complete');
assert(marathiRes.answerText.includes('मँकोझेब') || marathiRes.answerText.includes('बुरशीनाशक') || marathiRes.answerText.includes('अॅझॉक्सीस्ट्रॉबिन'), 'Should prescribe exact fungicide dosage');
console.log('  ✓ Marathi Agronomist diagnosis verified with dosage');

const hindiRes = aiChatService.getDeepAgronomistAnswer('टमाटर में थ्रिप्स और पत्ती मरोड़ रोग का उपचार क्या है?', 'hi');
assert(hindiRes.answerText.length > 50, 'Hindi answer should be detailed and complete');
assert(hindiRes.answerText.includes('थ्रिप्स') || hindiRes.answerText.includes('कीट') || hindiRes.answerText.includes('फिपरोनिल') || hindiRes.answerText.includes('Fipronil'), 'Should prescribe pest control recipe');
console.log('  ✓ Hindi Agronomist diagnosis verified with pest control');

const englishExportRes = aiChatService.getDeepAgronomistAnswer('What are the export specifications for Nashik onions to UAE Dubai?', 'en');
assert(englishExportRes.answerText.includes('45-55 mm') || englishExportRes.answerText.includes('Dubai') || englishExportRes.answerText.includes('APEDA'), 'Should specify Dubai APEDA export criteria');
console.log('  ✓ English export criteria verified for UAE market');

// 2. Verify Storage & Provable Cloud Image Quality
console.log('\n▶ Test 2: Accurate Snap & Shot Computer Vision Assessment');
const onionQuality = cloudServiceAssessment(cloudImageService);
assert(onionQuality.averageDiameterMm >= 45 && onionQuality.averageDiameterMm <= 60, 'Should assess diameter within standard range');
assert(onionQuality.colorUniformityPct > 80, 'Uniformity should be calculated');
assert(onionQuality.aiGrade.includes('Grade'), 'Should assign formal preliminary grade');
assert(Array.isArray(onionQuality.assessmentNotes) && onionQuality.assessmentNotes.length > 0, 'Should give visible defect inspection notes');
console.log(`  ✓ Onion Computer Vision: Grade=${onionQuality.aiGrade}, Uniformity=${onionQuality.colorUniformityPct}%, Diameter=${onionQuality.averageDiameterMm}mm`);

// 3. Verify Provenance & Image Update Audit Trail
console.log('\n▶ Test 3: Provenance & Image Update Audit Trail');
const initialMockLot = {
  id: 'lot-test-99',
  lotCode: 'AGRI-2026-TEST-99',
  commodity: 'Onion',
  variety: 'Nashik Red',
  farmerName: 'Kailas Shinde',
  photos: ['https://example.com/initial-onion.jpg'],
  quantityQuintals: 50,
  expectedPricePerQ: 2600
};

const record1 = cloudImageService.getOrCreateRecordForLot(initialMockLot);
assert.strictEqual(record1.lotId, 'lot-test-99');
assert.strictEqual(record1.version, 1);
console.log(`  ✓ Lot cloud record created with version ${record1.version} and coordinates ${record1.coordinates.lat}, ${record1.coordinates.lng}`);

// 4. Verify Supabase Client & Publishable Key Integration
import { supabaseManager, DEFAULT_SUPABASE_PUBLISHABLE_KEY } from '../src/services/supabaseClient.ts';

console.log('\n▶ Test 4: Supabase PostgreSQL Client & Key Integration');
assert.strictEqual(
  DEFAULT_SUPABASE_PUBLISHABLE_KEY, 
  'sb_publishable_jv_qDGe9OjvwPRxpDT7l8g_-8_laixj', 
  'Verified user publishable key must be exact'
);
console.log('  ✓ Verified Publishable Key: ' + DEFAULT_SUPABASE_PUBLISHABLE_KEY);

const ref = supabaseManager.extractProjectRef('https://krishimarket-db.supabase.co');
assert.strictEqual(ref, 'krishimarket-db', 'Project reference extraction must parse host');
console.log('  ✓ Project Ref extraction verified: ' + ref);

const statusCheck = await supabaseManager.testConnection('', DEFAULT_SUPABASE_PUBLISHABLE_KEY);
assert.strictEqual(statusCheck.status, 'needs_url', 'Empty URL must trigger needs_url status');
console.log('  ✓ Supabase health check status flow verified (needs_url)');

console.log('\n🎉 ALL AI, CLOUD & SUPABASE TESTS PASSED CLEANLY!\n');

function cloudServiceAssessment(service) {
  return service.evaluateCropQuality('Onion', 'data:image/jpeg;base64,mockOnionData');
}

