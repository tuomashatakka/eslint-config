# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Repository Overview

`@tuomashatakka/eslint-config` (v2.6.2) is a published npm package that provides an opinionated ESLint flat config for TypeScript/React/Next.js projects. It is a **configuration-only package** — no runtime code, just ESLint rules and plugin wiring.

## File Structure

```
eslint-config/
├── index.mjs                        # Main entry point — assembles and exports config
├── rules.mjs                        # All ESLint rules, organized by category
├── eslint.config.mjs                # Self-lint config (re-exports from index.mjs)
├── eslint-plugin-import-module.d.ts # Type declaration stub for eslint-plugin-import
├── package.json                     # Package metadata, deps, scripts
├── bun.lock                         # Bun lockfile (primary)
├── package-lock.json                # npm lockfile (also committed)
├── .gitignore
├── .vscode/
│   └── settings.json                # editor.tabSize: 2
└── test/
    ├── test-runner.mjs              # Validates config loads and lints fixtures without errors
    ├── format-cases.mjs             # Validates --fix formatting behavior on fixtures
    └── fixtures/
        ├── basic-javascript.js
        ├── edge-cases.js
        ├── complex-patterns.ts
        ├── react-component.tsx
        └── jsx-formatting.jsx
```

## Public API

Three named exports from `index.mjs`:

| Export | Type | Description |
|---|---|---|
| `default` / `config` | `tseslint.FlatConfig[]` | Full flat config (TypeScript-eslint recommended + baseConfig) |
| `baseConfig` | `FlatConfig` | Single config object with plugins, rules, languageOptions |
| `rules` | `RulesConfig` | Plain rules object, re-exported from `rules.mjs` |

Consumers use it like:

```js
// eslint.config.mjs
import config from '@tuomashatakka/eslint-config'
export default config
```

## Development Workflows

### Installing dependencies

```bash
npm install
# or
bun install
```

### Running tests

```bash
npm run test          # Lint fixtures, fail on any ESLint errors
npm run test:format   # Apply --fix to fixtures, report formatting changes
npm run lint          # Self-lint the config package itself
```

Both test runners use `ESLintConfigTester` / `FormatTester` classes in `test/`. They shell out to `npx eslint` with `--config index.mjs` and parse JSON output.

The `test:format` runner restores fixture file content after each run, so fixtures are never permanently mutated.

### Adding or changing rules

1. Edit `rules.mjs` — all rule entries live here.
2. Run `npm run test` to confirm no fixture files now produce ESLint errors.
3. Run `npm run lint` to confirm the config package itself still lints cleanly.
4. If the new rule affects formatting, run `npm run test:format` to verify behavior.

### Adding new fixtures

Drop a `.js`, `.ts`, `.jsx`, or `.tsx` file in `test/fixtures/`. Both test runners auto-discover all matching files. Fixtures should demonstrate valid (zero-error) code that conforms to the config.

## Key Conventions

### Code style (enforced by this package's own lint)

The package eats its own cooking — it is linted by `eslint.config.mjs` which re-exports the config it defines. Notable conventions that will be flagged:

- **No semicolons** (`@stylistic/semi: never`)
- **Single quotes** (`@stylistic/quotes: single`), template literals allowed anywhere
- **2-space indentation** (no tabs)
- **Stroustrup brace style** — `else` / `catch` on new lines after closing brace
- **Aligned object values** — `@stylistic/key-spacing` with `align: 'value'`
- **Spaces inside `{}` and `[]`** — `{ foo }`, `[ 1, 2 ]` (but not nested: `{[]}` stays tight)
- **Arrow parens only when needed** — `x => x` not `(x) => x`
- **No trailing spaces, no extra blank lines** (max 2), file must end with newline
- **Imports require 2 blank lines after** the import block
- **Multiline ternaries required** when the expression spans lines
- **Block padding never** — no blank lines inside `{}`
- **Chained calls** need newlines at depth > 2

### Plugin namespace

`@stylistic` in `rules.mjs` covers **both** `@stylistic/eslint-plugin` (JS/TS rules) and `@stylistic/eslint-plugin-jsx` (JSX rules). In `index.mjs` the two plugin rule sets are merged into a single `@stylistic` namespace key so all rules share the same prefix. Do not add a separate `@stylistic/jsx` key.

### TypeScript

The config wraps `tseslint.configs.recommended` via `tseslint.config(...)`. The following TS rules are explicitly disabled to avoid noise:

- `@typescript-eslint/no-implicit-any` — off
- `@typescript-eslint/no-unused-vars` — off (and `no-unused-vars` too)

### React

- `react/prefer-stateless-function` — error (class components disallowed)
- `react-hooks/exhaustive-deps` — off
- JSX formatting via `@stylistic/jsx-*` rules (not the `react/jsx-*` stylistic rules)

### Imports

- `import/no-unassigned-import` — error (side-effect imports only allowed for CSS/SCSS/LESS and `server-only`)
- `import/no-mutable-exports` — error
- `import/consistent-type-specifier-style` — warn, prefer top-level `import type`
- `import/order` — off (order is not enforced)
- Internal alias pattern: `^@/(.+)` (configured in `settings['import/internal-regex']`)

## Versioning

The package follows semver. Version bumps are committed directly to `main` (see git log pattern: version-only commits like `"2.6.2"`). There is no automated release tooling in the repo — publish manually via `npm publish`.

## Dependencies

- **Runtime deps** (`dependencies`): All ESLint plugins needed by consumers who install this package — they are not `peerDependencies` so they install automatically.
- **Peer deps** (`peerDependencies`): `eslint >=9.13.0`, `react *`, `typescript *` — consumer must provide these.
- **Dev deps** (`devDependencies`): Additional type packages and `eslint-plugin-block-padding` used only during development of this config.

The package requires **ESLint flat config format** (ESLint 9+). Legacy `.eslintrc` is not supported.
