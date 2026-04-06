# ⚖️ [MODULE] EU AI Act & Nexus Compliance (PowerShell)
Write-Host "⚖️ Verifying AI Model Registry & Compliance Assets..." -ForegroundColor Yellow

# 1. Check AI_MODEL_REGISTRY.md
$RegistryPath = "docs/AI_MODEL_REGISTRY.md"
if (-not (Test-Path $RegistryPath)) {
    Write-Host "     ❌ ERR: AI_MODEL_REGISTRY.md not found!" -ForegroundColor Red
    Write-Host "     ACTION: High-risk AI systems must have a formal model card registry."
    exit 1
}

# 2. Verify Compliance Keywords (EU AI Act requirement)
$RegistryContent = Get-Content -Path $RegistryPath -Raw
$Keywords = @("Transparency", "Model Card", "Ethics", "Latency", "Governance")
$Missing = @()

foreach ($Key in $Keywords) {
    if ($RegistryContent -notmatch $Key) {
        $Missing += $Key
    }
}

if ($Missing.Count -gt 0) {
    Write-Host "     ⚠️ WARN: Missing specific compliance keywords: $($Missing -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "     ✅ AI Model Registry is compliant with Nexus 3.0 standards." -ForegroundColor Green
}

# 3. Check for Architecture Manifest
if (-not (Test-Path "docs/ARCHITECTURE_MANIFEST.md")) {
    Write-Host "     ⚠️ WARN: ARCHITECTURE_MANIFEST.md missing. Physical SDLC audit requires it." -ForegroundColor Yellow
} else {
    Write-Host "     ✅ Architecture Manifest detected." -ForegroundColor Green
}

Write-Host "✅ AI Compliance checks completed." -ForegroundColor Green
exit 0
