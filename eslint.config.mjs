import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin';
import tsplugin from '@typescript-eslint/eslint-plugin';
import eslintPluginBlockPadding from 'eslint-plugin-block-padding';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint'

import { rules } from './rules.js'



const ignores = [
  '**/*.js',
];

export default tseslint.config(
  {
    ...eslint.configs.recommended,
    ignores,
  },
  { plugins: {
      '@stylistic': stylistic,
      'react': react,
      'import': importPlugin,
      '@typescript-eslint': tsplugin,
      'block-padding': eslintPluginBlockPadding,
  },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,

    settings: {
      react: {
        version: 'detect',
      },
    },
    ignores,

    rules: {
      ...config.rules,
      ...rules
    },
  })),
);
