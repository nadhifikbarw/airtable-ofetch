// @ts-check

import unjs from "eslint-config-unjs";
import vitestEslint from "@vitest/eslint-plugin";
import prettierEslint from "eslint-config-prettier";

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...unjs({
    ignores: [],
    rules: {
      "unicorn/no-null": 0,
      "unicorn/no-object-as-default-parameter": 0,
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports",
          prefer: "type-imports",
        },
      ],
    },
  }),
  {
    files: ["tests/**"],
    ...vitestEslint.configs.recommended,
  },
  prettierEslint,
];
