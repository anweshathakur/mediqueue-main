-- ============================================================
-- MediQueue - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. CLINICS
-- ============================================================

CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. USERS
-- Links application users to Supabase Auth users
-- ============================================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name VARCHAR(100) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN (
            'patient',
            'doctor',
            'receptionist',
            'admin'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. PATIENTS
-- A patient may exist without a user account
-- (important for walk-in registrations)
-- ============================================================

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


-- ============================================================
-- 4. DOCTORS
-- ============================================================

CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id)
        ON DELETE CASCADE,

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


-- ============================================================
-- 5. STAFF / RECEPTIONISTS
-- Handles walk-ins, queue management, etc.
-- ============================================================

CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. APPOINTMENTS
-- ============================================================

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id)
        ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES public.patients(id)
        ON DELETE CASCADE,

    doctor_id UUID NOT NULL
        REFERENCES public.doctors(id)
        ON DELETE CASCADE,

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


-- ============================================================
-- 7. QUEUE ENTRIES
-- Both online appointments and walk-ins enter the queue here.
-- ============================================================

CREATE TABLE public.queue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id)
        ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES public.patients(id)
        ON DELETE CASCADE,

    doctor_id UUID NOT NULL
        REFERENCES public.doctors(id)
        ON DELETE CASCADE,

    appointment_id UUID
        REFERENCES public.appointments(id)
        ON DELETE SET NULL,

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


-- ============================================================
-- 8. CONSULTATIONS
-- Created when a doctor starts/records a consultation.
-- ============================================================

CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    queue_entry_id UUID NOT NULL
        REFERENCES public.queue_entries(id)
        ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES public.patients(id)
        ON DELETE CASCADE,

    doctor_id UUID NOT NULL
        REFERENCES public.doctors(id)
        ON DELETE CASCADE,

    diagnosis TEXT,
    prescription TEXT,

    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES public.patients(id)
        ON DELETE CASCADE,

    appointment_id UUID
        REFERENCES public.appointments(id)
        ON DELETE SET NULL,

    queue_entry_id UUID
        REFERENCES public.queue_entries(id)
        ON DELETE SET NULL,

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