@echo off
echo ============================================
echo   TrustPay - Hackathon Demo Startup Script
echo ============================================

echo.
echo [1/3] Starting Python Flask ML API on port 5001...
start "TrustPay ML API" cmd /k "cd /d c:\devtrails 2\TrustPay\ml && pip install -r requirements.txt -q && python app.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Spring Boot Backend on port 8080...
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.10"
set "PATH=%JAVA_HOME%\bin;%PATH%"
start "TrustPay Backend" cmd /k "set JAVA_HOME=C:\Program Files\Java\jdk-21.0.10 && set PATH=%JAVA_HOME%\bin;%PATH% && cd /d c:\devtrails 2\TrustPay\backend\trustpay-backend && mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >nul

echo [3/3] Starting React Frontend on port 5173...
start "TrustPay Frontend" cmd /k "cd /d c:\devtrails 2\TrustPay\frontend && npm run dev"

echo.
echo ============================================
echo  All services starting up!
echo  Flask ML:  http://localhost:5001/health
echo  Backend:   http://localhost:8080/api
echo  Frontend:  http://localhost:5173
echo ============================================
echo.
echo  Admin Setup (run after backend starts):
echo  POST http://localhost:8080/api/auth/create-admin?secret=trustpay2026
echo  Login: admin / Admin@2026
echo ============================================
echo.
pause
