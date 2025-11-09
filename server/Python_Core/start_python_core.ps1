# start_python_core.ps1
# Quick start script for the unified Python Core service

Write-Host "🚀 Starting Expressly Python Core (Unified Service)" -ForegroundColor Green
Write-Host ""

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# Activate venv
Write-Host "📦 Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Check if requirements are installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Cyan
$pipList = & python -m pip list
if ($pipList -notmatch "fastapi") {
    Write-Host "❌ Dependencies not installed!" -ForegroundColor Red
    Write-Host "Please run: pip install -r requirements_unified.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment ready" -ForegroundColor Green
Write-Host ""
Write-Host "Starting service on http://127.0.0.1:5001" -ForegroundColor Green
Write-Host "Available modules:" -ForegroundColor Cyan
Write-Host "  - Text Analysis:        /text/*" -ForegroundColor White
Write-Host "  - Body Language:        /video/*" -ForegroundColor White
Write-Host "  - Speech Analysis:      /speech/*" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the service
python -m uvicorn app:app --host 127.0.0.1 --port 5001 --reload
