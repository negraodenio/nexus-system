import os
import re
import sys

def detect_pii(directory):
    # Regex patterns for common PII
    patterns = {
        "Email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "CPF": r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b",
        "Credit Card": r"\b(?:\d{4}[- ]?){3}\d{4}\b",
        "Phone": r"\b(\+\d{1,3}[- ]?)?\(?\d{2,3}\)?[- ]?\d{4,5}[- ]?\d{4}\b",
        "SSN": r"\b\d{3}-\d{2}-\d{4}\b"
    }
    
    found_pii = False
    
    print(f"Scanning directory: {directory}")
    
    for root, _, files in os.walk(directory):
        for file in files:
            # Skip non-source files
            if not file.endswith(('.ts', '.tsx', '.js', '.jsx', '.py', '.sql')):
                continue
                
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for name, pattern in patterns.items():
                        matches = re.finditer(pattern, content)
                        for match in matches:
                            # Verify if it's not a common false positive (like imports or CSS)
                            matched_text = match.group()
                            if "import" in content[max(0, match.start()-20):match.start()]:
                                continue
                                
                            print(f"[WARN] Potential {name} found in {filepath}: {matched_text}")
                            found_pii = True
            except Exception as e:
                print(f"[ERR] Could not read {filepath}: {e}")

    if found_pii:
        print("PII scanning completed. Potential issues found.")
        sys.exit(1) # Return error code to fail the check
    else:
        print("PII scanning completed. No issues found.")
        sys.exit(0)

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    detect_pii(target_dir)
