-- =======================================================
-- Doctors Schema
-- =======================================================
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    room_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'on-break', 'off-duty', 'delayed')),
    avg_consultation_time INT DEFAULT 15, -- in minutes
    current_delay INT DEFAULT 0, -- in minutes
    patients_ahead INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
