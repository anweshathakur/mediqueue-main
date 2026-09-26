-- =======================================================
-- Appointments Schema
-- =======================================================
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id) ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES public.patients(id) ON DELETE CASCADE,

    doctor_id UUID NOT NULL
        REFERENCES public.doctors(id) ON DELETE CASCADE,

    scheduled_at TIMESTAMPTZ NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'booked'
        CHECK (status IN (
            'booked',
            'confirmed',
            'cancelled',
            'no_show',
            'completed'
        )),

    reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);