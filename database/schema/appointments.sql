-- =======================================================
-- Appointments Schema
-- =======================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    type VARCHAR(50) DEFAULT 'Online' CHECK (type IN ('Online', 'Walk-in')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked-in', 'in-consultation', 'completed', 'cancelled', 'no-show')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
