

module.exports = {
  parser: 'babel-eslint',
  env: {
    node:     true,
    jasmine:  true,
    browser:  true,
    commonjs: true,
  },
  plugins: [
    'react',
    'flowtype'
  ],
  extends: [
    "plugin:flowtype/recommended",
    "plugin:react/recommended",
  ],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  globals: {
    Set:        true,
    Map:        true,
    Proxy:      true,
    Symbol:     true,
    Promise:    true,
    WeakSet:    true,
    WeakMap:    true,
    Uint8Array: true,
  },
  rules: {
    // Ignored
    strict: 0,

    // Warnings
    semi:         [ 1, 'never' ],
    complexity:   [ 1, 4 ],

    'max-depth':  [ 1, 3 ],
    'max-lines':  [ 1, 320 ],
    'max-len':    [ 1, 120 ],

    'no-tabs':      1,
    'no-console':   1,
    'dot-notation': 1,
    'class-methods-use-this': 1,

    // Errors
    eqeqeq:         [ 2, 'smart' ],
    'use-isnan':      2,

    'no-undef':       2,
    'no-obj-calls':   2,
    'no-unused-vars': 2
    'no-array-constructor': 2,
  },
  settings: {
    react: {
      pragma: 'React',
      version: "16.0.0"
    },
    flowtype: {
      onlyFilesWithFlowAnnotation: false
    }
  }
}
