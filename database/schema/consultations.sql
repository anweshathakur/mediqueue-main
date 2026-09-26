-- =======================================================
-- Consultations & Clinical History Schema
-- =======================================================
CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    queue_entry_id UUID NOT NULL
        REFERENCES public.queue_entries(id) ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES public.patients(id) ON DELETE CASCADE,

    doctor_id UUID NOT NULL
        REFERENCES public.doctors(id) ON DELETE CASCADE,

    diagnosis TEXT,

    prescription TEXT,

    started_at TIMESTAMPTZ NOT NULL,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
