import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-plugin-prettier';
import stylisticTs from '@stylistic/eslint-plugin-ts';
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
  ...compat.extends(),
  {
    plugins: {
      unicorn,
      prettier,
      '@stylistic/ts': stylisticTs,
    },
  },
  ...compat.extends('eslint:recommended').map(config => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    rules: {
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',

          overrides: {
            accessors: 'explicit',
            constructors: 'explicit',
            methods: 'explicit',
            properties: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            'public-static-method',
            'protected-static-method',
            'private-static-method',
            'public-constructor',
            'protected-constructor',
            'private-constructor',
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
          ],
        },
      ],

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],

          custom: {
            regex: '^I[A-Z]',
            match: true,
          },

          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],

          custom: {
            regex: '^T[A-Z]',
            match: true,
          },

          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'variable',
          format: ['strictCamelCase', 'StrictPascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'enum',
          format: ['UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
      '@typescript-eslint/no-empty-object-type': '0',
      '@stylistic/ts/semi': ['error', 'always'],
      '@stylistic/ts/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },

          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-else-return': 'error',
      'unicorn/new-for-builtins': 'error',
      'unicorn/prefer-switch': 'error',
      'unicorn/string-content': 'error',
      'unicorn/filename-case': 'error',
      'prettier/prettier': 'error',
      curly: 'error',

      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'no-debugger': 'error',
    },
  },
  ...compat
    .extends('plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended')
    .map(config => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx'],
    })),
  {
    files: ['**/*.ts', '**/*.tsx'],

    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
        },
      ],
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      curly: 'error',
    },
  },
  ...compat.extends().map(config => ({
    ...config,
    files: ['**/*.spec.ts', '**/*.spec.tsx'],
  })),
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx'],

    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      'prefer-const': 'off',
    },
  },
  ...compat.extends().map(config => ({
    ...config,
    files: ['**/*.js', '**/*.jsx'],
  })),
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
];
