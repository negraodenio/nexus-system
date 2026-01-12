#!/usr/bin/env bash
echo "🧬 [MODULE] Data Privacy & GDPR"

# 1. PII Detection (Using project script)
echo "   - Scanning for Potential PII..."
if [ -f "preprod-audit/scripts/detect_pii.py" ]; then
    # Ensure python is available
    if command -v python >/dev/null; then
        python preprod-audit/scripts/detect_pii.py "src/" || exit 1
    elif command -v python3 >/dev/null; then
        python3 preprod-audit/scripts/detect_pii.py "src/" || exit 1
    else
        echo "     WARN: Python not found. Skipping PII scan."
    fi
else
    # Simple Grep Fallback if script missing
    echo "     Running fallback grep scan..."
    grep -rE "email|password|cpf|ssn|credit_card" src/ || true
fi

# 2. Retention Policy Check
echo "   - Verifying Data Retention Policies..."
# Check if documentation exists as evidence
if ls docs/*retention* >/dev/null 2>&1 || grep -r "retention" docs/ >/dev/null 2>&1; then
    echo "     OK: Retention policy documented"
else
    echo "     WARN: No retention policy documentation found in docs/"
fi

# 3. Encryption Check
echo "   - Checking Encryption at Rest (Config)..."
if grep -i "encrypt" .env* >/dev/null 2>&1 || grep -i "ssl" .env* >/dev/null 2>&1; then
    echo "     OK: Encryption keys/SSL found in config"
else
    echo "     WARN: No explicit encryption config found in .env files"
fi

echo "✅ GDPR & data protection checks completed."
