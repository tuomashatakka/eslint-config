import type { Linter } from 'eslint'

/** Rule map applied to JavaScript and TypeScript files */
export declare const rules: Linter.RulesRecord

/** Rule map applied to CSS files (`css/css` language) */
export declare const cssRules: Linter.RulesRecord

/** Flat config object for JavaScript and TypeScript files: plugins, language options and `rules` */
export declare const baseConfig: Linter.Config

/** Flat config object for CSS files using the `css/css` language from `@eslint/css` */
export declare const cssConfig: Linter.Config

/** Full config: typescript-eslint recommended (scoped to script files), `baseConfig` and `cssConfig` */
export declare const config: Linter.Config[]

export default config
