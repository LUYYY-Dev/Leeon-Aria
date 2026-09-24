@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   ===== Hugo 安装助手 =====
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\install-hugo.ps1"
echo.
pause
