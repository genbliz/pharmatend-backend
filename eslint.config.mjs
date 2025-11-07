// @ts-check

import eslint from "@eslint/js";
// import jestPlugin from "eslint-plugin-jest";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  {
    ignores: ["build", "dist", "dist-func", "cdk.out", ".logs"],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    files: [
      //
      "./src/**/*.{ts,js,cjs,cts,mts,mjs,tsx,jsx}",
      "./cdk/**/*.{ts,js,cjs,cts,mts,mjs,tsx,jsx}",
    ],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      // jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        projectService: true,
        project: "./tsconfig-dev.json",
      },
    },
    rules: {
      "brace-style": [2, "1tbs"],
      strict: 1,
      quotes: 0,
      "no-console": 0,
      "no-undef": 0,
      "no-unused-vars": 0,
      "no-use-before-define": 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/interface-name-prefix": 0,
      "@typescript-eslint/camelcase": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-unused-vars": 0,
      "no-useless-escape": 0,
      "@typescript-eslint/no-inferrable-types": 0,
      "@typescript-eslint/no-use-before-define": 0,
      "@typescript-eslint/no-var-requires": 0,
      "@typescript-eslint/unbound-method": 0,
      "prettier/prettier": 0,
      "@typescript-eslint/ban-ts-ignore": 0,
      "@typescript-eslint/no-unsafe-assignment": 0,
      "@typescript-eslint/no-unsafe-member-access": 0,
      "@typescript-eslint/no-unsafe-call": 0,
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/no-floating-promises": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "@typescript-eslint/no-unsafe-return": 0,
      "@typescript-eslint/restrict-template-expressions": 0,
      camelcase: 0,
      "spaced-comment": 0,
      "prefer-regex-literals": 0,
      "@typescript-eslint/no-empty-interface": 0,
      "node/handle-callback-err": 0,
      "dot-notation": 0,
      "prefer-promise-reject-errors": 0,
      "@typescript-eslint/no-unsafe-argument": 0,
      "no-redeclare": 0,
      "no-shadow": 0,
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/ban-types": 0,
      "@typescript-eslint/prefer-promise-reject-errors": 0,
      "@typescript-eslint/no-empty-object-type": 0,
      "@typescript-eslint/no-duplicate-type-constituents": 0,
      "@typescript-eslint/no-unused-expressions": 0,
    },
  },
  // {
  //   files: ["**/*.js"],
  //   extends: [tseslint.configs.disableTypeChecked],
  // },
  eslintConfigPrettier,
  // {
  //   files: ["test/**"],
  //   extends: [jestPlugin.configs["flat/recommended"]],
  // },
);
