@echo off
cd /d "%~dp0"
echo Starting UNBLOCKED at http://localhost:3000 (close this window to stop)
start "" http://localhost:3000
node server.mjs
