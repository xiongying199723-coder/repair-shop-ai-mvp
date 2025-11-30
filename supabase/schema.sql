-- =====================================================
-- REPAIR SHOP AI MVP - SUPABASE DATABASE SCHEMA
-- Bland AI Voice Integration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LEADS TABLE
-- Stores all customer leads from both manual entry and voice AI
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Customer Information
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,

    -- Vehicle Information
    car_make TEXT,
    car_model TEXT,
    car_year TEXT,
    issue TEXT,

    -- Lead Management
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Quote Sent', 'Closed', 'Lost')),
    quote_amount DECIMAL(10, 2),

    -- Source Tracking
    source TEXT DEFAULT 'Manual' CHECK (source IN ('Manual', 'Voice AI', 'Web Form', 'Phone', 'Walk-in')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Additional metadata
    notes TEXT,

    -- Indexes for common queries
    CONSTRAINT unique_phone_timestamp UNIQUE (phone, created_at)
);

-- =====================================================
-- VOICE_CALLS TABLE
-- Stores Bland AI voice call data and transcripts
-- =====================================================
CREATE TABLE IF NOT EXISTS voice_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Bland AI Call Information
    bland_call_id TEXT UNIQUE, -- Bland AI's unique call ID
    phone_number TEXT NOT NULL,
    duration INTEGER, -- Call duration in seconds

    -- Call Status
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'converted')),

    -- AI Extracted Data
    customer_name TEXT,
    vehicle_year TEXT,
    vehicle_make TEXT,
    vehicle_model TEXT,
    service_needed TEXT,
    urgency TEXT CHECK (urgency IN ('urgent', 'standard', 'flexible')),
    ai_notes TEXT,

    -- Call Recording & Transcript
    recording_url TEXT, -- URL to call recording from Bland AI
    transcript JSONB, -- Full conversation transcript

    -- Timestamps
    call_started_at TIMESTAMPTZ,
    call_ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Link to created lead (if converted)
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

    -- Raw webhook data for debugging
    raw_webhook_data JSONB
);

-- =====================================================
-- COMMUNICATIONS TABLE
-- Stores all communication history for leads
-- =====================================================
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Link to lead
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

    -- Communication Details
    sender TEXT NOT NULL CHECK (sender IN ('client', 'dealer', 'system', 'ai')),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('initial_inquiry', 'auto_reply', 'quote_sent', 'parts_search', 'voice_call', 'note')),

    -- Optional data
    quote_amount DECIMAL(10, 2),
    metadata JSONB, -- Store additional data like parts info, etc.

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

CREATE INDEX IF NOT EXISTS idx_voice_calls_status ON voice_calls(status);
CREATE INDEX IF NOT EXISTS idx_voice_calls_bland_id ON voice_calls(bland_call_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_created_at ON voice_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_calls_lead_id ON voice_calls(lead_id);

CREATE INDEX IF NOT EXISTS idx_communications_lead_id ON communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_calls_updated_at BEFORE UPDATE ON voice_calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- For production, enable RLS and create appropriate policies
-- =====================================================

-- Enable RLS (commented out for development, uncomment for production)
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Example policy for authenticated users (customize based on your auth setup)
-- CREATE POLICY "Allow all operations for authenticated users" ON leads
--     FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow all operations for authenticated users" ON voice_calls
--     FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow all operations for authenticated users" ON communications
--     FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample lead
INSERT INTO leads (customer_name, phone, email, car_make, car_model, car_year, issue, status, source)
VALUES ('John Doe', '+1234567890', 'john@example.com', 'Toyota', 'Camry', '2018', 'Brake noise', 'New', 'Manual')
ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- View: Recent voice calls with lead status
CREATE OR REPLACE VIEW recent_voice_calls AS
SELECT
    vc.*,
    l.status as lead_status,
    l.quote_amount
FROM voice_calls vc
LEFT JOIN leads l ON vc.lead_id = l.id
ORDER BY vc.created_at DESC;

-- View: Leads with communication count
CREATE OR REPLACE VIEW leads_with_comm_count AS
SELECT
    l.*,
    COUNT(c.id) as communication_count
FROM leads l
LEFT JOIN communications c ON l.id = c.lead_id
GROUP BY l.id
ORDER BY l.created_at DESC;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function: Create lead from voice call
CREATE OR REPLACE FUNCTION create_lead_from_voice_call(call_id UUID)
RETURNS UUID AS $$
DECLARE
    new_lead_id UUID;
    call_record RECORD;
BEGIN
    -- Get the voice call record
    SELECT * INTO call_record FROM voice_calls WHERE id = call_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voice call not found';
    END IF;

    -- Create the lead
    INSERT INTO leads (
        customer_name,
        phone,
        car_make,
        car_model,
        car_year,
        issue,
        source,
        notes
    ) VALUES (
        call_record.customer_name,
        call_record.phone_number,
        call_record.vehicle_make,
        call_record.vehicle_model,
        call_record.vehicle_year,
        call_record.service_needed,
        'Voice AI',
        call_record.ai_notes
    ) RETURNING id INTO new_lead_id;

    -- Update voice call with lead reference
    UPDATE voice_calls
    SET lead_id = new_lead_id,
        status = 'converted',
        updated_at = NOW()
    WHERE id = call_id;

    -- Add communication record
    INSERT INTO communications (
        lead_id,
        sender,
        sender_name,
        message,
        type,
        metadata
    ) VALUES (
        new_lead_id,
        'ai',
        'Voice AI Agent',
        'Initial contact via voice call. Duration: ' || call_record.duration || ' seconds',
        'voice_call',
        jsonb_build_object(
            'call_id', call_id,
            'urgency', call_record.urgency,
            'recording_url', call_record.recording_url
        )
    );

    RETURN new_lead_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- COMPLETION
-- =====================================================
-- Schema setup complete!
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Deploy the Edge Function for webhook endpoint
-- 3. Configure Bland AI with your webhook URL
