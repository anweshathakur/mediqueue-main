-- =======================================================
-- SMS & Push Notifications Schema
-- =======================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES public.patients(id) ON DELETE CASCADE,

    appointment_id UUID
        REFERENCES public.appointments(id) ON DELETE SET NULL,

    queue_entry_id UUID
        REFERENCES public.queue_entries(id) ON DELETE SET NULL,

    channel VARCHAR(20) NOT NULL DEFAULT 'sms'
        CHECK (channel IN (
            'sms',
            'push',
            'in_app'
        )),

    message TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'sent',
            'delivered',
            'failed'
        )),

    sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
