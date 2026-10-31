# CONFLUENCE - Quickstart Script
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting CONFLUENCE Memory Network Stack " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Activate Python virtual environment and ensure dependencies
if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    .\.venv\Scripts\pip install -r backend\requirements.txt
}

# 2. Seed demo database if needed
Write-Host "Checking / seeding demo scenario database..." -ForegroundColor Yellow
.\.venv\Scripts\python scripts\seed_demo.py

# 3. Start Backend in background process
Write-Host "Launching FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
$backendProc = Start-Process -FilePath ".\.venv\Scripts\uvicorn.exe" -ArgumentList "backend.app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

# 4. Start Frontend
Write-Host "Launching Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Green
Set-Location frontend
npm run dev

# Cleanup on exit
Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
