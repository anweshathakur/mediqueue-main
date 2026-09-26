-- =======================================================
-- Patients Schema
-- =======================================================
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    date_of_birth DATE,
    sex VARCHAR(20),
    medical_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);