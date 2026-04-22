# AGENTS.md

## Commands

```bash
npm run lint        # lint the config itself
npm run test       # run all tests
npm run test:format # test formatting rules only
```

## Key Facts

- **ESLint flat config** (not legacy .eslintrc). Main entry: `index.mjs` exports `config`, `baseConfig`, `rules`
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

- Peer deps: `eslint >=9.13.0`, `react`, `typescript`
- Package uses ESLint 9.x flat config format