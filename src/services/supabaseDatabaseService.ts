// ====================================================================
// KRISHIMARKET: SUPABASE DATABASE REPOSITORY & SYNC SERVICE
// Handles persistent database operations for Crop Lots, Offers, Prices,
// and Export Quotations with optimistic offline-first local fallbacks.
// ====================================================================

import { getSupabaseClient, supabaseManager } from './supabaseClient';
import { CropLot, BuyerOffer, MarketPriceRecord, FarmVisitAppointment } from '../types';
import { ExportListing } from '../types/globalTrade';

export class SupabaseDatabaseService {
  private static instance: SupabaseDatabaseService;

  private constructor() {}

  public static getInstance(): SupabaseDatabaseService {
    if (!SupabaseDatabaseService.instance) {
      SupabaseDatabaseService.instance = new SupabaseDatabaseService();
    }
    return SupabaseDatabaseService.instance;
  }

  /**
   * Check if Supabase client is live and ready for DB calls.
   */
  public isDatabaseConnected(): boolean {
    return supabaseManager.getClient() !== null;
  }

  // ==================================================================
  // 1. CROP LOTS TABLE (crop_lots)
  // ==================================================================

  /**
   * Fetch all crop lots from Supabase or fallback to local storage.
   */
  public async getCropLots(): Promise<CropLot[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.getLocalCropLots();
    }

    try {
      const { data, error } = await supabase
        .from('crop_lots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return this.getLocalCropLots();
      }

      // Map Supabase rows to CropLot interface
      return data.map((row: any): CropLot => {
        const expectedPrice = Number(row.expected_price_per_q || 2750);
        return {
          id: row.id,
          lotCode: row.lot_code,
          farmerId: row.farmer_id || 'usr-farmer-01',
          farmerName: row.farmer_name || 'Ramesh Patil',
          farmerPhone: row.farmer_phone || '+91 98234 56789',
          village: row.village || 'Pimpalgaon Baswant',
          district: row.district || 'Nashik',
          state: row.state || 'Maharashtra',
          farmAddress: row.farm_address,
          commodity: row.commodity,
          variety: row.variety,
          quantityQuintals: Number(row.quantity_quintals || (row.quantity_mt ? row.quantity_mt * 10 : 75)),
          expectedPricePerQ: expectedPrice,
          minAcceptablePricePerQ: Number(row.min_acceptable_price_per_q || Math.round(expectedPrice * 0.9)),
          storageAvailable: Boolean(row.storage_available ?? true),
          storageCostPerDayPerQ: Number(row.storage_cost_per_day_per_q || 1.5),
          expectedHarvestDate: row.expected_harvest_date || '2026-10-25',
          photos: row.photos || [],
          aiPreliminaryGrade: row.ai_preliminary_grade || 'Grade A',
          verifiedGrade: row.verified_grade || 'Grade A',
          status: row.status || 'active',
          offersCount: Number(row.offers_count || 0),
          createdAt: row.created_at || new Date().toISOString(),
          passportEvents: row.passport_events || []
        };
      });
    } catch (err) {
      console.warn('Supabase fetch crop_lots failed, fallback to local storage:', err);
      return this.getLocalCropLots();
    }
  }

  /**
   * Save a newly created or photographed Crop Lot to Supabase.
   */
  public async saveCropLot(lot: CropLot): Promise<{ success: boolean; error?: string }> {
    // 1. Always save to local storage first (optimistic offline-first)
    this.saveLocalCropLot(lot);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const dbRow = {
        id: lot.id,
        lot_code: lot.lotCode,
        farmer_name: lot.farmerName,
        farmer_phone: lot.farmerPhone,
        village: lot.village,
        district: lot.district,
        state: lot.state,
        farm_address: lot.farmAddress,
        commodity: lot.commodity,
        variety: lot.variety,
        quantity_quintals: lot.quantityQuintals,
        quantity_mt: lot.quantityQuintals / 10,
        expected_price_per_q: lot.expectedPricePerQ,
        expected_harvest_date: lot.expectedHarvestDate,
        photos: lot.photos,
        ai_preliminary_grade: lot.aiPreliminaryGrade,
        verified_grade: lot.verifiedGrade,
        status: lot.status,
        passport_events: lot.passportEvents,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('crop_lots')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase save crop_lot error (table may need schema creation):', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Supabase upsert failed:', err);
      return { success: false, error: err?.message };
    }
  }

  // ==================================================================
  // 2. BUYER OFFERS TABLE (buyer_offers)
  // ==================================================================

  /**
   * Fetch buyer offers from Supabase.
   */
  public async getBuyerOffers(): Promise<BuyerOffer[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.getLocalOffers();
    }

    try {
      const { data, error } = await supabase
        .from('buyer_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return this.getLocalOffers();
      }

      return data.map((row: any) => ({
        id: row.id,
        lotId: row.lot_id,
        lotCode: row.lot_code,
        buyerId: row.buyer_id,
        buyerName: row.buyer_name,
        buyerCompany: row.buyer_company,
        buyerType: row.buyer_type,
        buyerTrustScore: Number(row.buyer_trust_score || 95),
        buyerCompletedTrades: Number(row.buyer_completed_trades || 40),
        offerPricePerQ: Number(row.offer_price_per_q),
        quantityRequestedQ: Number(row.quantity_requested_q),
        transportPaidBy: row.transport_paid_by || 'BUYER',
        estimatedTransportCostPerQ: Number(row.estimated_transport_cost_per_q || 0),
        estimatedHandlingCostPerQ: Number(row.estimated_handling_cost_per_q || 25),
        estimatedNetRealisationPerQ: Number(row.estimated_net_realisation_per_q || row.offer_price_per_q - 25),
        status: row.status,
        validUntil: row.valid_until,
        createdAt: row.created_at,
        termsNotes: row.terms_notes
      }));
    } catch (err) {
      return this.getLocalOffers();
    }
  }

  /**
   * Insert a buyer offer into Supabase.
   */
  public async submitBuyerOffer(offer: BuyerOffer): Promise<{ success: boolean; error?: string }> {
    this.saveLocalOffer(offer);

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('buyer_offers').insert({
        id: offer.id,
        lot_id: offer.lotId,
        lot_code: offer.lotCode,
        buyer_id: offer.buyerId,
        buyer_name: offer.buyerName,
        buyer_company: offer.buyerCompany,
        buyer_type: offer.buyerType,
        buyer_trust_score: offer.buyerTrustScore,
        buyer_completed_trades: offer.buyerCompletedTrades,
        offer_price_per_q: offer.offerPricePerQ,
        quantity_requested_q: offer.quantityRequestedQ,
        transport_paid_by: offer.transportPaidBy,
        estimated_transport_cost_per_q: offer.estimatedTransportCostPerQ,
        estimated_handling_cost_per_q: offer.estimatedHandlingCostPerQ,
        estimated_net_realisation_per_q: offer.estimatedNetRealisationPerQ,
        status: offer.status,
        valid_until: offer.validUntil,
        terms_notes: offer.termsNotes,
        created_at: new Date().toISOString()
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  // ==================================================================
  // 3. GLOBAL TRADE EXPORT LISTINGS TABLE
  // ==================================================================

  public async saveExportListing(listing: ExportListing): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('export_quotations').upsert({
        id: listing.id,
        listing_code: listing.listingCode,
        commodity: listing.commodity,
        variety: listing.variety,
        seller_name: listing.sellerName,
        seller_phone: listing.sellerPhone,
        destination_country: listing.targetDestinationCountry,
        destination_port: listing.targetDestinationPort,
        quantity_kg: listing.totalQuantityKg,
        preferred_incoterm: listing.preferredIncoterm,
        preferred_currency: listing.preferredCurrency,
        status: listing.status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  // ==================================================================
  // LOCAL STORAGE FALLBACK HELPERS
  // ==================================================================

  private getLocalCropLots(): CropLot[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('amip_crop_lots_v1');
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return [];
  }

  private saveLocalCropLot(lot: CropLot): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const lots = this.getLocalCropLots();
        const existingIdx = lots.findIndex(l => l.id === lot.id);
        if (existingIdx >= 0) {
          lots[existingIdx] = lot;
        } else {
          lots.unshift(lot);
        }
        localStorage.setItem('amip_crop_lots_v1', JSON.stringify(lots));
      }
    } catch (e) {
      console.warn('Error saving lot to local storage:', e);
    }
  }

  private getLocalOffers(): BuyerOffer[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('amip_buyer_offers_v1');
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return [];
  }

  private saveLocalOffer(offer: BuyerOffer): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const offers = this.getLocalOffers();
        offers.unshift(offer);
        localStorage.setItem('amip_buyer_offers_v1', JSON.stringify(offers));
      }
    } catch (e) {}
  }
}

export const supabaseDatabaseService = SupabaseDatabaseService.getInstance();
