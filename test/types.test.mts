/**
 * Compile-time assertions for the package's public types.
 * Imports go through the package name so the `exports` map and its `types` conditions are exercised.
 */
import type { ESLint, Linter } from 'eslint'
import config, { baseConfig, cssConfig, cssRules, rules } from '@tuomashatakka/eslint-config'
import ruleMap from '@tuomashatakka/eslint-config/rules'
import ordered from '@tuomashatakka/eslint-config/plugins/ordered'
import cssStrict, { rules as cssStrictRules } from '@tuomashatakka/eslint-config/plugins/css-strict'
import whitespaced from '@tuomashatakka/eslint-config/plugins/whitespaced'


export const full: Linter.Config[]          = config
export const base: Linter.Config            = baseConfig
export const css: Linter.Config             = cssConfig
export const scriptRules: Linter.RulesRecord = rules
export const styleRules: Linter.RulesRecord  = cssRules
export const defaultRules: Linter.RulesRecord = ruleMap
export const plugins: ESLint.Plugin[]        = [ ordered, cssStrict, whitespaced ]
export const cssStrictRuleNames: string[]    = Object.keys(cssStrictRules)
