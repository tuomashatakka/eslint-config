import tseslint from 'typescript-eslint'

import config from './eslint.config.mjs'


const configType = tseslint.configs.base

/**
 * @name config
 * @type {typeof configType}
 */
export default config

export {
  config,
  configType
}
