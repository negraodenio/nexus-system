#!/usr/bin/env bash
echo "☁️ [MODULE] Infrastructure & IaC Validation"

# 1. Terraform Validation
if [ -d "terraform" ] || ls *.tf >/dev/null 2>&1; then
    echo "   - Validating Terraform..."
    terraform validate || exit 1
else
    echo "   - No Terraform files found. Skipping."
fi

# 2. Docker Compose Config
if [ -f "docker-compose.yml" ]; then
    echo "   - Validating Docker Compose..."
    docker-compose config >/dev/null || exit 1
else
    echo "   - No docker-compose.yml found. Skipping."
fi

# 3. Environment Variables
echo "   - Verifying Environment Config..."
if [ -f ".env.production" ]; then
    echo "     OK: .env.production exists"
else
    echo "     WARN: .env.production missing! Ensure secrets are injected at runtime."
fi

echo "✅ Infrastructure validated."
