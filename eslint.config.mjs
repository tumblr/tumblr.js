import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('eslint:recommended', 'prettier'),
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },

    rules: {
      'no-console': 'error',
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    files: ['lib/**/*.ts'],

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      'no-console': 'error',

      // This TypeScript file only contains types which confuses unused vars.
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['test/**/*', 'integration/**/*'],

    languageOptions: {
      globals: {
        ...globals.mocha,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'no-console': 'off',
    },
  },
];
