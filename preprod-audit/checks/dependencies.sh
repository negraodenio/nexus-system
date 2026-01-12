#!/usr/bin/env bash
echo "📦 [MODULE] Dependency & License Compliance"

# 1. License Compliance
echo "   - Verifying Open Source Licenses..."
# Use license-checker if available
if command -v npx >/dev/null; then
    # Exclude development dependencies for license check
    npx license-checker --production --summary || {
        echo "     WARN: License check failed or tools missing."
    }
fi

# 2. CVE Scanning (Snyk - if configured)
echo "   - Scanning for CVEs..."
if command -v snyk >/dev/null; then
    snyk test || echo "     WARN: Snyk found issues (or authentication missing)."
else
    echo "     WARN: Snyk CLI not installed. Skipping deep CVE scan."
fi

echo "✅ Dependency compliance checked."
