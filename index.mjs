import globals from 'globals'
import tseslint from 'typescript-eslint'

import config from './eslint.config.mjs'


const configType = tseslint.configs.base

/**
 * @name config
 * @type {typeof configType}
 */
export default [
  ...config,
  {
    files:           [ '**/*.{js,jsx,mjs,cjs,ts,tsx}' ],
    languageOptions: {
      ecmaVersion:   'latest',
      sourceType:    'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    }
  }]

export {
  config,
  configType
}
