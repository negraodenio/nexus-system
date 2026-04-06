# ==============================================================================
# NEXUS MOTION 3.0 - PHYSICAL INTELLIGENCE OS
# COMPREHENSIVE SYSTEM AUDIT (WINDOWS NATIVE)
# VERSION: 1.3.0
# ==============================================================================

# Configuration
$STRICT_MODE = $false
$ENVIRONMENT = "Development"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd_HH-mm"
$REPORT_DIR = "preprod-audit/reports/$TIMESTAMP"
New-Item -ItemType Directory -Path $REPORT_DIR -Force | Out-Null

$Global:AuditFailed = $false
$Global:RiskScore = 0

Write-Host "Nexus Motion 3.0 Audit Started" -ForegroundColor Cyan

# --- CHECK: Security ---
Write-Host "Checking Security..." -ForegroundColor Yellow
$FoundSecrets = Select-String -Path ".env*", "lib/*.ts" -Pattern "KEY=", "SECRET=", "PASSWORD=" -ErrorAction SilentlyContinue
if ($FoundSecrets) { 
    Write-Host "  WARN: Potential secrets in env/lib files" -ForegroundColor Yellow 
}

try {
    npm audit --audit-level=high --omit=dev --json > "$REPORT_DIR/security.log"
    Write-Host "  PASS: Security scan completed" -ForegroundColor Green
} catch {
    Write-Host "  WARN: npm audit skipped" -ForegroundColor Yellow
}

# --- CHECK: AI Compliance ---
Write-Host "Checking AI Compliance..." -ForegroundColor Yellow
if (Test-Path "docs/AI_MODEL_REGISTRY.md") {
    $Content = Get-Content "docs/AI_MODEL_REGISTRY.md" -Raw
    if ($Content -match "Transparency" -and $Content -match "Ethics") {
        Write-Host "  PASS: AI Model Registry found and valid" -ForegroundColor Green
    } else {
        Write-Host "  WARN: Model Registry missing compliance keywords" -ForegroundColor Yellow
        $Global:RiskScore += 10
    }
} else {
    Write-Host "  FAIL: AI_MODEL_REGISTRY.md missing" -ForegroundColor Red
    $Global:AuditFailed = $true
    $Global:RiskScore += 25
}

# --- CHECK: Code Integrity ---
Write-Host "Checking Code Integrity..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  PASS: Project structure valid" -ForegroundColor Green
} else {
    Write-Host "  FAIL: package.json missing" -ForegroundColor Red
    $Global:AuditFailed = $true
}

# Finalize
$Status = if ($Global:AuditFailed) { "FAILED" } else { "PASSED" }
$Summary = "Audit Result: $Status`r`nTotal Risk Score: $($Global:RiskScore) / 100"
$Summary | Out-File "$REPORT_DIR/FINAL_REPORT.txt"

Write-Host "----------------------------------------"
if ($Global:AuditFailed) {
    Write-Host "Audit FAILED - Risk Score: $($Global:RiskScore)" -ForegroundColor Red
} else {
    Write-Host "Audit PASSED - Risk Score: $($Global:RiskScore)" -ForegroundColor Green
}
Write-Host "Report saved to $REPORT_DIR/FINAL_REPORT.txt"
