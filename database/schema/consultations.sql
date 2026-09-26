-- =======================================================
-- Consultations & Clinical History Schema
-- =======================================================
CREATE TABLE IF NOT EXISTS patient_history (
    id SERIAL PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_type VARCHAR(50) DEFAULT 'Walk-in',
    doctor_name VARCHAR(255) NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    duration_mins INT DEFAULT 15,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);
