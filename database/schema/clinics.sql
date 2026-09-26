-- =======================================================
-- Clinics Schema
-- =======================================================
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    address TEXT NOT NULL,

    phone VARCHAR(20),

    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);