-- ====================================================================
-- KRISHIMARKET: GLOBAL TRADE MODULE (PostgreSQL / Supabase Migration)
-- Non-destructive migration creating production-grade Global Trade tables,
-- constraints, audit logging, RLS policies, and quote acceptance procedures.
-- ====================================================================

-- 1. Ensure cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Domain Types
DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM ('fpo', 'exporter', 'importer_buyer', 'trade_house', 'logistics_partner');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_trade_role AS ENUM ('farmer', 'fpo_admin', 'buyer', 'exporter', 'platform_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE incoterm_type AS ENUM ('EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE trade_currency AS ENUM ('INR', 'USD', 'AED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE export_listing_status AS ENUM ('draft', 'published', 'negotiating', 'partially_allocated', 'fully_allocated', 'closed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM ('pending_verification', 'verified', 'rejected_by_admin', 'under_review', 'accepted', 'countered', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('draft', 'confirmed_accepted', 'inspection_scheduled', 'inspection_passed', 'packing_in_progress', 'customs_cleared', 'shipped_in_transit', 'arrived_destination', 'delivered', 'completed_settled', 'cancelled', 'disputed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE observation_price_category AS ENUM (
        'verified_current_buyer_quotation',
        'verified_exporter_quotation',
        'historical_export_statistics',
        'domestic_mandi_reference_price',
        'indicative_estimate'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    org_type organization_type NOT NULL,
    country VARCHAR(3) NOT NULL DEFAULT 'IND', -- ISO-3166 alpha-3
    state VARCHAR(100),
    district VARCHAR(100),
    tax_id VARCHAR(50), -- GSTIN for India, TRN for UAE
    iec_code VARCHAR(20), -- Import Export Code for Indian entities
    apeda_registration_no VARCHAR(50), -- RCMC number with APEDA
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Profiles with Global Trade Roles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Foreign key to auth.users if Supabase Auth is active
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_trade_role NOT NULL DEFAULT 'farmer',
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'en', -- en, hi, mr
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_kyc_approved BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_phone_indian_format CHECK (phone_number ~ '^\+91[6-9]\d{9}$')
);

-- 5. Data Sources & Ingestion Tracking
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_code VARCHAR(50) UNIQUE NOT NULL, -- 'AGMARKNET_DATA_GOV', 'APEDA_AGRIEXCHANGE', 'RBI_FX', 'OPEN_EXCHANGE_RATES'
    display_name VARCHAR(150) NOT NULL,
    homepage_url TEXT NOT NULL,
    api_endpoint TEXT,
    reporting_frequency VARCHAR(50) NOT NULL, -- 'DAILY_15_MIN', 'DAILY_AUCTION_CLOSE', 'HOURLY_FX', 'MONTHLY_APEDA'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_successful_sync TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    consecutive_failures INT NOT NULL DEFAULT 0,
    health_status VARCHAR(20) NOT NULL DEFAULT 'HEALTHY', -- 'HEALTHY', 'STALE', 'DEGRADED', 'UNAVAILABLE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    records_fetched INT NOT NULL DEFAULT 0,
    records_inserted INT NOT NULL DEFAULT 0,
    records_updated INT NOT NULL DEFAULT 0,
    records_rejected INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL, -- 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL'
    error_summary TEXT,
    raw_payload_checksum VARCHAR(64)
);

-- 6. FX Rates Table (Preserving Raw & Reference Pegged Rates)
CREATE TABLE IF NOT EXISTS fx_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency trade_currency NOT NULL,
    target_currency trade_currency NOT NULL,
    rate NUMERIC(14, 6) NOT NULL CHECK (rate > 0),
    is_pegged_reference BOOLEAN NOT NULL DEFAULT FALSE, -- true for AED/USD 3.6725
    source_name VARCHAR(100) NOT NULL, -- 'Central Bank of UAE Peg Ref', 'RBI Reference', 'Live FX API'
    observation_timestamp TIMESTAMPTZ NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_fx_pair_timestamp UNIQUE (base_currency, target_currency, observation_timestamp)
);

-- 7. Market Observations (Strictly separated 5 price categories)
CREATE TABLE IF NOT EXISTS market_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity VARCHAR(100) NOT NULL, -- e.g. 'Onion (Export Grade Garwa)'
    variety VARCHAR(100),
    origin_state VARCHAR(60) NOT NULL,
    origin_district VARCHAR(60) NOT NULL,
    origin_mandi_or_port VARCHAR(100) NOT NULL, -- e.g. 'Lasalgaon Mandi' or 'Nhava Sheva Port'
    destination_country VARCHAR(3) NOT NULL, -- 'ARE', 'IND', etc.
    price_category observation_price_category NOT NULL,
    raw_price_value NUMERIC(14, 2) NOT NULL CHECK (raw_price_value > 0),
    raw_price_unit VARCHAR(30) NOT NULL, -- '₹/Quintal', 'AED/Metric_Tonne', 'USD/kg'
    normalized_price_per_kg_inr NUMERIC(14, 4) NOT NULL CHECK (normalized_price_per_kg_inr > 0),
    currency trade_currency NOT NULL DEFAULT 'INR',
    observation_date DATE NOT NULL,
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    source_attribution TEXT NOT NULL,
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    conversion_method TEXT,
    freshness_status VARCHAR(20) NOT NULL DEFAULT 'FRESH', -- 'FRESH', 'PREVIOUS_SESSION', 'STALE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_obs_comm_dest_cat ON market_observations(commodity, destination_country, price_category);
CREATE INDEX IF NOT EXISTS idx_obs_date ON market_observations(observation_date DESC);

-- 8. Export Listings (e.g. 1,000 kg Export Onions to UAE)
CREATE TABLE IF NOT EXISTS export_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. 'KM-EXP-2026-ONION-001'
    seller_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    seller_organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT,
    commodity VARCHAR(100) NOT NULL DEFAULT 'Onion',
    variety VARCHAR(100) NOT NULL DEFAULT 'Nashik Red (Garwa)',
    grade VARCHAR(50) NOT NULL DEFAULT 'Export Grade A+ (45mm - 55mm)',
    total_quantity_kg NUMERIC(14, 2) NOT NULL CHECK (total_quantity_kg > 0),
    available_quantity_kg NUMERIC(14, 2) NOT NULL CHECK (available_quantity_kg >= 0),
    allocated_quantity_kg NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (allocated_quantity_kg >= 0),
    min_order_quantity_kg NUMERIC(14, 2) NOT NULL CHECK (min_order_quantity_kg > 0),
    target_destination_country VARCHAR(3) NOT NULL DEFAULT 'ARE', -- UAE
    target_destination_port VARCHAR(100) NOT NULL DEFAULT 'Jebel Ali Port, Dubai (AEJEA)',
    preferred_incoterm incoterm_type NOT NULL DEFAULT 'FOB',
    preferred_currency trade_currency NOT NULL DEFAULT 'AED',
    indicative_fob_price_per_kg NUMERIC(14, 2) CHECK (indicative_fob_price_per_kg > 0),
    origin_state VARCHAR(60) NOT NULL DEFAULT 'Maharashtra',
    origin_district VARCHAR(60) NOT NULL DEFAULT 'Nashik',
    dispatch_hub_or_port VARCHAR(100) NOT NULL DEFAULT 'Nhava Sheva (JNPT Mumbai)',
    harvest_date DATE NOT NULL,
    packaging_details VARCHAR(150) NOT NULL DEFAULT '25kg Lenomesh Ventilated Bags in Pallets',
    expected_shrinkage_pct NUMERIC(5, 2) NOT NULL DEFAULT 6.00 CHECK (expected_shrinkage_pct >= 0 AND expected_shrinkage_pct <= 25),
    photo_urls TEXT[] NOT NULL DEFAULT '{}',
    status export_listing_status NOT NULL DEFAULT 'published',
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_qty_consistency CHECK (available_quantity_kg + allocated_quantity_kg <= total_quantity_kg)
);

CREATE INDEX IF NOT EXISTS idx_listings_comm_dest ON export_listings(commodity, target_destination_country, status);

-- 9. Buyer Quotes & Revisions
CREATE TABLE IF NOT EXISTS buyer_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(32) UNIQUE NOT NULL, -- e.g. 'QUO-2026-UAE-0891'
    listing_id UUID NOT NULL REFERENCES export_listings(id) ON DELETE RESTRICT,
    buyer_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    buyer_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(14, 2) NOT NULL CHECK (quantity_kg > 0),
    offered_price_per_kg NUMERIC(14, 4) NOT NULL CHECK (offered_price_per_kg > 0),
    currency trade_currency NOT NULL DEFAULT 'AED',
    incoterm incoterm_type NOT NULL DEFAULT 'FOB',
    named_port_or_place VARCHAR(150) NOT NULL, -- e.g. 'FOB Nhava Sheva (INNSA)' or 'CIF Jebel Ali (AEJEA)'
    total_quote_value NUMERIC(14, 2) NOT NULL CHECK (total_quote_value > 0),
    payment_terms VARCHAR(100) NOT NULL DEFAULT '100% Irrevocable LC at Sight from Prime UAE Bank',
    inspection_terms VARCHAR(100) NOT NULL DEFAULT 'SGS Pre-Shipment Inspection at Packhouse',
    status quote_status NOT NULL DEFAULT 'pending_verification',
    version INT NOT NULL DEFAULT 1,
    verified_by_admin_id UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMPTZ,
    admin_verification_notes TEXT,
    supporting_document_url TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_quote_expiry CHECK (valid_until > issued_at),
    CONSTRAINT chk_quote_arithmetic CHECK (total_quote_value = ROUND((quantity_kg * offered_price_per_kg)::numeric, 2))
);

CREATE INDEX IF NOT EXISTS idx_quotes_listing ON buyer_quotes(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_buyer ON buyer_quotes(buyer_user_id);

-- Version tracking for quote amendments
CREATE TABLE IF NOT EXISTS quote_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES buyer_quotes(id) ON DELETE CASCADE,
    version INT NOT NULL,
    quantity_kg NUMERIC(14, 2) NOT NULL,
    offered_price_per_kg NUMERIC(14, 4) NOT NULL,
    currency trade_currency NOT NULL,
    incoterm incoterm_type NOT NULL,
    named_port_or_place VARCHAR(150) NOT NULL,
    total_quote_value NUMERIC(14, 2) NOT NULL,
    amendment_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Export Cost Items & Net Return Estimates
CREATE TABLE IF NOT EXISTS export_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES buyer_quotes(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES export_listings(id) ON DELETE CASCADE,
    cost_category VARCHAR(60) NOT NULL, -- 'sorting_grading', 'packing_materials', 'inland_transport', 'loading_handling', 'inspection_certification', 'customs_clearance', 'ocean_freight', 'marine_insurance', 'port_charges', 'currency_conversion'
    display_title VARCHAR(120) NOT NULL,
    payer_party VARCHAR(20) NOT NULL, -- 'SELLER', 'BUYER'
    amount_currency trade_currency NOT NULL DEFAULT 'INR',
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    is_estimated BOOLEAN NOT NULL DEFAULT TRUE,
    documentation_ref VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS net_return_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES buyer_quotes(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES export_listings(id) ON DELETE CASCADE,
    lot_quantity_kg NUMERIC(14, 2) NOT NULL CHECK (lot_quantity_kg > 0),
    expected_shrinkage_rejection_pct NUMERIC(5, 2) NOT NULL DEFAULT 6.00,
    saleable_quantity_kg NUMERIC(14, 2) NOT NULL CHECK (saleable_quantity_kg > 0),
    agreed_unit_price NUMERIC(14, 4) NOT NULL,
    currency trade_currency NOT NULL,
    exchange_rate_to_inr NUMERIC(14, 4) NOT NULL CHECK (exchange_rate_to_inr > 0),
    fx_rate_timestamp TIMESTAMPTZ NOT NULL,
    gross_proceeds_inr NUMERIC(14, 2) NOT NULL CHECK (gross_proceeds_inr >= 0),
    total_seller_deductions_inr NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_seller_deductions_inr >= 0),
    net_proceeds_inr NUMERIC(14, 2) NOT NULL,
    net_per_kg_inr NUMERIC(14, 4) NOT NULL,
    production_cost_per_kg_inr NUMERIC(14, 2), -- Optional input
    estimated_farming_profit_inr NUMERIC(14, 2), -- Calculated only if production cost is provided
    calculation_assumptions JSONB NOT NULL DEFAULT '{}',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Trade Orders, Tracking Events & Compliance Documents
CREATE TABLE IF NOT EXISTS trade_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL, -- e.g. 'ORD-2026-EXP-0012'
    listing_id UUID NOT NULL REFERENCES export_listings(id) ON DELETE RESTRICT,
    accepted_quote_id UUID NOT NULL REFERENCES buyer_quotes(id) ON DELETE RESTRICT,
    seller_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    buyer_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    seller_org_id UUID REFERENCES organizations(id),
    buyer_org_id UUID REFERENCES organizations(id),
    commodity VARCHAR(100) NOT NULL,
    allocated_quantity_kg NUMERIC(14, 2) NOT NULL CHECK (allocated_quantity_kg > 0),
    contract_price_per_kg NUMERIC(14, 4) NOT NULL CHECK (contract_price_per_kg > 0),
    contract_currency trade_currency NOT NULL,
    incoterm incoterm_type NOT NULL,
    named_port_or_place VARCHAR(150) NOT NULL,
    total_contract_value NUMERIC(14, 2) NOT NULL CHECK (total_contract_value > 0),
    status order_status NOT NULL DEFAULT 'confirmed_accepted',
    idempotency_key VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES trade_orders(id) ON DELETE CASCADE,
    previous_status order_status,
    new_status order_status NOT NULL,
    event_title VARCHAR(150) NOT NULL,
    event_description TEXT NOT NULL,
    location VARCHAR(120),
    actor_user_id UUID REFERENCES user_profiles(id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES trade_orders(id) ON DELETE CASCADE,
    document_type VARCHAR(60) NOT NULL, -- 'IEC_CERTIFICATE', 'APEDA_RCMC', 'COMMERCIAL_INVOICE', 'PACKING_LIST', 'PHYTOSANITARY', 'BILL_OF_LADING', 'CERTIFICATE_OF_ORIGIN', 'UAE_FIRS_CUSTOMS_PERMIT'
    document_number VARCHAR(100),
    issuing_authority VARCHAR(120),
    file_url TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Audit Logs (Compliance & Financial Security)
-- NEVER logs OTPs, passwords, or payment secrets.
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(60) NOT NULL, -- 'buyer_quotes', 'trade_orders', 'export_costs'
    entity_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'VERIFIED_BY_ADMIN', 'QUOTE_ACCEPTED', 'COST_AMENDED', 'STATUS_CHANGED'
    actor_user_id UUID REFERENCES user_profiles(id),
    actor_role VARCHAR(50),
    client_ip_address VARCHAR(45),
    details JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Idempotent Transactional Quote Acceptance Function
-- Uses row-level lock on export_listings to prevent over-allocation.
CREATE OR REPLACE FUNCTION accept_buyer_quote(
    p_quote_id UUID,
    p_seller_user_id UUID,
    p_idempotency_key VARCHAR(64)
) RETURNS UUID AS $$
DECLARE
    v_quote buyer_quotes%ROWTYPE;
    v_listing export_listings%ROWTYPE;
    v_existing_order_id UUID;
    v_new_order_id UUID;
    v_order_number VARCHAR(32);
BEGIN
    -- 1. Idempotency Check
    SELECT id INTO v_existing_order_id FROM trade_orders WHERE idempotency_key = p_idempotency_key;
    IF v_existing_order_id IS NOT NULL THEN
        RETURN v_existing_order_id;
    END IF;

    -- 2. Fetch and validate quote
    SELECT * INTO v_quote FROM buyer_quotes WHERE id = p_quote_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quote not found';
    END IF;

    IF v_quote.status NOT IN ('verified', 'under_review') THEN
        RAISE EXCEPTION 'Only verified or reviewed quotes can be accepted. Current status: %', v_quote.status;
    END IF;

    IF v_quote.valid_until < NOW() THEN
        UPDATE buyer_quotes SET status = 'expired' WHERE id = p_quote_id;
        RAISE EXCEPTION 'Quote has expired on %', v_quote.valid_until;
    END IF;

    -- 3. Row lock on listing to serialize allocation
    SELECT * INTO v_listing FROM export_listings WHERE id = v_quote.listing_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Export listing not found';
    END IF;

    IF v_listing.seller_user_id != p_seller_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Only the listing owner can accept this quote';
    END IF;

    IF v_listing.available_quantity_kg < v_quote.quantity_kg THEN
        RAISE EXCEPTION 'Insufficient quantity remaining in lot. Available: % kg, Requested: % kg', 
            v_listing.available_quantity_kg, v_quote.quantity_kg;
    END IF;

    -- 4. Deduct available quantity and update listing allocation
    UPDATE export_listings
    SET available_quantity_kg = available_quantity_kg - v_quote.quantity_kg,
        allocated_quantity_kg = allocated_quantity_kg + v_quote.quantity_kg,
        status = CASE 
            WHEN (available_quantity_kg - v_quote.quantity_kg) <= 0 THEN 'fully_allocated'::export_listing_status
            ELSE 'partially_allocated'::export_listing_status
        END,
        updated_at = NOW()
    WHERE id = v_listing.id;

    -- 5. Mark quote as accepted
    UPDATE buyer_quotes
    SET status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_quote_id;

    -- 6. Create Trade Order
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::text, 1, 6);
    
    INSERT INTO trade_orders (
        order_number,
        listing_id,
        accepted_quote_id,
        seller_user_id,
        buyer_user_id,
        seller_org_id,
        buyer_org_id,
        commodity,
        allocated_quantity_kg,
        contract_price_per_kg,
        contract_currency,
        incoterm,
        named_port_or_place,
        total_contract_value,
        status,
        idempotency_key
    ) VALUES (
        v_order_number,
        v_listing.id,
        v_quote.id,
        v_listing.seller_user_id,
        v_quote.buyer_user_id,
        v_listing.seller_organization_id,
        v_quote.buyer_organization_id,
        v_listing.commodity,
        v_quote.quantity_kg,
        v_quote.offered_price_per_kg,
        v_quote.currency,
        v_quote.incoterm,
        v_quote.named_port_or_place,
        v_quote.total_quote_value,
        'confirmed_accepted',
        p_idempotency_key
    ) RETURNING id INTO v_new_order_id;

    -- 7. Record Order Event
    INSERT INTO order_events (order_id, new_status, event_title, event_description, actor_user_id)
    VALUES (
        v_new_order_id,
        'confirmed_accepted',
        'Export Deal Confirmed',
        'Seller accepted verified buyer quotation ' || v_quote.quote_number || ' for ' || v_quote.quantity_kg || ' kg ' || v_listing.commodity,
        p_seller_user_id
    );

    -- 8. Audit Log
    INSERT INTO audit_logs (entity_name, entity_id, action_type, actor_user_id, details)
    VALUES (
        'trade_orders',
        v_new_order_id,
        'QUOTE_ACCEPTED',
        p_seller_user_id,
        jsonb_build_object(
            'quote_id', v_quote.id,
            'listing_id', v_listing.id,
            'quantity_kg', v_quote.quantity_kg,
            'currency', v_quote.currency,
            'total_value', v_quote.total_quote_value
        )
    );

    RETURN v_new_order_id;
END;
$$ LANGUAGE plpgsql;

-- 14. Enable Row Level Security (RLS) on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_return_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
