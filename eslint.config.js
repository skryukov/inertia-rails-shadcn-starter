import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["app/frontend/**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {ignores: ["app/frontend/routes/*", "app/frontend/components/ui/**/*"]},
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      globals: {...globals.browser, ...globals.node},
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  prettierConfig,
  {
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.js'],
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    }
  }
];
