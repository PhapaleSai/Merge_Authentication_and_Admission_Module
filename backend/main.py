from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import auth, student, roles, users, admin, modules, features, permissions, logs

# Create all tables on startup (including new users & roles tables)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PVG College Auth API",
    version="2.0.0",
    description="Authentication & Authorization API with User Management",
)

# Allow React dev server and production nginx
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── New routers (spec endpoints) ──────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")       # POST /api/auth/login, POST /api/auth/logout
app.include_router(roles.router, prefix="/api")      # GET /api/roles, POST /api/roles/assign
app.include_router(users.router, prefix="/api")      # GET /api/users, GET /api/users/{user_id}
app.include_router(admin.router, prefix="/api")      # GET /api/admin/stats, /users, /roles, /audit
app.include_router(modules.router, prefix="/api")    # GET, POST, DELETE /api/modules
app.include_router(features.router, prefix="/api")   # GET, POST, DELETE /api/features
app.include_router(permissions.router, prefix="/api")# GET, POST, DELETE /api/permissions
app.include_router(logs.router, prefix="/api")       # GET /api/logs

# ── Legacy routers ────────────────────────────────────────────────────────────
app.include_router(student.router)    # /api/signup, /api/login (old), /api/me, /api/students


@app.get("/")
def root():
    return {"message": "PVG College Auth API v2 is running — visit /docs for the interactive API docs"}
