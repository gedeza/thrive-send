import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FlatCompat: Enables using legacy ESLint config files in 'flat config' mode.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Main ESLint config - using Next.js recommended rules
const eslintConfig = [
  // Ignore patterns equivalent to .eslintignore
  {
    ignores: [
      ".next/**/*",
      "dist/**/*",
      "out/**/*",
      "coverage/**/*",
      "node_modules/**/*",
      "pnpm-lock.yaml",
      "*.tsbuildinfo"
    ],
  },
  
  ...compat.extends("next/core-web-vitals"),
  // You can add more extends, plugins, rules, or overrides here, e.g.:
  // ...compat.extends("./.eslintrc.custom.json"),
];

export default eslintConfig;
