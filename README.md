# PVG College Auth & Enterprise Management System 🎓

Output video recorder on 14 April 2026 link :- https://drive.google.com/file/d/13xhAvIcI0Y50rWUNkmtzHYa-e37PuFrp/view?usp=sharing
A professional-grade authentication, authorization, and administrative suite built for **PVG College of Science**.

**Technology Stack:** React (Vite) · FastAPI · PostgreSQL · SQLAlchemy · Glassmorphism UI

---

## 🌟 Enhanced Enterprise Features

1. **Dual-Portal Architecture**:
   - **User Portal (`:5173`)**: Secure registration and profile management for students.
   - **Admin Portal (`:5174`)**: High-performance dashboard for institutional oversight.

2. **Enterprise Admin Dashboard**:
   - **Interactive Live Telemetry**: Real-time tracking of logins, registrations, and system events.
   - **Granular RBAC**: Manage roles and permissions with a visual policy editor.
   - **User Directory**: Deep-dive into specific user profiles with dedicated security audit timelines.
   - **System Health**: Active monitoring of server load, database connectivity, and auth caches.

3. **Robust Security & Auditing**:
   - **JWT with Session Expiry**: Every token event (login/logout) is tracked with IP and expiry data.
   - **Database-Level Auditing**: Global `AuditMixin` ensures every change is timestamped and attributed.

---

## 🚀 Unified Quick Start

Launch the entire ecosystem (5 Services: Backends + Frontend Portals) with a single command:

```powershell
# Run the professional startup sequence
.\start_erp.bat
```

This will automatically clean up ghost processes, free the required ports, and launch:
1. **Auth Backend** (Port 8000)
2. **Admission Backend** (Port 8001)
3. **Authentication Admin Dashboard** (Port 5173)
4. **Admission Portal** (Port 5174)
5. **Student User Login/Profile** (Port 5175)

---

### Your Dashboard Addresses:

- **Authentication Admin (Users, Roles, RBAC)**: [http://localhost:5173](http://localhost:5173)
- **Admission Portal (Applications, Brochures)**: [http://localhost:5174](http://localhost:5174)
- **Student User Login (Personal Profile)**: [http://localhost:5175](http://localhost:5175)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🗄️ Database Architecture (PostgreSQL)

The system uses a unified **PostgreSQL** database named `pvg_auth` to handle both authentication and the integrated admission module.

### 1. Initialization Logic
The core schema and security policies are defined in [setup_auth_tables.sql](file:///d:/Merging_auth_&_admission/setup_auth_tables.sql). This file performs:
- **Schema Creation**: Tables for RBAC, Users, Documents, and Login Logs.
- **Module Seeding**: Populates 10 institutional modules (Admission, Exam, Attendance, etc.).
- **Smart Permissioning**: Dynamically generates `VIEW`, `CREATE`, `EDIT`, and `APPROVE` permissions for every system feature.

### 2. Relational Security Model (RBAC)
The system follows a strict hierarchical permission model:
- **Modules**: High-level functional areas (e.g., Admission & Enrollment).
- **Features**: Specific tools within a module (e.g., Upload Documents).
- **Permissions**: Atomic actions mapped to features (e.g., Upload Documents - CREATE).
- **Role Permissions**: Maps institutional roles (`admin`, `hod`, `student`) to specific permissions.

### 3. Core Tables Summary:
- `users`: Stores emails and secure Argon2 password hashes.
- `roles`: Institutional identities with unique descriptions.
- `documents`: Tracks file paths, verification status, and ownership for the Admission module.
- `login_log`: Real-time audit trail of all security events.

---

## 📋 System Setup

### 1. Database (PostgreSQL)
Ensure PostgreSQL is running on `localhost:5432`.
1. Create database `pvg_auth`.
2. Initialize schema:
   ```bash
   psql -U postgres -d pvg_auth -f setup_auth_tables.sql
   ```

### 2. Environment Configuration
Create a `.env` in the `backend/` folder:
```env
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/pvg_auth
SECRET_KEY=pvg_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. Folder Structure
- `/backend`: FastAPI core and SQLAlchemy models.
- `/frontend/user`: Vite-based student registration portal.
- `/frontend/admin`: Premium administrative dashboard.

---

## 🔐 API Reference
- **Admin**: `GET /admin/stats`, `GET /admin/users`, `GET /admin/audit`
- **Auth**: `POST /auth/login`, `POST /auth/register`, `POST /roles/assign`
- **Profiles**: `GET /users/me`, `GET /admin/users/{id}`
