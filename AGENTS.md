# AGENTS.md

## Commands

```bash
npm run lint        # lint the config itself
npm run test        # fixture tests, then `npm run typecheck`
npm run test:format # test formatting rules only
npm run typecheck   # tsc over *.d.mts + test/types.test.mts
```

## Key Facts

- **ESLint 10 flat config** (not legacy .eslintrc). Main entry: `index.mjs` registers the TS compat hook, then dynamically imports `config.mjs` and re-exports `config` (via `defineConfig`), `baseConfig`, `cssConfig`, `rules`, `cssRules`. New third-party imports go in `config.mjs`, never statically in `index.mjs`
- **TypeScript 7**: has no JS compiler API; typescript-eslint (`<6.1.0`) crashes on it. `typescript-compat.mjs` uses `module.registerHooks` (Node 22.15+) to redirect `typescript`/`typescript/lib/*` to `@typescript/typescript6` only when resolution fails or lands on TS 7+. The repo itself dev-depends on TS 7 (`tsc` for typecheck), so `npm run test` exercises the hook
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
- **CSS linting**: `cssConfig` uses `language: 'css/css'`, `@eslint/css` rules, `eslint-cssicorn` (unicorn's CSS rules moved there in unicorn v79; only `unicorn/no-transition-all` remains in unicorn) and `css-strict`. Strict parsing by default (`tolerant` off)
- **The config lints itself** (`npm run lint` over `plugins/`), so new plugin code must satisfy `ordered/top-level-definitions` etc.

## CI / Publish

- CI: `.github/workflows/ci.yml` - runs on Node 22, 24 (unicorn requires Node >=22)
- Publish: `.github/workflows/publish.yml` - triggers on `v*` tags (`npm version <bump> -m "%s"` then `git push --follow-tags`) or `workflow_dispatch`; publishes to **both** GitHub Packages (`GITHUB_TOKEN`) and registry.npmjs.org (OIDC trusted publishing with provenance, `NPM_TOKEN` secret as fallback). Both publish steps skip versions that already exist, so re-running is safe. The npm step uses its own `.npmrc` because setup-node's GitHub Packages config maps the `@tuomashatakka` scope to npm.pkg.github.com

## Dependencies

- Peer deps: `eslint >=10.4.0`, `react`, `typescript` (optional)
- Replaced `eslint-plugin-react` + `eslint-plugin-react-hooks` with `@eslint-react/eslint-plugin`
- `eslint-plugin-unicorn`: `new-for-builtins` replaces core `no-new-native-nonconstructor`; `consistent-class-member-order` replaces the removed `whitespaced/class-property-grouping`
- `@eslint/css` provides the `css/css` language and the `css/*` rules