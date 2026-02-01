import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    name: "fsd-architecture-rules",
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      // FSD Layer Import Rules disabled for now
      "no-restricted-imports": "off",
    },
  },
  {
    name: "fsd-shared-layer-rules",
    files: ["src/shared/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    name: "fsd-entities-layer-rules",
    files: ["src/entities/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    name: "fsd-features-layer-rules",
    files: ["src/features/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    name: "fsd-widgets-layer-rules",
    files: ["src/widgets/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    name: "fsd-pages-layer-rules",
    files: ["src/pages/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    name: "fsd-public-api-rules",
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    name: "component-rules",
    files: ["src/app/Components/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    name: "test-pages-rules",
    files: ["src/app/test-*/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    name: "shared-rules",
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "warn",
    },
  },
  {
    name: "entities-rules",
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    name: "app-pages-rules",
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  {
    name: "analytics-page-rules",
    files: ["src/app/admin/analytics/page.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  {
    name: "auth-error-handler-rules",
    files: ["src/shared/lib/authErrorHandler.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
