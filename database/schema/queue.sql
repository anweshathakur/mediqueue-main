-- =======================================================
-- Real-Time Hospital Queue Schema
-- =======================================================
CREATE TABLE IF NOT EXISTS hospital_queue (
    id VARCHAR(50) PRIMARY KEY, -- Token string or UUID
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    doctor_name VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    type VARCHAR(50) DEFAULT 'Online',
    scheduled VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Consulting', 'Completed', 'No-Show', 'Cancelled')),
    queue_position INT,
    estimated_wait_mins INT DEFAULT 0,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Singleton App State for Global Controls & Delays
CREATE TABLE IF NOT EXISTS app_state (
    singleton_id VARCHAR(50) PRIMARY KEY DEFAULT 'global_state',
    avg_time INT DEFAULT 15,
    global_delay INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
