@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   残响学园 · DEMO
echo   正在启动本地服务器……
echo.
node server.mjs --open
if errorlevel 1 (
  echo.
  echo   启动失败。请确认已安装 Node.js 18 或更高版本。
  pause
)
