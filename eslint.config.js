import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-css-in-js": "off",
    },
  },
  {
    files: ["components/ui/chart.tsx"],
    rules: {
      "react/style-prop-object": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["components/ui/*.tsx"],
    rules: {
      "react/style-prop-object": "off",
      "@next/next/no-css-in-js": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "convex/_generated/**",
      "out/**",
      ".vercel/**",
      "dist/**",
      "build/**",
      "energy-orb*.html",
    ],
  },
];

export default eslintConfig;