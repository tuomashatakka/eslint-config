import stylistic from '@stylistic/eslint-plugin'
import tsplugin from '@typescript-eslint/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import noInlineMultilineTypesPlugin from 'eslint-plugin-no-inline-multiline-types'
import whitespacedPlugin from 'eslint-plugin-whitespaced'
import omitPlugin from 'eslint-plugin-omit-unnecessary'
import react from 'eslint-plugin-react'
import tailwindCssPlugin from 'eslint-plugin-tailwindcss'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { rules } from './rules.mjs'


const plugins = {
  'react':              react,
  'import':             importPlugin,
  '@stylistic':         stylistic,
  '@typescript-eslint': tsplugin,
  'tailwindcss':        tailwindCssPlugin,
  'omit':               omitPlugin,
  'no-inline-types':    noInlineMultilineTypesPlugin,
  'whitespaced':        whitespacedPlugin,
}

export { rules }

export const baseConfig = {
  files:           [ '**/*.{js,jsx,mjs,cjs,ts,tsx}' ],
  languageOptions: {
    sourceType:    'module',
    ecmaVersion:   'latest',
    parserOptions: { ecmaFeatures: { jsx: true }},
    globals:       { ...globals.browser, ...globals.node },
  },
  settings: {
    'react':                 { version: 'detect' },
    'import/internal-regex': '^@/(.+)',
  },
  ignores: [ '**/node_modules/**' ],
  plugins,
  rules,
}


/**
 * @type {tseslint.configs.base}
 */
export const config = tseslint.config(
  ...tseslint.configs.recommended,
  baseConfig)


/**
 * @summary ESLint configuration
 * @description Opinionated yet functional AF base config for ESLint
 */
export default config
