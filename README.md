# @tuomashatakka/eslint-config

> Opinionated yet functional AF base config for ESLint using the new flat config format

For Next.js, React and TypeScript projects.

## Installation

```bash
npm install --save-dev @tuomashatakka/eslint-config
```

## Usage

### Using the full config

Create an `eslint.config.js` file in your project root:

```javascript
import config from '@tuomashatakka/eslint-config'

export default config
```

### Using just the rules

If you want to use only the rules in your own config:

```javascript
import { rules } from '@tuomashatakka/eslint-config'

export default [
  // Your custom config here
  {
    // ...
    rules
  }
]
```

## Features

- TypeScript support
- React/JSX support
- Modern JavaScript features
- Stylistic rules for consistent code formatting
- Import/export validation

## Structure

The package uses ESLint's flat config format and has a simple structure:

- `index.mjs` - Exports the full config and rules
- `rules.mjs` - Contains all the ESLint rules

### Todo

- Style imports aren't yet enforced to have an empty line between them and other imports.
- I really love Python's enforced linting style for having two rows between major blocks
  and 1 row between minor. I should finish my block padding plugin some day for the ESLinter.
  My linting rules would really appreciate that.

## License

ISC
