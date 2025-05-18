import os
import re

# Directory to scan - adjust if you want a narrower/larger scope
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIRS = [
    os.path.join(PROJECT_ROOT, "src"),
    os.path.join(PROJECT_ROOT, "components")
]

# Extend this with more patterns if you add new tokens
DARK_BG_CLASSES = [
    "bg-primary-600", "bg-primary-700", "bg-primary-800", "bg-primary-900", "bg-primary-950",
    "bg-secondary-700", "bg-secondary-800", "bg-secondary-900", "bg-secondary-950",
    "bg-accent-700", "bg-accent-800", "bg-accent-900", "bg-accent-950",
    "bg-gradient-to-r", "bg-gradient-to-l", "bg-gradient-to-t", "bg-gradient-to-b"
]
LIGHT_TEXT_CLASSES = ["text-custom-white", "text-white"]

# Regex to roughly match JSX className strings
CLASSNAME_RE = re.compile(r'className\s*=\s*(["\'])(.*?)\1', re.DOTALL)

def scan_file(filepath):
    issues = []
    with open(filepath, encoding="utf-8") as f:
        code = f.read()
        class_matches = CLASSNAME_RE.findall(code)
        for quoted, classes in class_matches:
            bg_found = any(bg in classes for bg in DARK_BG_CLASSES)
            if bg_found:
                light_text = any(light in classes for light in LIGHT_TEXT_CLASSES)
                if not light_text:
                    issues.append((filepath, classes))
    return issues

def scan_project():
    findings = []
    for src_dir in SRC_DIRS:
        for root, dirs, files in os.walk(src_dir):
            for f in files:
                if f.endswith(('.js', '.jsx', '.ts', '.tsx')):
                    file_path = os.path.join(root, f)
                    issues = scan_file(file_path)
                    findings.extend(issues)
    return findings

if __name__ == "__main__":
    findings = scan_project()
    if not findings:
        print("✅ All dark backgrounds have proper light text classes applied.")
    else:
        print("⚠️  Potential issues detected!")
        for filepath, classes in findings:
            print(f" - {filepath}:")
            print(f"    className=\"{classes.strip()}\" ->")
            print(f"    🔴 No 'text-custom-white' or 'text-white' found with dark background.\n")
        print("Please review these locations to ensure text contrast is accessible.")