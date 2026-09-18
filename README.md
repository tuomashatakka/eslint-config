# @tuomashatakka/eslint-config

Opinionated ESLint flat config for TypeScript, React, JSX and CSS projects. Bundles six in-house plugins (`whitespaced`, `omit`, `no-inline-types`, `react-strict`, `ordered`, `css-strict`) on top of `@eslint-react`, `@stylistic`, `typescript-eslint`, `eslint-plugin-unicorn` and `@eslint/css`.

Requires ESLint 10.4+ and Node 22+.

## Installation

```bash
npm install --save-dev @tuomashatakka/eslint-config
```

## Usage

Create `eslint.config.mjs` in your project root.

### Use the full config

Lints `**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` and `**/*.css`.

```js
import config from '@tuomashatakka/eslint-config'

export default config
```

### Extend or override

```js
import { defineConfig } from 'eslint/config'
import { baseConfig, cssConfig, rules } from '@tuomashatakka/eslint-config'

export default defineConfig([
  baseConfig,
  cssConfig,
  {
    files: [ '**/*.{ts,tsx}' ],
    rules: {
      ...rules,
      'no-console': 'off',
    },
  },
  {
    files:           [ '**/*.css' ],
    languageOptions: { tolerant: true }, // e.g. Tailwind / PostCSS at-rules
    rules:           { 'css/no-invalid-at-rules': 'off' },
  },
])
```

### Use only the rules

```js
import { rules, cssRules } from '@tuomashatakka/eslint-config'

export default [{ rules }]
```

### Use a single plugin

```js
import ordered from '@tuomashatakka/eslint-config/plugins/ordered'

export default [{ plugins: { ordered }, rules: { 'ordered/top-level-definitions': 'warn' } }]
```

## Exports

| Export | Type | Description |
| --- | --- | --- |
| `config` (default) | `Linter.Config[]` | typescript-eslint recommended (script files only), `baseConfig`, `cssConfig`. |
| `baseConfig` | `Linter.Config` | Plugins, language options and `rules` for JS/TS files. |
| `cssConfig` | `Linter.Config` | `css/css` language, CSS plugins and `cssRules` for `.css` files. |
| `rules` | `Linter.RulesRecord` | Rule map for JS/TS files. |
| `cssRules` | `Linter.RulesRecord` | Rule map for CSS files. |
| `./rules` | | `rules` (default) and `cssRules`. |
| `./plugins/*` | `ESLint.Plugin` | Each local plugin, e.g. `./plugins/css-strict`. |

Type declarations ship as `.d.mts` next to each entry and are wired through the `exports` map.

## Rules configuration

Override any rule the same way you would override a standard ESLint rule.

### `ordered/top-level-definitions`

Enforces the order of top-level module definitions: constants, then type definitions (`type`, `interface`), then classes, then functions. `export`/`export default` wrappers are looked through, `const fn = () => {}` counts as a function, `const Foo = class {}` as a class and `enum` as a constant. Statements that are none of these (side effects, re-exports) are ignored. Not auto-fixable.

| Option | Type | Default | Effect |
| --- | --- | --- | --- |
| `order` | `('constant' \| 'type' \| 'class' \| 'function')[]` | `['constant', 'type', 'class', 'function']` | Group order. |
| `respectDependencies` | boolean | `true` | Exempt constants whose initializer eagerly references a class or function-valued binding (`const store = new Store()`, `const run = compose(fn)`). Moving those above their dependency would throw a TDZ error at module evaluation. |

### `css-strict/*`

Formatting and structure rules for CSS files, mirroring the JS conventions (`padded-blocks`, `padding-line-between-statements`, `space-before-blocks`, `key-spacing`, `indent`, `eol-last`).

| Rule | Fixable | Description |
| --- | --- | --- |
| `css-strict/block-padding` | yes | Exactly `rootPadding` blank lines between top-level blocks and `nestedPadding` between nested rules; 0 to `nestedPadding` between consecutive declarations; no blank lines at block edges, file start, or after the final newline. Every rule and declaration starts on its own line, closing braces too. |
| `css-strict/block-spacing` | yes | Exactly one space before `{`. |
| `css-strict/declaration-spacing` | yes | No space before and exactly one space after `:` (multi-line values allowed). |
| `css-strict/indent` | yes | `size` spaces per nesting level for rules, at-rules, declarations, continuation selectors and closing braces. |
| `css-strict/prefer-nesting` | no | A top-level rule whose selector extends another top-level rule's selector (`.card:hover`, `.card .title`, `.card > .body`) must be nested inside that rule (`&:hover`, `.title`, `> .body`). A top-level `@media`/`@container`/`@supports`/`@starting-style` that only styles one rule must be nested inside it. |

| Rule | Option | Type | Default |
| --- | --- | --- | --- |
| `block-padding` | `rootPadding` | integer | `2` |
| `block-padding` | `nestedPadding` | integer | `1` |
| `block-padding` | `indent` | integer | `2` (indentation written by fixes) |
| `indent` | `size` | integer | `2` |
| `prefer-nesting` | `ignore` | string[] | `[':root', 'html', 'body', '*']` (never treated as parents) |
| `prefer-nesting` | `atRules` | boolean | `true` |

`cssConfig` also enables `@eslint/css` validity rules as errors (`no-invalid-*`, `no-duplicate-*`, `no-unmatchable-selectors`), `use-baseline` (`available: 'newly'`), `prefer-logical-properties`, `relative-font-units`, `selector-complexity`, `font-family-fallbacks`, `no-important`, and unicorn's CSS rules (`prefer-media-feature-range-syntax`, `no-deprecated-css-features`, `no-redundant-nested-style-rules`, `no-nesting-with-mixed-specificity`, `no-unscoped-css-nesting-selector`, `no-duplicate-css-selectors`, `no-transition-all`, and more) as warnings.

### `whitespaced/aligned-assignments`

Vertically aligns `=` in adjacent declaration and member-assignment blocks.

| Option | Type | Default | Effect |
| --- | --- | --- | --- |
| `blockSize` | integer | `2` | Minimum number of adjacent assignments before alignment applies. |
| `ignoreAdjacent` | boolean | `true` | Only align rows on consecutive lines. |
| `ignoreIfAssignmentsNotInBlock` | boolean | `true` | Split a group at every declaration-kind transition (`const` → `let`). Member assignments are wildcards and join any sub-block. |
| `alignTypes` | boolean | `false` | Also align type-annotation colons. |
| `ignoreTypesMismatch` | boolean | `true` | Skip colon alignment when only some rows have type annotations. |
| `alignMemberAssignments` | boolean | `true` | Include `obj.prop = …` lines in alignment blocks alongside `const`/`let`/`var`. |

### `omit/omit-unnecessary-parens-brackets`

Removes unnecessary parentheses, brackets, and braces. No options.

### `no-inline-types/no-inline-multiline-types`

Disallows inline multi-line `TSTypeLiteral` annotations; requires extraction to a named `type` or `interface`. No options.

### `react-strict/*`

| Rule | Description |
| --- | --- |
| `react-strict/jsx-prop-layout` | Enforces JSX prop ordering: `key`/`ref`, then `className`/`style`, then `data-`/`aria-`, then regular props, callbacks last. |
| `react-strict/no-complex-jsx-map` | Disallows complex `.map()` callbacks with inline logic inside JSX. |
| `react-strict/no-jsx-value-calculations` | Disallows value calculations and assignments inside JSX return blocks. |
| `react-strict/no-nested-divs` | Disallows nested `<div>` elements in favor of semantic HTML5 tags. |
| `react-strict/no-style-prop` | Disallows the inline `style` prop except in drag/drop interactions. |
| `react-strict/prefer-no-use-effect` | Discourages `useEffect` in favor of context, custom hooks, or event-driven patterns. |

### `unicorn/*`

The JS rule map enables `new-for-builtins` (replaces core `no-new-native-nonconstructor`), `no-new-array`, `prefer-number-properties`, `no-zero-fractions`, `empty-brace-spaces` and `consistent-class-member-order` (replaces the former `whitespaced/class-property-grouping`).

## Package structure

- `index.mjs` — exports `config` (default), `baseConfig`, `cssConfig`, `rules`, `cssRules`.
- `rules.mjs` — the rule maps.
- `plugins/` — local plugin sources, each with an `index.d.mts`.
- `test/` — fixtures (`*.valid.*` must lint clean, `*.invalid.*` list expected warnings), runner and type assertions.

## Scripts

```bash
npm run lint        # lint the config itself
npm run test        # run all fixture tests, then typecheck the declarations
npm run test:format # run --fix over the fixtures and report leftovers
npm run typecheck   # tsc over the .d.mts files and test/types.test.mts
```

## License

ISC
