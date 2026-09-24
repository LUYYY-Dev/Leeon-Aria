@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "HUGO=.tools\hugo\hugo.exe"
if not exist "%HUGO%" set "HUGO=hugo"

"%HUGO%" version >nul 2>nul
if errorlevel 1 (
  echo.
  echo   没有找到 Hugo。
  echo   请先双击「安装Hugo.cmd」，或者执行 winget install Hugo.Hugo.Extended
  echo.
  pause
  exit /b 1
)

echo.
echo   正在启动本地预览 ...
echo   浏览器稍后会自动打开 http://localhost:1313/
echo   关闭这个窗口即可停止预览。
echo.

start "" /min cmd /c "timeout /t 4 >nul && start http://localhost:1313/"

"%HUGO%" server -D --disableFastRender --navigateToChanged

echo.
echo   预览已停止。
pause
