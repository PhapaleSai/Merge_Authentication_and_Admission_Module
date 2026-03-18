from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import auth, student, roles, users

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
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── New routers (spec endpoints) ──────────────────────────────────────────────
app.include_router(auth.router)       # POST /auth/login, POST /auth/logout
app.include_router(roles.router)      # GET /roles, POST /roles/assign
app.include_router(users.router)      # GET /users, GET /users/{user_id}

# ── Legacy routers ────────────────────────────────────────────────────────────
app.include_router(student.router)    # /api/signup, /api/login (old), /api/me, /api/students


@app.get("/")
def root():
    return {"message": "PVG College Auth API v2 is running — visit /docs for the interactive API docs"}
