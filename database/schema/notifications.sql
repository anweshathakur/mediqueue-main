-- =======================================================
-- SMS & Push Notifications Schema
-- =======================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    phone VARCHAR(50) NOT NULL,
    type VARCHAR(50) DEFAULT 'sms' CHECK (type IN ('sms', 'push', 'in-app')),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
