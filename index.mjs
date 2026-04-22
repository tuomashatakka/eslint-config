import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import noInlineMultilineTypesPlugin from './plugins/no-inline-types/index.mjs'
import whitespacedPlugin from './plugins/whitespaced/index.mjs'
import omitPlugin from './plugins/omit/index.mjs'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactStrictPlugin from './plugins/react-strict/index.mjs'
import { rules } from './rules.mjs'


const plugins = {
  'react':              react,
  'react-hooks':        reactHooks,
  'import':             importPlugin,
  '@stylistic':         stylistic,
  '@typescript-eslint': tseslint.plugin,
  'omit':               omitPlugin,
  'no-inline-types':    noInlineMultilineTypesPlugin,
  'whitespaced':        whitespacedPlugin,
  'react-strict':       reactStrictPlugin,
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


export default config
