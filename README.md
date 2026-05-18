# @tuomashatakka/eslint-config

Opinionated ESLint flat config for TypeScript, React, and JSX projects. Bundles four in-house plugins (`whitespaced`, `omit`, `no-inline-types`, `react-strict`) on top of `@stylistic`, `typescript-eslint`, and `eslint-plugin-react`.

Requires ESLint 9.13+.

## Installation

```bash
npm install --save-dev @tuomashatakka/eslint-config
```

## Usage

Create `eslint.config.mjs` in your project root.

### Use the full config

```js
import config from '@tuomashatakka/eslint-config'

export default config
```

### Extend or override

```js
import { baseConfig, rules } from '@tuomashatakka/eslint-config'

export default [
  ...baseConfig,
  {
    rules: {
      ...rules,
      'no-console': 'off',
    },
  },
]
```

### Use only the rules

```js
import { rules } from '@tuomashatakka/eslint-config'

export default [{ rules }]
```

## Rules configuration

The config bundles four local plugins. Override any rule the same way you would override a standard ESLint rule.

### `whitespaced/*`

| Rule | Description |
| --- | --- |
| `whitespaced/aligned-assignments` | Vertically aligns `=` in adjacent declaration and member-assignment blocks. |
| `whitespaced/block-padding` | Enforces blank-line padding inside blocks, with docstring exceptions. |
| `whitespaced/class-property-grouping` | Groups class properties by visibility and kind. |
| `whitespaced/consistent-line-spacing` | Enforces consistent blank lines before and after statements. |
| `whitespaced/multiline-format` | Enforces consistent formatting for multiline objects and arrays. |

Options for `whitespaced/aligned-assignments`:

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

## Package structure

- `index.mjs` — exports `config` (default), `baseConfig`, and `rules`.
- `rules.mjs` — the rule map.
- `plugins/` — local plugin sources.
- `test/` — fixtures and runner.

## Scripts

```bash
npm run lint        # lint the config itself
npm run test        # run all fixture tests
npm run test:format # run formatting-only fixtures
```

## License

ISC
