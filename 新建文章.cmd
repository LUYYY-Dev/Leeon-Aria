@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   没有找到 Node.js。
  echo   可以到 https://nodejs.org 安装，或者手动在 content\posts\ 下新建 .md 文件。
  echo.
  pause
  exit /b 1
)

node "tools\new-post.mjs"
echo.
pause
