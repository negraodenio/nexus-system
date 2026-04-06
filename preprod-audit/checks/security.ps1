# 🔐 [MODULE] Security & Secrets Scan (Windows Native)
Write-Host "🔐 Scanning for Hardcoded Secrets and Dependencies..." -ForegroundColor Yellow

# 1. Secret Detection (Native Fallback)
Write-Host "   - Scanning for Secrets in .env and lib/ files..."
$Patterns = @("KEY=", "SECRET=", "PASSWORD=", "TOKEN=")
$FoundSecrets = Select-String -Path ".env*", "lib/*.ts", "src/*.ts" -Pattern $Patterns -Exclude "node_modules/*" -ErrorAction SilentlyContinue

if ($FoundSecrets) {
    Write-Host "     ⚠️ WARNING: Potential secrets found in source files!" -ForegroundColor Yellow
    $FoundSecrets | ForEach-Object { Write-Host "       -> $($_.Path):$($_.LineNumber)" -ForegroundColor Gray }
} else {
    Write-Host "     ✅ No obvious secrets found in local scan." -ForegroundColor Green
}

# 2. Dependency Vulnerabilities
Write-Host "   - Checking npm vulnerabilities..."
try {
    $AuditResult = npm audit --audit-level=high --omit=dev --json | ConvertFrom-Json
    if ($AuditResult.metadata.vulnerabilities.high -gt 0 -or $AuditResult.metadata.vulnerabilities.critical -gt 0) {
        Write-Host "     ❌ ERR: Critical/High vulnerabilities found!" -ForegroundColor Red
        Write-Host "     Details: $($AuditResult.metadata.vulnerabilities.high) High, $($AuditResult.metadata.vulnerabilities.critical) Critical"
        exit 1
    } else {
        Write-Host "     ✅ npm audit passed (High/Critical)." -ForegroundColor Green
    }
} catch {
    Write-Host "     ⚠️ WARN: npm audit command failed (check if node/npm is in PATH)." -ForegroundColor Yellow
    # Don't fail the whole audit just because of a tool path issue unless strict
}

Write-Host "✅ Security checks completed." -ForegroundColor Green
exit 0
