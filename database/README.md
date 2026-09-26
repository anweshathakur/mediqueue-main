# MediQueue Database Schema & Seed Architecture

This directory houses all SQL schemas, seed files, and migration scripts for MediQueue.

## Directory Structure

```
database/
├── migrations/          # Incremental database migrations
├── seed/                # Seed data executed in sequential order
│   ├── 001_users.sql
│   ├── 002_doctors.sql
│   ├── 003_patients.sql
│   └── 004_demo_data.sql
└── schema/              # Core relational tables & constraints
    ├── clinics.sql
    ├── users.sql
    ├── patients.sql
    ├── doctors.sql
    ├── appointments.sql
    ├── queue.sql
    ├── consultations.sql
    └── notifications.sql
```

## Setup Instructions

1. Execute all scripts in `schema/` to create the relational tables.
2. Execute scripts in `seed/` sequentially from `001` to `004` to populate initial demo data.
