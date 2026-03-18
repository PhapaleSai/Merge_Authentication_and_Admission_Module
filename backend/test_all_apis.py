import requests

BASE_URL = "http://127.0.0.1:8000"

# 1. Login
print("\n--- 1. Login ---")
login_res = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "sai@example.com",
    "password": "password123"
})
print("Status:", login_res.status_code)
print("Response:", login_res.json())

# Save token for auth routes
token = login_res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Get Roles
print("\n--- 2. Get Roles ---")
print(requests.get(f"{BASE_URL}/roles").json())

# 3. Get Users
print("\n--- 3. Get All Users ---")
print(requests.get(f"{BASE_URL}/users").json())

# 4. Get User by ID
print("\n--- 4. Get User 101 ---")
print(requests.get(f"{BASE_URL}/users/101").json())

# 5. Assign Role
print("\n--- 5. Assign Role ---")
print(requests.post(f"{BASE_URL}/roles/assign", headers=headers, json={
    "user_id": 101,
    "role": "Admin"
}).json())

# 6. Logout
print("\n--- 6. Logout ---")
print(requests.post(f"{BASE_URL}/auth/logout", headers=headers).json())
