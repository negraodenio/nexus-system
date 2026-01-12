#!/usr/bin/env bash
echo "📄 [MODULE] Generating Final Audit Summary"

if [ -z "$REPORT_DIR" ]; then
    echo "     ERR: REPORT_DIR variable not set."
    exit 1
fi

REPORT_FILE="$REPORT_DIR/FINAL_REPORT.txt"

echo "========================================================" > "$REPORT_FILE"
echo "   ANTIGRAVITY PRE-PRODUCTION AUDIT - FINAL SUMMARY" >> "$REPORT_FILE"
echo "========================================================" >> "$REPORT_FILE"
echo "Timestamp: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "MODULE RESULTS:" >> "$REPORT_FILE"
echo "--------------------------------------------------------" >> "$REPORT_FILE"

# Iterate over all module logs to summarize pass/fail
for f in "$REPORT_DIR"/*.log; do
  MODULE=$(basename "$f" .log)
  if grep -q "ERR:" "$f"; then
     STATUS="[FAIL]"
  elif grep -q "WARN:" "$f"; then
     STATUS="[WARN]"
  else
     STATUS="[PASS]"
  fi
  echo "$STATUS $MODULE" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "DETAILED LOGS:" >> "$REPORT_FILE"
echo "--------------------------------------------------------" >> "$REPORT_FILE"
echo "See individual .log files in $REPORT_DIR/" >> "$REPORT_FILE"

echo "     Report saved to $REPORT_FILE"
echo "✅ Final report generated."
