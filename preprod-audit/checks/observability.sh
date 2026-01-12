#!/usr/bin/env bash
echo "📊 [MODULE] Observability & Monitoring"

# 1. Logging Implementation
echo "   - Checking for Structured Logging..."
if grep -r "logger" src/ >/dev/null 2>&1 || grep -r "console." src/ >/dev/null 2>&1; then
    echo "     OK: Logging calls found"
else
    echo "     WARN: Minimal logging detected. Ensure comprehensive logs."
fi

# 2. Metrics Endpoint
echo "   - Checking for Metrics Exposure..."
if grep -r "/metrics" src/app/ >/dev/null 2>&1 || grep -r "monitoring" src/ >/dev/null 2>&1; then
    echo "     OK: Metrics endpoint or config found"
else
    echo "     WARN: No standard /metrics endpoint found."
fi

# 3. Tracing / Correlation IDs
echo "   - Checking for Distributed Tracing..."
if grep -r "traceId" src/ >/dev/null 2>&1 || grep -r "requestId" src/ >/dev/null 2>&1; then
    echo "     OK: Trace IDs implemented"
else
    echo "     WARN: No Trace/Request IDs found in source code."
fi

echo "✅ Observability checks completed."
