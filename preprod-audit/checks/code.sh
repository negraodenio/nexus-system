#!/usr/bin/env bash
echo "🧠 [MODULE] Code Quality & Static Analysis"

# 1. Linting (Critical)
echo "   - Running Linter (ESLint)..."
if npm run lint; then
    echo "     OK: Linting passed"
else
    echo "     ERR: Linting failed"
    exit 1
fi

# 2. Type Checking (Critical for TypeScript)
echo "   - Running Type Check..."
# Check if typecheck script exists, otherwise run tsc directly
if npm run | grep -q "typecheck"; then
    npm run typecheck
else
    # Fallback to direct tsc check
    if npx tsc --noEmit; then
        echo "     OK: Type checking passed"
    else
        echo "     ERR: Type checking failed"
        exit 1
    fi
fi

# 3. Unit Tests (Recommended)
echo "   - Running Unit Tests..."
if npm run | grep -q "test"; then
    npm test -- --coverage
else
    echo "     WARN: No 'test' script found in package.json. Skipping."
    # Non-blocking for now, but logged
fi

# 4. Dead Code Analysis (Optional)
echo "   - Checking for Dead Code..."
if command -v npx >/dev/null; then
    # We use || true so this doesn't block deployment, just warns
    npx ts-prune | head -n 10 || true 
fi

echo "✅ Code quality checks completed successfully."
