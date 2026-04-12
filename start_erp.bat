@echo off
echo ==============================================
echo PVG Unified ERP Startup Sequence
echo ==============================================

echo Cleaning up ghost processes (Freeing ports 8000, 8001, 5173, 5174, 5175)...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8000') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8001') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5173') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5174') DO taskkill /T /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5175') DO taskkill /T /F /PID %%a >nul 2>&1
echo Ports cleaned!

echo [1/5] Starting Auth Backend (Port 8000)
start "Auth Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn main:app --port 8000"

echo [2/5] Starting Admission Backend (Port 8001)
start "Admission Backend" cmd /k "cd admission_module && ..\backend\venv\Scripts\python.exe -m uvicorn app.main:app --port 8001"

echo [3/5] Starting Authentication Admin Dashboard (Port 5173)
start "Auth Admin" cmd /k "cd frontend\admin && node node_modules\vite\bin\vite.js"

echo [4/5] Starting Admission Portal (Port 5174)
start "Admission Portal" cmd /k "cd admission_module\frontend && node node_modules\vite\bin\vite.js"

echo [5/5] Starting Student User Login (Port 5175)
start "User Portal" cmd /k "cd frontend\user && node node_modules\vite\bin\vite.js"

echo.
echo All services are launching in separate windows!
echo ==============================================
echo AUTH ADMIN (Users/Roles): http://localhost:5173
echo ADMISSION PORTAL       : http://localhost:5174
echo STUDENT USER LOGIN     : http://localhost:5175
echo ==============================================
pause
