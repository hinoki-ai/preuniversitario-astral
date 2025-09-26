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
      "react/no-unknown-property": "off",
      "react/no-inline-styles": "off",
      "@next/next/no-css-tags": "off",
      "@next/next/no-sync-scripts": "off",
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
    },
  },
  {
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      "react/no-inline-styles": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "react/style-prop-object": "off",
      "react/no-inline-styles": "off",
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