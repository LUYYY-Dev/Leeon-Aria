@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "HUGO=.tools\hugo\hugo.exe"
if not exist "%HUGO%" set "HUGO=hugo"

echo.
echo   正在生成静态网站到 public\ 目录 ...
echo.

"%HUGO%" --minify --cleanDestinationDir

if errorlevel 1 (
  echo.
  echo   构建失败，请把上面的报错内容发出来。
) else (
  echo.
  echo   构建完成，静态文件在 public\ 目录。
)
echo.
pause
