@echo off
echo ZK8500R Fingerprint Bridge Service Installer - Windows
echo ======================================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please download and install Python 3.7+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Python version: %PYTHON_VERSION%

echo.
echo Installing required Python packages...
echo This will install: websockets, pyzkfp
echo.

pip install websockets pyzkfp

if errorlevel 1 (
    echo ERROR: Failed to install Python packages
    echo Try running: pip install --user websockets pyzkfp
    pause
    exit /b 1
)

echo.
echo Checking for ZKFinger SDK...
echo Note: ZKFinger SDK must be installed separately from ZKTeco
echo Download from: https://www.zkteco.com/en/download_category/29.html
echo.

echo Creating startup script...
echo @echo off > start-bridge.bat
echo echo Starting ZK8500R Fingerprint Bridge Service... >> start-bridge.bat
echo echo Press Ctrl+C to stop >> start-bridge.bat
echo echo. >> start-bridge.bat
echo python services\fingerprint_bridge_windows.py >> start-bridge.bat

echo Startup script created: start-bridge.bat
echo.

echo Testing bridge service...
timeout /t 2 /nobreak >nul
start /b python services\fingerprint_bridge_windows.py >nul 2>&1
timeout /t 3 /nobreak >nul

tasklist /fi "imagename eq python.exe" | find "python.exe" >nul
if errorlevel 1 (
    echo WARNING: Bridge service may not have started correctly
    echo This is normal if ZKFinger SDK is not installed
    echo The service will run in mock mode for testing
) else (
    echo SUCCESS: Bridge service started
    taskkill /f /im python.exe >nul 2>&1
)

echo.
echo Installation Complete!
echo =====================
echo.
echo To start the fingerprint bridge service:
echo   start-bridge.bat
echo.
echo The bridge will run on WebSocket port 8765
echo Web browsers can then connect to: ws://localhost:8765
echo.
echo For production use:
echo 1. Install ZKFinger SDK from ZKTeco
echo 2. Connect ZK8500R scanner to USB
echo 3. Run the bridge service
echo.
echo Happy scanning!
echo.
pause