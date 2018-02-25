

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

const parserOptions = {
  ecmaVersion: 7,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true
  }
}

const globals = [
  'Set',
  'Map',
  'Proxy',
  'Symbol',
  'Promise',
  'WeakSet',
  'WeakMap',
  'Uint8Array',
  '__DEV__',
]

const always = 'always'
const never  = 'never'
const W      = 'warn'
const E      = 'error'

module.exports = {

  parser: 'babel-eslint',
  parserOptions,

  env: {
    node:     true,
    jasmine:  true,
    browser:  true,
    commonjs: true,
  },

  plugins: [
    'react',
    'flow',
    'import',
  ],


  rules: {
    // Ignored
    strict: 0,

    // Warnings
    semi:        [ W, never ],
    complexity:  [ W, 6 ],
    'max-depth': [ W, 3 ],
    'max-lines': [ W, 720 ],
    'max-len':   [ W, 140 ],

    'no-tabs':                W,
    'no-console':             W,
    'no-debugger':            W,
    'dot-notation':           W,
    'class-methods-use-this': [ W, { exceptMethods } ],

    'comma-spacing':         [ W, { before: false, after: true, }],
    'array-bracket-spacing': [ W, always, { arraysInArrays: false }],
    'object-curly-spacing':  [ W, always, { objectsInObjects: false }],

    // Errors
    eqeqeq:      [ E, 'smart' ],
    'use-isnan':   E,

    'no-undef':             E,
    'no-obj-calls':         E,
    'no-unused-vars':       E,
    'no-array-constructor': E,
    'no-func-assign':       E,
    'no-class-assign':       E,

    'import/no-mutable-exports':     E,
    'import/prefer-default-export':  E,
    'import/no-unassigned-import': [ E, { allow: [
      '**/*.{le,c,sc}ss',
      'babel-*',
      'reactotron',
    ]}],
    'import/no-extraneous-dependencies': [ E, {
      'devDependencies':  [
        '**/*.{test,spec}.js',
        '**/{test,spec}/*.js',
        '**/*.{dev,develop,development}.js{x,}',
        '**/{dev,develop,development}/*.js{x,}',
      ]
    }]
  },

  settings: {
    react: {
      pragma: 'React',
      version: "16.3.0"
    },
    flow: {
      onlyFilesWithFlowAnnotation: false
    }
  },

  globals: globals.reduce((g, c) => Object.assign(g, { [c]: true }), {}),

}
