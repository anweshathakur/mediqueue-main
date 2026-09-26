-- =======================================================
-- Real-Time Hospital Queue Schema
-- =======================================================
CREATE TABLE public.queue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id) ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES public.patients(id) ON DELETE CASCADE,

    doctor_id UUID NOT NULL
        REFERENCES public.doctors(id) ON DELETE CASCADE,

    appointment_id UUID
        REFERENCES public.appointments(id) ON DELETE SET NULL,

    priority VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (priority IN (
            'normal',
            'priority',
            'critical'
        )),

    status VARCHAR(20) NOT NULL DEFAULT 'waiting'
        CHECK (status IN (
            'waiting',
            'called',
            'consulting',
            'completed',
            'no_show',
            'cancelled'
        )),

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    called_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ
);