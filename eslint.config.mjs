/* eslint-disable multiline-comment-style */
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tsplugin from '@typescript-eslint/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'

import rules from './rules.mjs'


const ignores = [
  '**/*.js',
]

/**
 * @type {import('typescript-eslint').Config}
 * */
const config = tseslint.config(
  {
    ...eslint.configs.recommended,
    ignores,
  },
  {
    plugins: {
      '@stylistic': stylistic,
      'react': react,
      'import': importPlugin,
      '@typescript-eslint': tsplugin
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
)

export default config
