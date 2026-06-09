@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   从 content.txt 更新所有页面
echo ============================================
echo.

python3 build.py %*

echo.
pause
