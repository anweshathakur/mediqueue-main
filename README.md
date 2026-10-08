# MediQueue 🏥

### Real-Time Clinic Queue & Appointment Management Platform

<p align="center">

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Platform](https://img.shields.io/badge/Platform-Supabase-3ECF8E)
![Security](https://img.shields.io/badge/Security-RLS%20%2B%20RBAC-8B5CF6)

</p>

---

## 📌 Executive Overview

Waiting at a clinic is often unpredictable.

A patient may have a **10:30 AM appointment** but still have no idea whether they will actually be seen at 10:30, 11:00, or 11:45.

**MediQueue** is a real-time clinic queue and appointment management platform built to solve this gap.

Instead of treating appointments as fixed time slots, MediQueue continuously tracks the **actual state of the clinic** — appointments, walk-ins, doctor availability, priorities, consultations, and queue movement — and uses that information to provide patients with a more realistic view of their waiting time.

---

##  What MediQueue Does

### 👤 Patient Portal

- Book appointments with doctors
- Check in for appointments
- Track live queue position
- View estimated waiting time
- Monitor appointment status
- Receive in-app notifications
- Cancel appointments when required

### 🩺 Doctor Console

- View live patient queue
- Call the next patient
- Start and complete consultations
- Update availability
- Handle breaks and delays
- Track consultation duration

### 🧑‍💼 Reception Desk

- Register walk-in patients
- Assign patients to doctors
- Manage appointment check-ins
- Handle priority and critical cases
- Manage no-shows and requeue patients
- Monitor the clinic's live queue

---

## ⚡ The Core Idea

MediQueue treats the clinic as a **live system**, rather than a static appointment calendar.

```text
                    ┌─────────────────┐
                    │   Appointments  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Walk-ins      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   LIVE QUEUE    │
                    │                 │
                    │ Priority        │
                    │ Doctor Status   │
                    │ No-shows        │
                    │ Delays          │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Patient ETA   │
                    └─────────────────┘

---

## 🛠️ Tech Stack

### Frontend

`React` `TypeScript` `Vite` `Tailwind CSS`

### Backend

`Node.js` `Express` `TypeScript` `REST APIs`

### Database & Infrastructure

`PostgreSQL` `Supabase` `Supabase Auth` `Supabase Realtime`

### Security

`RBAC` `Row Level Security` `Zod Validation` `Ownership Checks` `Clinic Isolation`

###  ML Layer

`Python` `FastAPI` `Pandas` `Scikit-learn`

---

## 🔐 Security Architecture

```text
Authentication
      ↓
Role-Based Access Control
      ↓
Ownership / IDOR Protection
      ↓
Clinic Isolation
      ↓
Database RLS
      ↓
Input Validation
      ↓
API Hardening
      ↓
Sensitive Data Protection
      ↓
Audit Logging
```

### Roles

| Role               | Access                                  |
| ------------------ | --------------------------------------- |
| 👤 Patient         | Own appointments, queue & notifications |
| 🩺 Doctor          | Assigned patients & consultations       |
| 🧑‍💼 Receptionist | Clinic queue & appointment operations   |
| ⚙️ Admin           | Administrative operations               |

Private credentials and service-role keys are never exposed to the frontend.

---

## 🗄️ Database

MediQueue uses a relational PostgreSQL architecture.

```text
                 ┌───────────┐
                 │  Clinics  │
                 └─────┬─────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Doctors        Staff     Appointments
          │                         │
          └────────────┬────────────┘
                       ▼
                 Queue Entries
                       │
                       ▼
                 Consultations

Users ──────► Patients
   │
   ├──────► Doctors
   ├──────► Staff
   └──────► Admins
```

### Core Tables

* `clinics`
* `users`
* `patients`
* `doctors`
* `staff`
* `appointments`
* `queue_entries`
* `consultations`
* `notifications`

---

## 📂 Project Structure

```text
MediQueue/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── app.ts
│   ├── server.ts
│   └── package.json
│
├── database/
│   ├── migrations/
│   ├── seed/
│   └── schema/
│
├── frontend/
│   └── src/
│       └── auth/
│
└── README.md
```

---

## 🔄 Queue Lifecycle

```text
          Appointment / Walk-in
                   │
                   ▼
                WAITING
                   │
                   ▼
                 CALLED
                   │
                   ▼
              CONSULTING
                   │
                   ▼
               COMPLETED
```

Additional states:

```text
WAITING ──────► NO_SHOW
WAITING ──────► CANCELLED
```

Priority levels:

```text
🔴 Critical
🟠 Priority
⚪ Normal
```

---

## 🚀 Getting Started

### Clone

```bash
git clone <repository-url>
cd MediQueue
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```env
PORT=5000

SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure the frontend environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```


<p align="center">

**MediQueue — Know your queue. Know your time.**

</p>
```
