

module.exports = {
  env: {
    browser: true,
    node: true
  },
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
  parser: 'babel-eslint',
  plugins: [
    'react',
    'flowtype'
  ],
  globals: {
    Set:        true,
    Map:        true,
    Proxy:      true,
    Promise:    true,
    WeakSet:    true,
    WeakMap:    true,
    Uint8Array: true,
  },
  rules: {
    'max-len':        [ 'warn',   120 ],
    'max-lines':      [ 'warn',   320 ],
    'max-depth':      [ 'warn',   3 ],
    semi:             [ 'warn',   'never' ],
    eqeqeq:           [ 'error',  'smart' ],
    complexity:       [ 'error',  3 ],
    strict:           0,

    'no-tabs':        1,
    'no-console':     1,
    'dot-notation':   1,
    'class-methods-use-this': 1,

    'no-array-constructor': 2,
    'no-obj-calls':   2,
    'use-isnan':      2,
    'no-undef':       2,
    'no-unused-vars': 2
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
