import { defineConfig } from 'eslint/config'
import css from '@eslint/css'
import stylistic from '@stylistic/eslint-plugin'
import eslintReact from '@eslint-react/eslint-plugin'
import importPlugin from 'eslint-plugin-import-x'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import noInlineMultilineTypesPlugin from './plugins/no-inline-types/index.mjs'
import whitespacedPlugin from './plugins/whitespaced/index.mjs'
import omitPlugin from './plugins/omit/index.mjs'
import reactStrictPlugin from './plugins/react-strict/index.mjs'
import orderedPlugin from './plugins/ordered/index.mjs'
import cssStrictPlugin from './plugins/css-strict/index.mjs'
import { rules, cssRules } from './rules.mjs'


const scriptFiles = [ '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}' ]

const plugins = {
  '@eslint-react':      eslintReact,
  'import':             importPlugin,
  '@stylistic':         stylistic,
  '@typescript-eslint': tseslint.plugin,
  'unicorn':            unicorn,
  'omit':               omitPlugin,
  'no-inline-types':    noInlineMultilineTypesPlugin,
  'whitespaced':        whitespacedPlugin,
  'react-strict':       reactStrictPlugin,
  'ordered':            orderedPlugin,
}

const cssPlugins = {
  'css':        css,
  'unicorn':    unicorn,
  'css-strict': cssStrictPlugin,
}


export { rules, cssRules }

/**
 * Flat config object for JavaScript and TypeScript files
 * @type {import('eslint').Linter.Config}
 */
export const baseConfig = {
  name:            '@tuomashatakka/eslint-config/base',
  files:           scriptFiles,
  languageOptions: {
    sourceType:    'module',
    ecmaVersion:   'latest',
    parserOptions: { ecmaFeatures: { jsx: true }},
    globals:       { ...globals.browser, ...globals.node },
  },
  settings: {
    'import/internal-regex': '^@/(.+)',
  },
  ignores: [ '**/node_modules/**' ],
  plugins,
  rules,
}

/**
 * Flat config object for CSS files, linted with the `css/css` language from @eslint/css
 * @type {import('eslint').Linter.Config}
 */
export const cssConfig = {
  name:     '@tuomashatakka/eslint-config/css',
  files:    [ '**/*.css' ],
  language: 'css/css',
  plugins:  cssPlugins,
  rules:    cssRules,
}

/**
 * Full config: typescript-eslint recommended (scoped to script files), `baseConfig` and `cssConfig`
 * @type {import('eslint').Linter.Config[]}
 */
export const config = defineConfig([
  {
    name:    '@tuomashatakka/eslint-config/typescript',
    files:   scriptFiles,
    extends: [ tseslint.configs.recommended ],
  },
  baseConfig,
  cssConfig,
])


export default config
