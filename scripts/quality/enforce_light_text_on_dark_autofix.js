const fs = require('fs');
const path = require('path');

// Directories to scan
const SRC_DIRS = [
  path.join(__dirname, '..', 'src'),
  path.join(__dirname, '..', 'components')
];

const DARK_BG_CLASSES = [
  'bg-primary-600', 'bg-primary-700', 'bg-primary-800', 'bg-primary-900', 'bg-primary-950',
  'bg-secondary-700', 'bg-secondary-800', 'bg-secondary-900', 'bg-secondary-950',
  'bg-accent-700', 'bg-accent-800', 'bg-accent-900', 'bg-accent-950',
  'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-t', 'bg-gradient-to-b'
];

// Change this to 'text-white' if you prefer the Tailwind class to your custom one
const LIGHT_TEXT_CLASS = 'text-custom-white';

const CLASSNAME_RE = /className\s*=\s*{?\s*["'`]([^"'`}]+)["'`]\s*}?/g;

function autoFixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  const fixedContent = content.replace(CLASSNAME_RE, (match, classString) => {
    const hasDarkBg = DARK_BG_CLASSES.some(bg => classString.includes(bg));
    const hasLightText =
      classString.includes(LIGHT_TEXT_CLASS) || classString.includes('text-white');
    if (hasDarkBg && !hasLightText) {
      changed = true;
      // Add the light text class at the end, making sure spacing is handled
      return match.replace(classString, `${classString} ${LIGHT_TEXT_CLASS}`.replace(/\s+/, ' '));
    }
    return match;
  });
  if (changed) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`✅ Auto-fixed: ${filePath}`);
  }
  return changed;
}

function walkDirs(dirs) {
  let count = 0;
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
        if (autoFixFile(current)) count++;
      }
    }
  });
  return count;
}

// MAIN
const totalFixed = walkDirs(SRC_DIRS);

if (totalFixed === 0) {
  console.log('🎉 No fixes needed: all dark backgrounds already have proper light text classes applied.');
} else {
  console.log(`\nFixed ${totalFixed} file(s). Please review diffs and re-test your UI!`);
}