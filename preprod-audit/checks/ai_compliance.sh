#!/usr/bin/env bash
echo "🤖 [MODULE] AI Governance & EU AI Act"

# 1. Model Inventory
echo "   - Verifying Model Registry..."
if [ -f "docs/ai_model_registry.md" ]; then
    echo "     OK: AI Model Registry found"
else
    echo "     WARN: 'docs/ai_model_registry.md' missing. AI Act requires model inventory."
fi

# 2. Risk Classification
echo "   - Checking Risk Classification..."
if [ -f "docs/ai_risk_classification.md" ]; then
    echo "     OK: Risk classification document found"
else
    echo "     WARN: User must classify AI risk level (EU AI Act)."
fi

# 3. Prompt Management & Logging
echo "   - Verifying Prompt Logging mechanisms..."
# Check for code that likely handles LLM interaction logging
if grep -r "prompt" src/lib/ >/dev/null 2>&1 || grep -r "log" src/lib/kinetic-engine.ts >/dev/null 2>&1; then
     echo "     OK: Logging mechanisms detected in core libraries"
else
     echo "     WARN: No obvious logger found in src/lib - ensure LLM inputs are logged."
fi

# 4. Human Oversight
echo "   - Checking Human Oversight controls..."
if grep -r "review" src/ || grep -r "approve" src/; then
    echo "     OK: Found keywords related to review/approval workflows"
else
    echo "     WARN: No explicit 'human review' patterns found in code."
fi

echo "✅ AI compliance checks completed."
