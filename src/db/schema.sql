-- ====================================================================
-- AGRI MARKET INTELLIGENCE PLATFORM (AMIP)
-- PostgreSQL / Supabase Complete Production Database Schema
-- Physical Agricultural Commodities Intelligence & Trade Enablement
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'fpo', 'inspector', 'admin');
CREATE TYPE crop_category AS ENUM ('vegetable', 'fruit', 'grain', 'pulse', 'oilseed', 'spice');
CREATE TYPE lot_status AS ENUM ('draft', 'active', 'buyer_interest', 'inspection_requested', 'inspection_complete', 'offer_received', 'accepted', 'logistics', 'completed', 'cancelled');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired');
CREATE TYPE inspection_status AS ENUM ('requested', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE logistics_status AS ENUM ('requested', 'assigned', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('escrow_held', 'released', 'refunded', 'disputed');
CREATE TYPE market_signal_type AS ENUM ('positive', 'stable', 'downward_pressure', 'high_volatility');
CREATE TYPE decision_action AS ENUM ('sell_now', 'wait', 'partial_sell');
CREATE TYPE quality_grade AS ENUM ('Grade_A_Plus', 'Grade_A', 'Grade_B', 'Grade_C', 'Ungraded');

-- 3. CORE USERS & ENTITIES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role user_role NOT NULL DEFAULT 'farmer',
    preferred_language VARCHAR(10) DEFAULT 'en',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farmer_code VARCHAR(30) UNIQUE NOT NULL,
    state VARCHAR(60) NOT NULL,
    district VARCHAR(60) NOT NULL,
    taluka VARCHAR(60),
    village VARCHAR(100),
    land_area_acres NUMERIC(8, 2),
    primary_crops TEXT[],
    fpo_id UUID,
    kyc_verified BOOLEAN DEFAULT FALSE,
    bank_account_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150),
    buyer_type VARCHAR(50) DEFAULT 'Wholesaler', -- Wholesaler, Retailer, Exporter, Processor
    gstin VARCHAR(20),
    state VARCHAR(60) NOT NULL,
    district VARCHAR(60) NOT NULL,
    business_address TEXT,
    trust_score NUMERIC(5, 2) DEFAULT 85.00,
    total_trades_completed INT DEFAULT 0,
    total_volume_purchased_mt NUMERIC(10, 2) DEFAULT 0,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fpos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(80) UNIQUE,
    state VARCHAR(60) NOT NULL,
    district VARCHAR(60) NOT NULL,
    member_farmer_count INT DEFAULT 0,
    primary_commodities TEXT[],
    storage_capacity_mt NUMERIC(10, 2) DEFAULT 0,
    cold_storage_available BOOLEAN DEFAULT FALSE,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    farm_name VARCHAR(100),
    survey_number VARCHAR(50),
    area_acres NUMERIC(8, 2),
    soil_type VARCHAR(50),
    irrigation_source VARCHAR(50),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMODITIES & APMC MARKETS
CREATE TABLE commodities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    hindi_name VARCHAR(100),
    marathi_name VARCHAR(100),
    category crop_category NOT NULL,
    standard_unit VARCHAR(20) DEFAULT 'Quintal',
    shelf_life_days INT DEFAULT 7,
    is_perishable BOOLEAN DEFAULT TRUE,
    hsn_code VARCHAR(20),
    icon_name VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    characteristics TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(commodity_id, name)
);

CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE,
    apmc_name VARCHAR(150) NOT NULL,
    state VARCHAR(60) NOT NULL,
    district VARCHAR(60) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_major_hub BOOLEAN DEFAULT FALSE,
    daily_volume_tier VARCHAR(20) DEFAULT 'Tier-1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OFFICIAL MARKET PRICES & ARRIVALS (REAL DATA TABLE)
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    endpoint_url TEXT,
    source_type VARCHAR(50) DEFAULT 'REST_API',
    is_official_gov BOOLEAN DEFAULT TRUE,
    legal_attribution TEXT DEFAULT 'Government of India / AGMARKNET / Open Government Data (data.gov.in)',
    is_active BOOLEAN DEFAULT TRUE,
    last_successful_sync TIMESTAMPTZ,
    last_sync_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    state VARCHAR(60) NOT NULL,
    district VARCHAR(60) NOT NULL,
    market VARCHAR(150) NOT NULL,
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    commodity VARCHAR(100) NOT NULL,
    commodity_id UUID REFERENCES commodities(id) ON DELETE SET NULL,
    variety VARCHAR(100) DEFAULT 'Other',
    grade VARCHAR(50) DEFAULT 'FAQ',
    min_price NUMERIC(10, 2) NOT NULL CHECK (min_price >= 0),
    max_price NUMERIC(10, 2) NOT NULL CHECK (max_price >= min_price),
    modal_price NUMERIC(10, 2) NOT NULL CHECK (modal_price >= min_price AND modal_price <= max_price),
    arrival_quantity NUMERIC(12, 2) DEFAULT 0 CHECK (arrival_quantity >= 0),
    unit VARCHAR(30) DEFAULT '₹/Quintal',
    source VARCHAR(150) NOT NULL DEFAULT 'Government of India / AGMARKNET',
    source_url TEXT,
    data_timestamp TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    is_validated BOOLEAN DEFAULT TRUE,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, state, market, commodity, variety, grade, is_demo)
);

CREATE TABLE market_arrivals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
    total_arrivals_tonnes NUMERIC(12, 2) NOT NULL,
    vehicle_count INT DEFAULT 0,
    source VARCHAR(150) DEFAULT 'AGMARKNET / APMC Daily Gate Registers',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_source_id UUID REFERENCES data_sources(id),
    sync_started_at TIMESTAMPTZ NOT NULL,
    sync_completed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL, -- SUCCESS, PARTIAL_SUCCESS, FAILED, TIMEOUT
    records_fetched INT DEFAULT 0,
    records_inserted INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_rejected INT DEFAULT 0,
    error_message TEXT,
    latency_ms INT,
    api_endpoint TEXT
);

-- 6. CROP LOTS & PASSPORTS
CREATE TABLE crop_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. AGRI-2026-NASH-0982
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    commodity_id UUID REFERENCES commodities(id) ON DELETE RESTRICT,
    variety VARCHAR(100),
    quantity_quintals NUMERIC(10, 2) NOT NULL CHECK (quantity_quintals > 0),
    expected_harvest_date DATE NOT NULL,
    location_state VARCHAR(60) NOT NULL,
    location_district VARCHAR(60) NOT NULL,
    location_village VARCHAR(100),
    status lot_status DEFAULT 'active',
    expected_price_per_quintal NUMERIC(10, 2),
    min_acceptable_price NUMERIC(10, 2),
    storage_available BOOLEAN DEFAULT FALSE,
    storage_cost_per_day_quintal NUMERIC(8, 2) DEFAULT 0,
    verified_grade quality_grade DEFAULT 'Ungraded',
    ai_preliminary_grade quality_grade DEFAULT 'Ungraded',
    ai_quality_score NUMERIC(5, 2),
    qr_code_hash VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE crop_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID REFERENCES crop_lots(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'CROP_PHOTO', -- CROP_PHOTO, FARM_VIEW, PACKING, DEFECT_CLOSEUP
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID REFERENCES crop_lots(id) ON DELETE CASCADE,
    crop_identified VARCHAR(100),
    confidence_score NUMERIC(5, 2),
    color_uniformity_pct NUMERIC(5, 2),
    maturity_index_pct NUMERIC(5, 2),
    visible_defects_pct NUMERIC(5, 2),
    recommended_grade quality_grade,
    assessment_notes TEXT,
    disclaimer TEXT DEFAULT 'Physical inspection required for final commercial grading.',
    assessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI FORECASTING & SIGNALS
CREATE TABLE price_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    variety VARCHAR(100),
    forecast_date DATE NOT NULL,
    predicted_min_price NUMERIC(10, 2) NOT NULL,
    predicted_max_price NUMERIC(10, 2) NOT NULL,
    predicted_modal_price NUMERIC(10, 2) NOT NULL,
    confidence_percentage NUMERIC(5, 2) NOT NULL,
    model_name VARCHAR(80) DEFAULT 'Ensemble (RandomForest + TimeSeries)',
    features_used TEXT[],
    horizon_days INT NOT NULL, -- 3 or 7
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE market_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    signal_type market_signal_type NOT NULL,
    strength_score NUMERIC(5, 2),
    reasons TEXT[] NOT NULL,
    price_deviation_30d_pct NUMERIC(6, 2),
    arrival_trend_direction VARCHAR(20),
    valid_until TIMESTAMPTZ,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BUYER OFFERS, INSPECTIONS, LOGISTICS & DEALS
CREATE TABLE buyer_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID REFERENCES crop_lots(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
    offer_price_per_quintal NUMERIC(10, 2) NOT NULL CHECK (offer_price_per_quintal > 0),
    quantity_requested_quintals NUMERIC(10, 2) NOT NULL,
    transport_paid_by VARCHAR(20) DEFAULT 'BUYER', -- BUYER, FARMER, SHARED
    estimated_transport_cost_per_q NUMERIC(8, 2) DEFAULT 0,
    estimated_handling_cost_per_q NUMERIC(8, 2) DEFAULT 0,
    estimated_net_realisation_per_q NUMERIC(10, 2) NOT NULL,
    status offer_status DEFAULT 'pending',
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID REFERENCES crop_lots(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    inspector_name VARCHAR(120),
    requested_date DATE NOT NULL,
    scheduled_date DATE,
    completed_date DATE,
    status inspection_status DEFAULT 'requested',
    brix_score NUMERIC(4, 1),
    size_uniformity_mm VARCHAR(50),
    firmness_kg_cm2 NUMERIC(4, 1),
    agreed_grade quality_grade,
    inspector_notes TEXT,
    inspection_photos TEXT[],
    farmer_signature_obtained BOOLEAN DEFAULT FALSE,
    inspector_signature_obtained BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE storage_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    warehouse_type VARCHAR(50) DEFAULT 'Cold Storage',
    state VARCHAR(60) NOT NULL,
    district VARCHAR(60) NOT NULL,
    capacity_quintals NUMERIC(10, 2),
    rate_per_quintal_per_month NUMERIC(8, 2) NOT NULL,
    temperature_range_celsius VARCHAR(30),
    humidity_range_pct VARCHAR(30),
    contact_phone VARCHAR(15)
);

CREATE TABLE logistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES buyer_offers(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES crop_lots(id) ON DELETE CASCADE,
    transporter_name VARCHAR(120),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(15),
    vehicle_number VARCHAR(30),
    vehicle_type VARCHAR(50), -- 3-Tonner, 10-Tonner, Reefer
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL,
    freight_charges_total NUMERIC(10, 2) NOT NULL,
    status logistics_status DEFAULT 'requested',
    pickup_time TIMESTAMPTZ,
    estimated_delivery_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
    gps_tracking_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_code VARCHAR(40) UNIQUE NOT NULL,
    lot_id UUID REFERENCES crop_lots(id) ON DELETE RESTRICT,
    offer_id UUID REFERENCES buyer_offers(id) ON DELETE RESTRICT,
    farmer_id UUID REFERENCES farmers(id) ON DELETE RESTRICT,
    buyer_id UUID REFERENCES buyers(id) ON DELETE RESTRICT,
    total_quantity_quintals NUMERIC(10, 2) NOT NULL,
    rate_per_quintal NUMERIC(10, 2) NOT NULL,
    gross_amount NUMERIC(12, 2) NOT NULL,
    transport_deduction NUMERIC(10, 2) DEFAULT 0,
    storage_deduction NUMERIC(10, 2) DEFAULT 0,
    net_payable_to_farmer NUMERIC(12, 2) NOT NULL,
    payment_status payment_status DEFAULT 'escrow_held',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'NEFT_ESCROW',
    gateway_reference VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SUCCESS',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'MARKET_ALERT', -- PRICE_SPIKE, OFFER_RECEIVED, INSPECTION, LOGISTICS
    is_read BOOLEAN DEFAULT FALSE,
    action_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE RESTRICT,
    raised_by_user_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, CLOSED
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    action VARCHAR(50) NOT NULL,
    performed_by UUID,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PERFORMANCE INDEXES (REQUIRED FOR REAL MARKET SPEED)
CREATE INDEX idx_market_prices_commodity ON market_prices(commodity);
CREATE INDEX idx_market_prices_market ON market_prices(market);
CREATE INDEX idx_market_prices_date ON market_prices(date DESC);
CREATE INDEX idx_market_prices_state_district ON market_prices(state, district);
CREATE INDEX idx_market_prices_lookup ON market_prices(commodity, market, date DESC);
CREATE INDEX idx_crop_lots_farmer ON crop_lots(farmer_id);
CREATE INDEX idx_crop_lots_status ON crop_lots(status);
CREATE INDEX idx_buyer_offers_lot ON buyer_offers(lot_id);
CREATE INDEX idx_market_signals_commodity ON market_signals(commodity_id, generated_at DESC);
CREATE INDEX idx_price_forecasts_commodity ON price_forecasts(commodity_id, forecast_date);
