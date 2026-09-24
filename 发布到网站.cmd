@echo off
chcp 65001 >nul
cd /d "%~dp0"

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo.
  echo   当前目录还不是 Git 仓库，请先按 README 里的步骤关联到 GitHub。
  echo.
  pause
  exit /b 1
)

set "GITNAME="
for /f "delims=" %%i in ('git config user.name') do set "GITNAME=%%i"
if "%GITNAME%"=="" (
  echo.
  echo   还没有配置 Git 身份，先执行这两条命令：
  echo.
  echo       git config --global user.name  "你的名字"
  echo       git config --global user.email "你的邮箱"
  echo.
  pause
  exit /b 1
)

echo.
set /p MSG=这次改了什么？（直接回车使用默认说明）: 
if "%MSG%"=="" set "MSG=更新博客内容"

git add -A
git commit -m "%MSG%"
if errorlevel 1 (
  echo.
  echo   没有需要提交的改动。
  echo.
  pause
  exit /b 0
)

git push
if errorlevel 1 (
  echo.
  echo   推送失败，通常是需要登录 GitHub 或网络问题。
  echo.
) else (
  echo.
  echo   推送成功。GitHub 会在 1-2 分钟后自动构建并发布。
  echo.
)
pause
