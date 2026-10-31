/**
 * Entry point. The TypeScript compatibility hook must be registered before typescript-eslint and the other
 * TypeScript-aware plugins are resolved, so the config itself is loaded with a dynamic import.
 * See `typescript-compat.mjs`.
 */
import { registerTypescriptCompat } from './typescript-compat.mjs'


registerTypescriptCompat()

const { config, baseConfig, cssConfig, rules, cssRules } = await import('./config.mjs')

export { config, baseConfig, cssConfig, rules, cssRules }
export default config
