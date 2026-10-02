# LabTrack

**Laboratory Equipment Lifecycle, Booking & Maintenance Management System**

LabTrack is a full-stack web application built for college laboratories to manage the complete lifecycle of lab equipment — from registration and QR tagging, through booking and approval, to issue, return, condition tracking, maintenance, and utilization analytics — all through a single relational database.

> Similar laboratory/equipment management systems already exist. This project's focus is a lightweight, college-oriented implementation where the full equipment lifecycle is connected end-to-end through one database-driven workflow, built from scratch as a learning project.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Business Rules](#business-rules)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Future Scope](#future-scope)
- [License](#license)

---

## Problem Statement

College laboratories commonly track equipment using paper registers, spreadsheets, or informal messaging — leading to double-bookings, lost usage history, scattered maintenance records, and no visibility into which equipment is over- or under-utilized.

LabTrack centralizes this into one system covering:

```
Equipment Registration → QR Identification → Booking → Approval
→ Issue → Usage → Return → Condition Check → Issue Reporting
→ Maintenance → Maintenance Completion → Utilization Analytics
```

## Features

- **Authentication** — JWT-based auth with bcrypt password hashing and role-based authorization
- **Equipment Management** — full CRUD with category, lab, condition, and status tracking
- **Laboratory Management** — labs with assigned lab assistants
- **Booking System** — conflict-free scheduling with automatic overlap detection
- **Issue / Return Workflow** — condition tracking on handover and return, with automatic issue creation on damaged returns
- **Maintenance Tracking** — scheduled and completed maintenance records with next-due-date tracking
- **QR Code Workflow** — auto-generated unique QR code per equipment item, with camera-based scan-to-detail lookup
- **User Management** — admin can promote users between roles and deactivate accounts
- **Dashboard & Analytics** — equipment utilization, booking trends, and maintenance statistics
- **Role-based UI** — Student, Lab Assistant, and Admin each see a tailored view

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Recharts, html5-qrcode
**Backend:** Node.js, Express.js
**Database:** MySQL
**Auth:** JWT, bcrypt
**QR:** `qrcode` (generation), `uuid` (unique identifiers), `html5-qrcode` (camera scanning)

## System Architecture

```
┌─────────────┐      Axios/HTTPS      ┌─────────────┐      mysql2       ┌─────────────┐
│   React     │  ───────────────────► │  Express.js │ ─────────────────►│   MySQL     │
│  (Vite +    │ ◄─────────────────── │   REST API  │ ◄───────────────── │ labtrack_db │
│  Tailwind)  │      JSON responses    │  + JWT auth │      results       └─────────────┘
└─────────────┘                        └─────────────┘
```

Three-tier architecture: React handles presentation, Express handles routing/business logic/auth, MySQL handles persistence. JWTs are issued at login and verified on every protected request via middleware.

## User Roles

| Role | Capabilities |
|---|---|
| **Student** | Browse/search/book equipment, scan QR codes, view booking & equipment history, report issues |
| **Lab Assistant** | Approve/reject bookings, issue & receive equipment, log maintenance needs, update equipment condition |
| **Admin** | Full system access — manage users, labs, equipment, categories, bookings, maintenance, and analytics |

## Database Schema

9 normalized tables: `users`, `laboratories`, `equipment_categories`, `equipment`, `bookings`, `equipment_transactions`, `equipment_issues`, `maintenance_records`, `notifications`.

Full schema with constraints, indexes, and foreign keys: [`database/schema.sql`](./database/schema.sql)

Key relationships:
- `equipment` belongs to one `laboratory` and one `equipment_category`
- `bookings`, `equipment_transactions`, `equipment_issues`, and `maintenance_records` all reference `equipment`
- Every action is attributed to a `user` (who booked, approved, issued, reported, resolved)

## Business Rules

The system enforces these at the database/application layer:

1. No overlapping bookings for the same equipment
2. Equipment under maintenance cannot be booked
3. Damaged equipment cannot be issued
4. Retired equipment cannot be booked or issued
5. Only approved bookings can result in an equipment issue
6. Only lab assistants/admins can approve bookings or issue equipment
7. Only the borrower or authorized staff can complete a return
8. A damaged return automatically creates an equipment issue record
9. Starting maintenance sets equipment status to `MAINTENANCE`
10. Completing maintenance returns equipment status to `AVAILABLE`
11. A user cannot hold two conflicting bookings across different equipment for the same time slot
12. All lifecycle actions are persisted for full audit history

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MySQL (v8+ recommended)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/labtrack.git
cd labtrack
```

### 2. Set up the database

```bash
cd database
mysql -u root -p < schema.sql
```

### 3. Backend setup

```bash
cd ../backend
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials and a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 4. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 5. Create your first admin

Register a normal account via the UI at `/register`, then promote it once via MySQL:

```sql
USE labtrack_db;
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Log back in — from here on, roles can be managed entirely from the **Users** page in the app.

## API Overview

All endpoints are prefixed with `/api`. Full route list below; see controllers in `backend/src/controllers/` for implementation details.

| Resource | Base Route |
|---|---|
| Auth | `/api/auth` (`register`, `login`, `me`) |
| Users | `/api/users` |
| Laboratories | `/api/labs` |
| Categories | `/api/categories` |
| Equipment | `/api/equipment` (includes `/qr/:code` and `/:id/qr-image`) |
| Bookings | `/api/bookings` (includes `/my`, `/:id/approve`, `/:id/reject`) |
| Transactions | `/api/transactions` (`/issue`, `/return`) |
| Issues | `/api/issues` |
| Maintenance | `/api/maintenance` |
| Analytics | `/api/analytics` (`/dashboard`, `/equipment-utilization`, `/maintenance`, `/bookings`) |

All responses follow a consistent envelope:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "error": "..." }
```

## Project Structure

```
labtrack/
├── backend/
│   └── src/
│       ├── config/        # DB connection pool
│       ├── controllers/   # Request handlers
│       ├── middleware/    # Auth & role guards
│       ├── models/        # SQL queries
│       ├── routes/        # Express routers
│       ├── services/      # QR generation, analytics aggregation
│       └── utils/         # Validation, token helpers
├── frontend/
│   └── src/
│       ├── components/    # Reusable UI (Modal, Button, StatusBadge, QRScanner...)
│       ├── context/       # AuthContext
│       ├── pages/         # Route-level pages
│       ├── routes/        # ProtectedRoute
│       └── services/      # Axios service layer per resource
└── database/
    └── schema.sql
```

## Screenshots

> _Add screenshots here before your presentation — Login, Dashboard (Student/Admin), Equipment list, Booking flow, QR scan result, Analytics page._

## Future Scope

- Mobile application
- Email/WhatsApp notifications
- RFID / IoT equipment monitoring
- Predictive maintenance
- College ERP integration
- Multi-college support

## License

This project was built as an academic project for a B.Tech AI & Data Science program. Feel free to use it as a reference for similar coursework.
