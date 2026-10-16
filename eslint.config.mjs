import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Design-system guard: app code must use theme tokens (bg-primary, text-easy, text-muted-foreground…),
// never raw palette colours or hard-coded colour values. See docs/design.md.
const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white";
const RAW_COLOR = `(^|\\s|:)(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|shadow|accent|caret)-(${PALETTE})(-\\d{2,3})?(\\/\\d+)?(\\s|$)|-\\[(#|rgb|hsl|oklch)|#[0-9a-fA-F]{3,8}\\b|oklch\\(`;
const rawColorMessage =
  "Use a theme token (e.g. bg-primary, text-easy, text-muted-foreground) instead of a raw colour. See docs/design.md.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**", "src/components/eldoraui/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=/${RAW_COLOR}/]`, message: rawColorMessage },
        { selector: `TemplateElement[value.raw=/${RAW_COLOR}/]`, message: rawColorMessage },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
