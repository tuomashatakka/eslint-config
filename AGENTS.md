# AGENTS.md

## Commands

```bash
npm run lint        # lint the config itself
npm run test       # run all tests
npm run test:format # test formatting rules only
```

## Key Facts

- **ESLint 10 flat config** (not legacy .eslintrc). Main entry: `index.mjs` exports `config`, `baseConfig`, `rules`
- **ESLint 10**: `context.getSourceCode()` removed — use `context.sourceCode` in custom rules
- **Custom test runners**: `test/test-runner.mjs` and `test/format-cases.mjs` - not jest/vitest
- **Local plugins** in `plugins/`:
  - `no-inline-types/` - prevents inline multiline type annotations
  - `whitespaced/` - whitespace formatting rules
  - `omit/` - omit rules
  - `react-strict/` - strict React rules

## CI / Publish

- CI: `.github/workflows/ci.yml` - runs on Node 20, 22
- Publish: `.github/workflows/publish.yml` - triggers on `v*` tags, auto-bumps package.json version

## Dependencies

- Peer deps: `eslint >=10.0.0`, `react`, `typescript`
- Replaced `eslint-plugin-react` + `eslint-plugin-react-hooks` with `@eslint-react/eslint-plugin`
- Package uses ESLint 10 flat config format