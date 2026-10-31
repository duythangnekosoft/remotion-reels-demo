@echo off
title Remotion Reels US Studio
cd /d "%~dp0"

echo ==============================================================
echo   KHOI DONG REMOTION REELS STUDIO (PORT 3100)
echo ==============================================================
echo.
echo Dang mo Remotion Studio...
echo Trinh duyet se tu dong mo tai: http://localhost:3100
echo.

start "" cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3100"
npm start
