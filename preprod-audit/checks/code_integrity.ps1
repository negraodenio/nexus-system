# 🛡️ [MODULE] Code Integrity & Linter (PowerShell)
Write-Host "🛡️ Verifying Project Source Code and Static Analysis..." -ForegroundColor Yellow

# 1. Package.json Verification
if (-not (Test-Path "package.json")) {
    Write-Host "     ❌ ERR: package.json missing! Not a node project?" -ForegroundColor Red
    exit 1
}

# 2. Linting (Mock/Check)
Write-Host "   - Running Linting..."
try {
    npm run lint -- --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "     ✅ Linter passed (Clean Build)." -ForegroundColor Green
    } else {
        Write-Host "     ⚠️ WARN: Linter found issues. Run 'npm run lint' for details." -ForegroundColor Yellow
    }
} catch {
    Write-Host "     ⚠️ WARN: Linter script 'npm run lint' failed or not defined." -ForegroundColor Yellow
}

# 3. Unit Tests (Kinetic Engine)
Write-Host "   - Running Unit Tests..."
try {
    # Run a subset of tests if possible
    npm test -- --watchAll=false
    if ($LASTEXITCODE -eq 0) {
        Write-Host "     ✅ All tests passed." -ForegroundColor Green
    } else {
        Write-Host "     ❌ ERR: Tests failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "     ⚠️ WARN: Test script 'npm test' failed or not defined." -ForegroundColor Yellow
}

Write-Host "✅ Code Integrity checks completed." -ForegroundColor Green
exit 0
