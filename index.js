const { parserOptions,
        settings,
        parser } = require('./settings')
const { reduce } = require('./utils')
const constants  = require('./constants')

// Shortcuts
const N       = 0,
      W       = 'warn',
      E       = 'error',
      vars    = [ 'const', 'let', 'var' ],
      any     = 'any',
      never   = 'never',
      always  = 'always',
      dir     = 'directive',
      after   = true,
      before  = true

// Constants
const env             = reduce(constants.env)
const globals         = reduce(constants.globals)
const plugins         = constants.plugins
const comments        = constants.comments
const indentation     = constants.indentation
const exceptMethods   = constants.exceptMethods
const allowedImports  = constants.allowedImports


const statements = [
  // [ always,   '*',            vars ],
  [ any,      vars,           '*' ],
  [ any,      vars,           vars ],
  [ always,   'import',       '*' ],
  [ any,      'import',       'import' ],
  // [ always,   'empty',        'block-like' ],
  // [ always,   'block-like',   vars ],
  // [ always,   '*',            'block-like' ],
]

module.exports = {
  env,
  parser,
  globals,
  plugins,
  settings,
  parserOptions,

  rules: {

    // Ignored
    strict: N,

    // Warnings
    semi:             [ W, never ],
    complexity:       [ W, 6 ],
    'max-depth':      [ W, 3 ],
    'max-lines':      [ W, 480 ],
    'max-len':        [ W, 140 ],
    'max-statements': [ W, 12 ],

    'no-tabs':          W,
    'no-console':       W,
    'no-debugger':      W,
    'dot-notation':     W,
    'no-extra-parens':  W,
    'comma-spacing':          [ W, { before: false, after }],
    'class-methods-use-this': [ W, { exceptMethods }],
    'array-bracket-spacing':  [ W, always, { arraysInArrays: false, objectsInArrays: false }],
    'object-curly-spacing':   [ W, always, { objectsInObjects: false, arraysInObjects: false }],

    // Errors
    'eqeqeq':             [ E, 'smart' ],
    'use-isnan':            E,

    'no-undef':             E,
    'no-obj-calls':         E,
    'no-new-symbol':        E,
    'no-unused-vars':       E,
    'no-func-assign':       E,
    'no-class-assign':      E,
    'no-array-constructor': E,

    // Import
    'import/no-mutable-exports':     E,
    'import/prefer-default-export':  E,
    'import/no-unassigned-import': [ E, { allow: allowedImports }],
    'import/no-extraneous-dependencies': 0,

    // React
    'jsx-quotes':               [ W, 'prefer-single' ],
    'react/jsx-uses-vars':        E,
    'react/jsx-uses-react':       E,
    'react/react-in-jsx-scope':   E,

    // 'flowtype/define-flow-type':  E,


    'indent': [ 'warn', indentation.depth, indentation.options ],

    'space-before-function-paren': [ 1, {
      asyncArrow: always,
      anonymous:  always,
      named:      always,
    }],

    // Whitespace
    'arrow-spacing':       W,
    'keyword-spacing':   [ W, { before, after }],
    'func-call-spacing': [ W, 'never' ],

    // Padding
    'implicit-arrow-linebreak':           N,
    'function-paren-newline':             N,
    'brace-style':                      [ W, '1tbs' ],
    'arrow-body-style':                 [ W, 'as-needed' ],
    'newline-per-chained-call':         [ W, { ignoreChainWithDepth: 2 }],
    'lines-between-class-members':      [ W, 'always', { exceptAfterSingleLine: true }],
    'one-var-declaration-per-line':     [ W, 'always' ],
    'padding-line-between-statements':  [ W, ...statements.map(([ blankLine, prev, next ]) => ({ blankLine, prev, next })) ],

    // Comments
    'multiline-comment-style':          [ W, 'separate-lines' ],
    'line-comment-position':            [ W, { position: 'above', applyDefaultIgnorePatterns: true }],
    'lines-around-comment':             [ W, comments ],

    // Padding between entities
    "block-padding/functions":          [ 1, 1, { strategy: 'at-least' }],
    "block-padding/classes":            [ 1, 2],

  },

}

// 'import/no-extraneous-dependencies': [ E, {
//   'devDependencies':  [
//     '**/*.{test,spec}.js',
//     '**/{test,spec}/*.js',
//     '**/*.{dev,develop,development}.js{x,}',
//     '**/{dev,develop,development}/*.js{x,}',
//   ]
// }],
