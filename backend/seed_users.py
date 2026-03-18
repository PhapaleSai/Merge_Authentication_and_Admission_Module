"""
seed_users.py
-------------
Run this once to populate the `users` and `roles` tables with demo data
so you can immediately test all 6 API endpoints.

Usage (from the backend/ directory):
    python seed_users.py
"""

import sys
import os

# Make sure our modules are importable
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
import models
from auth import get_password_hash

# Create tables
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # ── Seed roles ────────────────────────────────────────────────────────────
    existing_roles = db.query(models.Role).all()
    if not existing_roles:
        print("ℹ️   No roles found. Ensure you have run the setup_auth_tables.sql script.")
        role_objects = {}
    else:
        role_objects = {r.role_name: r for r in existing_roles}

    # ── Seed users ────────────────────────────────────────────────────────────
    existing_users = db.query(models.User).count()
    if existing_users == 0:
        demo_users = [
            {
                "user_id": 101,
                "username": "Sai",
                "email": "sai@example.com",
                "password": "password123",
                "role": "faculty",
            },
            {
                "user_id": 102,
                "username": "Admin",
                "email": "admin@example.com",
                "password": "admin123",
                "role": "admin",
            },
        ]
        for u in demo_users:
            user = models.User(
                user_id=u["user_id"],
                username=u["username"],
                email=u["email"],
                password_hash=get_password_hash(u["password"])
            )
            db.add(user)
            db.commit()
            
            role_obj = role_objects.get(u["role"])
            if role_obj:
                ur = models.UserRole(user_id=user.user_id, role_id=role_obj.role_id)
                db.add(ur)
            db.commit()
        db.commit()
        print("✅  Seeded demo users:")
        for u in demo_users:
            print(f"    email={u['email']}  password={u['password']}  role={u['role']}")
    else:
        print(f"ℹ️   {existing_users} users already exist, skipping user seed.")

    print("\n🚀  Done! Start the server with:  uvicorn main:app --reload")
    print("📖  Then open http://127.0.0.1:8000/docs for interactive API docs.\n")

finally:
    db.close()
