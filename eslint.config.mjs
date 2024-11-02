/* eslint-disable multiline-comment-style */
import stylistic from '@stylistic/eslint-plugin'
import tsplugin from '@typescript-eslint/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import rules from './rules.mjs'


const plugins = {
  'react':              react,
  'import':             importPlugin,
  '@stylistic':         stylistic,
  '@typescript-eslint': tsplugin,
}

/**
 * @type {tseslint.configs.base}
 **/
const config = tseslint.config(
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    },
    settings: {
      'import/internal-regex': '^@/(.+)',
      'import/resolver':       {
        node: {
          extensions: [ '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs' ],
        },
      },
      'react': {
        version: 'detect',
      },
    },
    plugins,
    rules,
  }
)

/**
 * @summary ESLint configuration
 * @description Opinionated yet functional AF base config for ESLint
 * @author {@author}
 * @version {@version}
 **/
export default config
