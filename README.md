# PVG College Auth & Authorization Module 🎓

A full-stack authentication, authorization, and student management application built for **PVG College of Science**.

**Technology Stack:** React (Vite) · FastAPI · PostgreSQL · SQLAlchemy

---

## 🌟 What We've Built So Far

1. **Secure JWT Authentication**:
   - `students` can register and log in via the React frontend.
   - Passwords are securely hashed using `bcrypt`.
   - The React UI automatically attaches JWT tokens to authenticated requests.

2. **Backend Architecture**:
   - Upgraded from SQLite to a robust **PostgreSQL** database.
   - Built a comprehensive FastAPI backend that perfectly mirrors the complex `pvg_auth` relational database schema.
   - Integrated Pydantic models to validate all API incoming and outgoing data.

3. **Role-Based Access Control (RBAC)**:
   - Built endpoints (`GET /roles`, `POST /roles/assign`) to manage and assign dynamic roles (Admin, Principal, Student, Faculty) securely using a `user_roles` linking table.
   - Advanced endpoints built for managing global `User` accounts separate from the legacy `Student` UI flow.

4. **Testing Environments**:
   - Fully interactive **Swagger UI** (`/docs`) configured with OAuth2 to test role assignments easily.
   - Custom **Postman Collection** with automated JWT token handling included in the project root.

---

## 🚀 Setup Instructions

### 1. Database Setup (PostgreSQL)

You will need PostgreSQL installed and running on your machine (default port `5432`).

1. Open `pgAdmin` or your terminal (`psql`).
2. Create a new database named `pvg_auth`:
   ```sql
   CREATE DATABASE pvg_auth;
   ```
3. Run the provided schema script against your new database to create the `users`, `roles`, `user_roles`, and `students` tables:
   ```bash
   psql -U postgres -d pvg_auth -f setup_auth_tables.sql
   ```
*(Replace `postgres` with your Postgres username if different).*

### 2. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate      # Windows
   # source venv/bin/activate   # Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your Environment Variables:
   - Ensure you have a `.env` file inside the `backend` folder containing your database credentials:
     ```env
     DATABASE_URL=postgresql+psycopg2://postgres:sai123@localhost:5432/pvg_auth
     SECRET_KEY=pvg_super_secret_key_change_in_production
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=60
     ```
   *(Update `sai123` to your actual Postgres password).*

5. Create Demo Data (Optional but Recommended):
   ```bash
   python seed_users.py
   ```
   *This seeds default testing users into the database.*

6. Start the Server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   **The backend will now be live at `http://127.0.0.1:8000`**. You can visit `/docs` for the interactive Swagger UI.

### 3. Frontend Setup

1. Open a **new** terminal (keep the backend running) and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install NodeJS dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL provided (usually **`http://localhost:5173`**).

---

## 📋 Available Frontend Pages

1. **Sign Up** (`/signup`) — Create a new student account (Name, Class, Phone, Username, Password). This hits `/api/signup` and saves direct to PostgreSQL.
2. **Login** (`/login`) — Login with your username and password. Returns a secure JWT Token.
3. **Welcome Dashboard** (`/welcome`) — Protected page showing dynamic student data fetched securely using the JWT Token.

## 🔐 API Endpoints Overview

- **Auth Core**: `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`
- **UI Specific**: `POST /api/login`, `POST /api/signup`, `GET /api/me`
- **Roles & Users**: `GET /roles`, `POST /roles/assign`, `GET /users`
