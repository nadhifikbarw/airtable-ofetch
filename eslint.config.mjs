// @ts-check

import unjs from "eslint-config-unjs";
import prettierEslint from "eslint-config-prettier";

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
  prettierEslint,
];
