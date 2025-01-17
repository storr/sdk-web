import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import noOnlyTests from "eslint-plugin-no-only-tests";
import prettier from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist", "**/*.generated", "**/*.generated.*"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      import: importPlugin,
      "no-only-tests": noOnlyTests,
      unicorn,
    },
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.node.json"],
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      curly: ["error", "all"],
      eqeqeq: "error",
      "no-console": "error",
      "no-lonely-if": "error",
      "no-param-reassign": "error",
      "no-plusplus": "error",
      "no-template-curly-in-string": "error",
      "prefer-spread": "error",
      "prefer-arrow-callback": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],

      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
          ],
        },
      ],

      "no-only-tests/no-only-tests": [
        "error",
        {
          block: ["describe", "test", "it", "assert", "integrationTest"],
        },
      ],

      "react/jsx-no-target-blank": "off",
      "react/prop-types": "off",
      "unicorn/explicit-length-check": "error",
      "unicorn/no-lonely-if": "error",
      "unicorn/no-typeof-undefined": "error",
      "unicorn/no-unnecessary-await": "error",
      "unicorn/no-useless-fallback-in-spread": "error",
      "unicorn/no-useless-length-check": "error",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/no-useless-switch-case": "error",
      "unicorn/prefer-default-parameters": "error",
      "unicorn/prefer-export-from": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-spread": "error",
      "unicorn/prefer-type-error": "error",
      "unicorn/throw-new-error": "error",
      "unicorn/consistent-destructuring": "error",
    },
  },
  {
    files: ["playground/**"],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    ...reactHooks.configs.recommended,
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": ["error"],
    },
  },
  {
    files: ["src/**"],
    rules: {
      "import/extensions": ["error", "always"],
    },
  },
);
