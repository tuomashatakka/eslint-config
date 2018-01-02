

const exceptMethods = [
  'shouldComponentUpdate',
  'render',
  'componentDidMount',
  'componentDidCatch',
  'componentDidUpdate',
  'componentWillMount',
  'componentWillUpdate',
  'componentWillUnmount',
  'componentWillReceiveProps',
]

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
    semi:        [ 'warn', 'never' ],
    complexity:  [ 'warn', 4 ],
    'max-depth': [ 'warn', 3 ],
    'max-lines': [ 'warn', 320 ],
    'max-len':   [ 'warn', 120 ],

    'no-tabs':                'warn',
    'no-console':             'warn',
    'dot-notation':           'warn',
    'class-methods-use-this': [ 'warn', { exceptMethods } ],

    // Errors
    eqeqeq:      [ 'error', 'smart' ],
    'use-isnan':   'error',

    'no-undef':             'error',
    'no-obj-calls':         'error',
    'no-unused-vars':       'error',
    'no-array-constructor': 'error',
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
