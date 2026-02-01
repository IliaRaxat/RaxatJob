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
      // FSD Layer Import Rules
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "../app/*", "../../app/*"],
              message: "Importing from 'app' layer is not allowed. The app layer is the top-most layer.",
            },
            {
              group: ["@/processes/*", "../processes/*", "../../processes/*"],
              message: "Importing from 'processes' layer may violate FSD hierarchy. Check if this import is allowed.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "fsd-shared-layer-rules",
    files: ["src/shared/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/processes/*",
                "@/pages/*",
                "@/widgets/*",
                "@/features/*",
                "@/entities/*",
                "../app/*",
                "../processes/*",
                "../pages/*",
                "../widgets/*",
                "../features/*",
                "../entities/*",
              ],
              message: "Shared layer cannot import from any other FSD layer. Only external libraries are allowed.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "fsd-entities-layer-rules",
    files: ["src/entities/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/processes/*",
                "@/pages/*",
                "@/widgets/*",
                "@/features/*",
                "../app/*",
                "../processes/*",
                "../pages/*",
                "../widgets/*",
                "../features/*",
              ],
              message: "Entities layer can only import from 'shared' layer.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "fsd-features-layer-rules",
    files: ["src/features/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/processes/*",
                "@/pages/*",
                "@/widgets/*",
                "../app/*",
                "../processes/*",
                "../pages/*",
                "../widgets/*",
              ],
              message: "Features layer can only import from 'entities' and 'shared' layers.",
            },
            {
              group: ["@/features/*", "../features/*"],
              message: "Features cannot import from other features. Features must be independent.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "fsd-widgets-layer-rules",
    files: ["src/widgets/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/processes/*",
                "@/pages/*",
                "../app/*",
                "../processes/*",
                "../pages/*",
              ],
              message: "Widgets layer can only import from 'features', 'entities', and 'shared' layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "fsd-pages-layer-rules",
    files: ["src/pages/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/processes/*",
                "../app/*",
                "../processes/*",
              ],
              message: "Pages layer can only import from 'widgets', 'features', 'entities', and 'shared' layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "fsd-public-api-rules",
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: [
                "@/entities/*/ui/*",
                "@/entities/*/api/*",
                "@/entities/*/model/*",
                "@/entities/*/lib/*",
                "@/features/*/ui/*",
                "@/features/*/api/*",
                "@/features/*/model/*",
                "@/features/*/lib/*",
                "@/widgets/*/ui/*",
                "@/widgets/*/model/*",
                "@/widgets/*/lib/*",
              ],
              message: "Import from slice's public API (index.ts) instead of internal segments. Use '@/layer/slice-name' instead of '@/layer/slice-name/segment/*'.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
