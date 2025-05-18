const fs = require('fs');
const path = require('path');

const SRC_DIRS = [
  path.join(__dirname, '..', 'src'),
  path.join(__dirname, '..', 'components')
];

// Tweak or expand these as your palette grows
const DARK_BG_CLASSES = [
  'bg-primary-600', 'bg-primary-700', 'bg-primary-800', 'bg-primary-900', 'bg-primary-950',
  'bg-secondary-700', 'bg-secondary-800', 'bg-secondary-900', 'bg-secondary-950',
  'bg-accent-700', 'bg-accent-800', 'bg-accent-900', 'bg-accent-950',
  'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-t', 'bg-gradient-to-b'
];
const LIGHT_TEXT_CLASSES = ['text-custom-white', 'text-white'];

// Regex to match JSX className strings
const CLASSNAME_RE = /className\s*=\s*{?\s*["'`]([^"'`}]+)["'`]\s*}?/g;

function scanFile(filePath) {
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = CLASSNAME_RE.exec(content))) {
    const classString = match[1];
    const hasDarkBg = DARK_BG_CLASSES.some(bg => classString.includes(bg));
    if (hasDarkBg) {
      const hasLightText = LIGHT_TEXT_CLASSES.some(light => classString.includes(light));
      if (!hasLightText) {
        issues.push({ filePath, classString });
      }
    }
  }
  return issues;
}

function walkDirs(dirs) {
  let findings = [];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    const stack = [dir];
    while (stack.length) {
      const current = stack.pop();
      const stat = fs.statSync(current);
      if (stat.isDirectory()) {
        fs.readdirSync(current).forEach((f) => stack.push(path.join(current, f)));
      } else if (
        current.endsWith('.js') ||
        current.endsWith('.jsx') ||
        current.endsWith('.ts') ||
        current.endsWith('.tsx')
      ) {
        findings = findings.concat(scanFile(current));
      }
    }
  });
  return findings;
}

// MAIN
const findings = walkDirs(SRC_DIRS);

if (findings.length === 0) {
  console.log('✅ All dark backgrounds have proper light text classes applied.');
} else {
  console.log('⚠️  Potential issues detected!');
  findings.forEach(({ filePath, classString }) => {
    console.log(` - ${filePath}:`);
    console.log(`    className="${classString.trim()}"`);
    console.log("    🔴 No 'text-custom-white' or 'text-white' found with dark background.\n");
  });
  console.log('Please review these locations to ensure text contrast is accessible.');
}