/**
 * @exports {import("eslint/rules").ESLintRules} rules
 * @type {import("@eslint/core").RulesConfig}
 */
export const rules = {

  // '@next/next/no-styled-jsx-in-document':    [ 'error' ],
  // '@next/next/no-sync-scripts':              [ 'error' ],
  // 'block-padding/after-block':                     [ 'warn', 2 ],

  // Comments
  'multiline-comment-style':         [ 'warn', 'separate-lines', { checkJSDoc: false }],
  '@stylistic/lines-around-comment': [ 'warn', {
    beforeBlockComment: true,
    beforeLineComment:  true,
    afterLineComment:   false,
    allowClassEnd:      false,
    allowBlockEnd:      false,
  }],

  // TODO
  'import/no-extraneous-dependencies':      [ 'warn' ],
  'import/consistent-type-specifier-style': [ 'warn', 'prefer-top-level' ],
  'import/newline-after-import':            [ 'warn', { count: 2 }],
  'import/no-unassigned-import':            [ 'error', { allow: [ '**/*.{le,c,sc,sa}ss' ]}],
  'import/prefer-default-export':           [ 'error' ],
  'import/no-mutable-exports':              [ 'error' ],
  'import/order':                           [ 'warn', {
    'groups':                  [ 'builtin', 'type', 'external', [ 'parent', 'sibling', 'index' ], [ 'internal', 'object' ]],
    'alphabetize':             { order: 'asc', caseInsensitive: true },
    'distinctGroup':           true,
    'warnOnUnassignedImports': true,
    'newlines-between':        'always',
    'pathGroups':              [
      { group: 'internal', pattern: '**/*.s?css' }
    ]}
  ],

  // Typescript
  '@typescript-eslint/ban-ts-comment':  [ 'off', 'allow-single-line' ],
  '@typescript-eslint/no-unused-vars':  [ 'warn' ],
  '@typescript-eslint/no-explicit-any': [ 'warn' ],

  // Enforced practices (enforce functional and orthogonal code)
  'complexity':           [ 'warn', { max: 11 }],
  'eqeqeq':               [ 'warn', 'smart' ],
  'arrow-body-style':     [ 'warn', 'as-needed' ],
  'max-lines':            [ 'warn', { max: 666, skipComments: true, skipBlankLines: true }],
  'max-statements':       [ 'warn', 12 ],
  'max-depth':            [ 'warn', 4 ],
  'no-console':           [ 'warn' ],
  'no-debugger':          [ 'warn' ],
  'dot-notation':         [ 'warn' ],
  'no-undef':             [ 'warn' ],
  'use-isnan':            [ 'error' ],
  'no-obj-calls':         [ 'error' ],
  'no-new-symbol':        [ 'error' ],
  'no-func-assign':       [ 'error' ],
  'no-class-assign':      [ 'error' ],
  'no-array-constructor': [ 'error' ],

  // Stylistic formatting opinionations
  // '@stylistic/function-paren-newline':           [ 'warn', 'always' ],
  '@stylistic/function-call-spacing':         [ 'warn', 'never' ],
  '@stylistic/computed-property-spacing':     [ 'warn', 'never' ],
  '@stylistic/implicit-arrow-linebreak':      [ 'warn', 'below' ],
  '@stylistic/brace-style':                   [ 'warn', '1tbs', { allowSingleLine: false }],
  '@stylistic/comma-dangle':                  [ 'warn', 'only-multiline' ],
  '@stylistic/comma-spacing':                 [ 'warn', { before: false, after: true }],
  '@stylistic/comma-style':                   [ 'warn', 'last' ],
  '@stylistic/key-spacing':                   [ 'warn', { beforeColon: false, afterColon: true, align: 'value' }],
  '@stylistic/keyword-spacing':               [ 'warn', { before: true, after: true }],
  '@stylistic/object-property-newline':       [ 'warn', { allowAllPropertiesOnSameLine: true, allowMultiplePropertiesPerLine: false }],
  '@stylistic/max-len':                       [ 'warn', 200 ],
  '@stylistic/no-tabs':                       [ 'warn' ],
  '@stylistic/no-extra-parens':               [ 'warn', 'all' ],
  '@stylistic/jsx-function-call-newline':     [ 'warn', 'always' ],
  '@stylistic/no-multiple-empty-lines':       [ 'warn', { max: 2, maxEOF: 0, maxBOF: 0 }],
  '@stylistic/no-trailing-spaces':            [ 'warn', { skipBlankLines: false, ignoreComments: false }],
  '@stylistic/no-confusing-arrow':            [ 'warn', { allowParens: false, onlyOneSimpleParam: true }],
  '@stylistic/no-whitespace-before-property': [ 'warn' ],
  '@stylistic/space-in-parens':               [ 'warn', 'never' ],
  '@stylistic/space-infix-ops':               [ 'warn', { int32Hint: false }],
  '@stylistic/space-unary-ops':               [ 'warn', { words: true, nonwords: false }],
  '@stylistic/switch-colon-spacing':          [ 'warn', { after: true, before: false }],
  '@stylistic/template-curly-spacing':        [ 'warn', 'never' ],
  '@stylistic/wrap-iife':                     [ 'warn', 'inside' ],
  '@stylistic/wrap-regex':                    [ 'warn' ],
  '@stylistic/object-curly-spacing':          [ 'warn', 'always', { arraysInObjects: false, objectsInObjects: false }],
  '@stylistic/array-bracket-spacing':         [ 'warn', 'always', { arraysInArrays: false, objectsInArrays: false }],
  '@stylistic/new-parens':                    [ 'warn', 'always' ],
  '@stylistic/jsx-closing-bracket-location':  [ 'warn', 'tag-aligned' ],
  '@stylistic/operator-linebreak':            [ 'warn', 'after', { overrides: { '?': 'before', ':': 'before' }}],
  '@stylistic/quote-props':                   [ 'warn', 'consistent-as-needed', { keywords: false, unnecessary: true, numbers: false }],
  '@stylistic/indent':                        [ 'warn', 2, { SwitchCase: 1, CallExpression: { arguments: 'first' }}],
  '@stylistic/arrow-spacing':                 [ 'warn' ],
  '@stylistic/func-call-spacing':             [ 'warn', 'never' ],
  '@stylistic/newline-per-chained-call':      [ 'warn', { ignoreChainWithDepth: 2 }],
  '@stylistic/lines-between-class-members':   [ 'warn', 'always', { exceptAfterSingleLine: true }],
  '@stylistic/one-var-declaration-per-line':  [ 'warn', 'always' ],

  // @stylistic
  '@stylistic/arrow-parens':                [ 'warn', 'always' ],
  '@stylistic/dot-location':                [ 'warn', 'property' ],
  '@stylistic/eol-last':                    [ 'warn', 'always' ],
  '@stylistic/multiline-ternary':           [ 'warn', 'always-multiline' ],
  '@stylistic/no-floating-decimal':         [ 'warn' ],
  '@stylistic/no-mixed-operators':          [ 'warn' ],
  '@stylistic/no-extra-semi':               [ 'warn' ],
  '@stylistic/semi-spacing':                [ 'warn', { before: false, after: true }],
  '@stylistic/semi-style':                  [ 'warn', 'last' ],
  '@stylistic/semi':                        [ 'warn', 'never' ],
  '@stylistic/space-before-function-paren': [ 'warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
  '@stylistic/template-tag-spacing':        [ 'warn', 'always' ],
  '@stylistic/yield-star-spacing':          [ 'warn', 'after' ],
  '@stylistic/quotes':                      [ 'warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],

  // JSX/React
  '@stylistic/jsx-quotes':                   [ 'warn', 'prefer-single' ],
  '@stylistic/jsx-newline':                  [ 'warn', { prevent: true, allowMultilines: true }],
  '@stylistic/jsx-props-no-multi-spaces':    [ 'warn' ],
  '@stylistic/jsx-equals-spacing':           [ 'warn', 'never' ],
  '@stylistic/jsx-max-props-per-line':       [ 'warn', { maximum: 1, when: 'multiline' }],
  '@stylistic/jsx-self-closing-comp':        [ 'warn', { component: true, html: true }],
  '@stylistic/jsx-one-expression-per-line':  [ 'warn', { allow: 'single-child' }],
  '@stylistic/jsx-tag-spacing':              [ 'warn', { closingSlash: 'never', beforeSelfClosing: 'always', beforeClosing: 'never', afterOpening: 'never' }],
  'react/no-unescaped-entities':             [ 'error', { forbid: [ '>', '}' ]}],
  'react/jsx-uses-vars':                     [ 'error' ],
  'react/jsx-uses-react':                    [ 'error' ],
  'react/style-prop-object':                 [ 'error', { allow: []}],
  'react/prefer-stateless-function':         [ 'error', { ignorePureComponents: false }],
  'react/no-invalid-html-attribute':         [ 'error', []],
  'react/hook-use-state':                    [ 'warn', { allowDestructuredState: true }],
  'react/jsx-one-expression-per-line':       [ 'warn', { allow: 'single-child' }],
  'react/jsx-no-useless-fragment':           [ 'warn', { allowExpressions: true }],
  'react/jsx-no-target-blank':               [ 'warn', { enforceDynamicLinks: 'always' }],
  'react/jsx-closing-bracket-location':      [ 'warn', 'line-aligned' ],
  'react/jsx-closing-tag-location':          [ 'warn', 'line-aligned' ],
  'react/jsx-equals-spacing':                [ 'warn', 'never' ],
  'react/jsx-first-prop-new-line':           [ 'warn', 'multiline' ],
  'react/jsx-max-props-per-line':            [ 'warn', { maximum: 1, when: 'multiline' }],
  'react/jsx-no-constructed-context-values': [ 'warn' ],
  'react/jsx-no-script-url':                 [ 'warn' ],
  'react/jsx-no-comment-textnodes':          [ 'warn' ],
  'react/jsx-no-duplicate-props':            [ 'warn' ],
  'react/jsx-no-undef':                      [ 'warn' ],
  'react/jsx-pascal-case':                   [ 'warn' ],
  'react/jsx-curly-brace-presence':          [ 'warn', { props: 'never', children: 'never' }],
  'react/jsx-curly-spacing':                 [ 'warn', { when: 'never', children: true }],
  'react/display-name':                      [ 'warn', { checkContextObjects: true }],

  'import/prefer-default-export': 'off',
  '@stylistic/jsx-indent-props':  [ 'warn', { indentMode: 2, ignoreTernaryOperator: true }],
  '@stylistic/indent':            [ 'warn', 2, { offsetTernaryExpressions: false, flatTernaryExpressions: true }],

  // Block padding
  '@stylistic/no-multi-spaces':                  [ 'warn', { exceptions: { Property: true, TSTypeAnnotation: true, VariableDeclarator: true, ObjectExpression: false }}],
  '@stylistic/spaced-comment':                   [ 'warn', 'always', { markers: [ '/' ]}],
  '@stylistic/padded-blocks':                    [ 'warn', 'never' ],
  '@stylistic/nonblock-statement-body-position': [ 'warn', 'below' ],
  '@stylistic/space-before-blocks':              [ 'warn', 'always' ],
  '@stylistic/padding-line-between-statements':  [
    'warn',
    { blankLine: 'always', prev: 'directive', next: '*' },
    { blankLine: 'any', prev: 'directive', next: 'directive' },

    { blankLine: 'always', next: [ 'const', 'let', 'var' ], prev: '*' },
    { blankLine: 'any', prev: [ 'const', 'let', 'var' ], next: '*' },
    { blankLine: 'any', prev: [ 'const', 'let', 'var' ], next: [ 'const', 'let', 'var' ]},

    { prev: 'import', next: '*', blankLine: 'always' },
    { prev: 'import', next: 'import', blankLine: 'any' },

    { blankLine: 'always', prev: '*', next: [ 'export', 'return' ]},

    { blankLine: 'never', prev: 'case', next: '*' },
    { blankLine: 'never', prev: 'default', next: '*' },

    { blankLine: 'always',
      prev:      '*',
      next:      [ 'multiline-expression', 'function', 'block-like', 'block' ]},
    { blankLine: 'any',
      prev:      [ 'multiline-expression', 'function', 'block-like', 'block' ],
      next:      [ 'multiline-expression', 'function', 'block-like', 'block' ]}],
}

export default rules
