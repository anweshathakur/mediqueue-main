-- =======================================================
-- Doctors Schema
-- =======================================================
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES public.users(id) ON DELETE CASCADE,

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id) ON DELETE CASCADE,

    specialty VARCHAR(100) NOT NULL,

    room_number VARCHAR(50),

    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN (
            'available',
            'on_break',
            'off_duty',
            'delayed'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
