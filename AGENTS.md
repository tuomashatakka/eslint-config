# AGENTS.md

## Commands

```bash
npm run lint        # lint the config itself
npm run test        # fixture tests, then `npm run typecheck`
npm run test:format # test formatting rules only
npm run typecheck   # tsc over *.d.mts + test/types.test.mts
```

## Key Facts

- **ESLint 10 flat config** (not legacy .eslintrc). Main entry: `index.mjs` exports `config` (via `defineConfig`), `baseConfig`, `cssConfig`, `rules`, `cssRules`
- **ESLint 10**: `context.getSourceCode()` removed — use `context.sourceCode` in custom rules
- **Types**: hand-written `index.d.mts`, `rules.d.mts`, `plugins/*/index.d.mts`; wired via `package.json#exports` (`.`, `./rules`, `./plugins/*`). `test/types.test.mts` imports through the package name so the exports map is exercised
- **Custom test runners**: `test/test-runner.mjs` and `test/format-cases.mjs` - not jest/vitest. Fixtures: `*.valid.*` must be warning-free, `*.invalid.*` list `expect-warning: <rule>` comments (`//` or `/* */`). `.css` fixtures are supported
- **Local plugins** in `plugins/`:
  - `no-inline-types/` - prevents inline multiline type annotations
  - `whitespaced/` - whitespace formatting rules (only `aligned-assignments` is registered; other files in `rules/` are dormant)
  - `omit/` - omit rules
  - `react-strict/` - strict React rules
  - `ordered/` - `top-level-definitions`: constants → types → classes → functions at module top level; constants that eagerly depend on a class/function-valued binding are exempt (TDZ)
  - `css-strict/` - CSS formatting (`block-padding`, `block-spacing`, `declaration-spacing`, `indent`) and `prefer-nesting`, built on the `@eslint/css` css-tree AST. Shared helpers in `plugins/css-strict/utils.mjs`; comments are **not** in the AST, use `sourceCode.comments`
- **CSS linting**: `cssConfig` uses `language: 'css/css'`, `@eslint/css` rules, unicorn's CSS rules (`meta.languages: ['css/css']`) and `css-strict`. Strict parsing by default (`tolerant` off)
- **The config lints itself** (`npm run lint` over `plugins/`), so new plugin code must satisfy `ordered/top-level-definitions` etc.

## CI / Publish

- CI: `.github/workflows/ci.yml` - runs on Node 22, 24 (unicorn requires Node >=22)
- Publish: `.github/workflows/publish.yml` - triggers on `v*` tags (`npm version <bump>` then `git push --follow-tags`), publishes to GitHub Packages

## Dependencies

- Peer deps: `eslint >=10.0.0`, `react`, `typescript`
- Replaced `eslint-plugin-react` + `eslint-plugin-react-hooks` with `@eslint-react/eslint-plugin`
- `eslint-plugin-unicorn`: `new-for-builtins` replaces core `no-new-native-nonconstructor`; `consistent-class-member-order` replaces the removed `whitespaced/class-property-grouping`
- `@eslint/css` provides the `css/css` language and the `css/*` rules