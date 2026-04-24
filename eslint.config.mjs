import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat';

export default [
  js.configs.recommended,
  prettierConfig,
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
