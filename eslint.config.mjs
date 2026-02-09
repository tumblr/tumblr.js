import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
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
      // Disabled because the code uses throw/catch for control flow validation, not error handling
      'preserve-caught-error': 'off',
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
