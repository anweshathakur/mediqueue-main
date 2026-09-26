# MediQueue Database

This directory contains the database schema, migrations, seed data, and documentation for MediQueue.

MediQueue uses **PostgreSQL through Supabase** as its primary database.

## Structure

```text
database/
├── migrations/       # Versioned database changes
├── seed/             # Demo/development data
├── schema/           # Table definitions and database structure
└── README.md
```

## Database Architecture

The database is organized around the main MediQueue entities:

```text
Clinics
   │
   ├── Doctors
   └── Staff
         │
         ↓
       Users
       /   \
      /     \
 Patients   Doctors
    │
    ↓
Appointments
    │
    ↓
Queue Entries
    │
    ↓
Consultations
    │
    ↓
Notifications
```

### Core Tables

| Table           | Purpose                                     |
| --------------- | ------------------------------------------- |
| `clinics`       | Hospitals/clinics using MediQueue           |
| `users`         | Application user identity and roles         |
| `patients`      | Patient-specific profile information        |
| `doctors`       | Doctor profiles and specializations         |
| `appointments`  | Scheduled patient appointments              |
| `queue_entries` | Patients currently or previously in a queue |
| `consultations` | Doctor consultation records                 |
| `notifications` | SMS/system notification history             |

## Important Design Principle

The database stores **source-of-truth data**, while values such as queue position and ETA should generally be calculated by the backend.

For example:

```text
Stored:
- Patient
- Doctor
- Queue entry
- Join time
- Priority
- Consultation duration

Calculated:
- Current queue position
- Estimated waiting time
- Patients ahead
- Queue delays
```

This prevents the frontend and database from maintaining multiple conflicting versions of derived information.

## Authentication

MediQueue uses **Supabase Auth** for authentication.

The application database stores user/application information separately and links users to their Supabase Auth identity.

```text
Supabase Auth
     │
     ↓
auth.users
     │
     ↓
public.users
     │
 ┌───┼────┐
 ↓   ↓    ↓
Patient Doctor Staff
```

Passwords and OTP authentication are handled by Supabase Auth and are **not stored in the application tables**.

## Migrations

All changes to the database should be represented by migration files.

Example:

```text
migrations/
├── 001_initial_schema.sql
├── 002_add_queue_priority.sql
└── 003_add_notification_status.sql
```

Migrations should be applied in order.

Do not rely on undocumented manual changes made directly through the Supabase Table Editor.

## Seed Data

The `seed/` directory contains development/demo data.

Example:

```text
seed/
├── 001_users.sql
├── 002_doctors.sql
├── 003_patients.sql
└── 004_demo_data.sql
```

Seed data is intended for local development, testing, and demonstrations.

Production data should never depend on these files.

## Schema Files

The `schema/` directory organizes the database design by entity.

```text
schema/
├── clinics.sql
├── users.sql
├── patients.sql
├── doctors.sql
├── appointments.sql
├── queue.sql
├── consultations.sql
└── notifications.sql
```

These files make the database easier to understand and maintain.

The **migration history remains the authoritative record of changes applied to the database**.

## Queue Data Model

A patient's journey through MediQueue is represented as:

```text
Appointment
     │
     ↓
Patient arrives
     │
     ↓
Queue Entry
     │
     ↓
Doctor calls patient
     │
     ↓
Consultation
     │
     ↓
Completed
```

An appointment and a queue entry are intentionally separate concepts.

An appointment represents a **scheduled visit**, while a queue entry represents the patient's **actual position in the clinic queue**.

## Future Extensions

The database may later include:

* Medical records
* Departments
* Doctor breaks
* Audit logs
* Queue analytics
* Appointment rescheduling history
* More detailed notification tracking

These should only be added when the corresponding application features are implemented.

## Source of Truth

```text
React Frontend
       │
       │ HTTP
       ↓
Express Backend
       │
       ↓
PostgreSQL / Supabase
       │
       ├── Supabase Realtime
       └── Supabase Auth
```

The PostgreSQL database is the primary source of truth for MediQueue application data.

The frontend should not maintain a separate persistent copy of queue or appointment data using `localStorage`.
