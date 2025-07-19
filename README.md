# @tuomashatakka/eslint-config

> Opinionated yet functional ESLint configuration with comprehensive TypeScript, React, and JSX support

For Next.js, React and TypeScript projects using modern flat config format.

## 🚀 Recent Updates (v2.5.0)

### ✨ Major Improvements
- **Removed Tailwind ESLint Plugin** - Streamlined configuration by removing tailwindcss plugin dependency
- **Migrated React Rules to @stylistic/jsx** - Moved all React styling rules to the dedicated stylistic JSX plugin for better separation of concerns
- **Updated All Plugins to Latest Versions** - Comprehensive dependency modernization with compatibility fixes
- **Added Comprehensive Test Suite** - Complete test coverage for formatting scenarios and edge cases

### 🔧 Technical Modernization
- Updated `@stylistic/eslint-plugin` to v5.2.0
- Added `@stylistic/eslint-plugin-jsx` for dedicated JSX formatting
- Fixed deprecated `allowTemplateLiterals` configuration (migrated from boolean to 'always'/'never')
- Consolidated plugin architecture for better maintainability

## 📦 Installation

```bash
npm install --save-dev @tuomashatakka/eslint-config
```

## 🔧 Usage

### Using the full config

Create an `eslint.config.mjs` file in your project root:

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

### Custom Configuration

```javascript
import { baseConfig, rules } from '@tuomashatakka/eslint-config'

export default [
  ...baseConfig,
  {
    // Your custom overrides
    rules: {
      ...rules,
      'no-console': 'off'
    }
  }
]
```

## 🎯 Features

### Code Quality Rules
- **Complexity Control** - Max complexity: 14, max statements: 40
- **Functional Patterns** - Encourages functional programming practices
- **Type Safety** - Comprehensive TypeScript integration

### Stylistic Formatting
- **Consistent Spacing** - Aligned object properties, consistent indentation
- **Modern Syntax** - Arrow functions, template literals, destructuring
- **JSX Excellence** - Dedicated JSX formatting with proper component patterns

### Plugin Integration
- **@stylistic/eslint-plugin** - Modern code formatting
- **@stylistic/eslint-plugin-jsx** - JSX-specific formatting rules
- **typescript-eslint** - TypeScript language support
- **eslint-plugin-react** - React component best practices
- **eslint-plugin-import** - Import/export management
- **Custom Plugins** - Specialized rules for code quality

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test formatting capabilities
npm run test:format

# Lint the configuration itself
npm run lint
```

### Test Coverage
- ✅ Basic JavaScript patterns
- ✅ Complex TypeScript scenarios  
- ✅ React/JSX components
- ✅ Edge cases and formatting challenges

## 📋 Structure

The package uses ESLint's flat config format and has a clean structure:

- `index.mjs` - Exports the full config, baseConfig, and rules
- `rules.mjs` - Contains all the ESLint rules organized by category
- `test/` - Comprehensive test suite with fixtures and runners

## 🔍 Migration Guide

### From v2.4.0 to v2.5.0

1. **Remove tailwindcss dependency** (if manually installed)
2. **Update package.json** - Latest versions are automatically handled
3. **No breaking changes** - All existing code continues to work
4. **Enhanced JSX support** - Better formatting for React components

### Deprecated Configurations
- `allowTemplateLiterals: true` → `allowTemplateLiterals: 'always'`
- Tailwind CSS rules removed (use dedicated Tailwind tools instead)

## 🐛 Troubleshooting

### Common Issues

**Template literal warnings:**
- Update to v2.5.0+ for the fixed configuration

**JSX formatting issues:**
- Ensure you're using files with proper extensions (.jsx, .tsx)
- Check that React is properly detected in settings

**TypeScript parsing errors:**
- Verify your tsconfig.json is valid
- Ensure proper file extensions (.ts, .tsx)

## 📈 Performance

- **Zero runtime dependencies** in production
- **Fast linting** with optimized rule selection
- **Minimal plugin surface area** for better performance
- **Comprehensive but efficient** rule set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new rules
4. Run the test suite: `npm run test`
5. Submit a pull request

## License

ISC