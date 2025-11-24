@echo off
echo ========================================
echo   Demarrage du Backend Supervive
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
)

echo.
echo [2/3] Demarrage du serveur...
echo.
echo Le serveur va demarrer sur http://localhost:5000
echo Appuyez sur Ctrl+C pour arreter
echo.

call npm run dev

pause

