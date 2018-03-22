module.exports.exceptMethods = [
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

module.exports.plugins = [
  'react',
  'flow',
  'import',
  'block-padding',
]

module.exports.env = [
  'node',
  'jasmine',
  'browser',
  'commonjs',
]

module.exports.globals = [
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

module.exports.allowedImports = [
  '**/*.{le,c,sc}ss',
  'babel-*',
  '@babel/*',
  'reactotron',
]

const fn = {
  body: 1,
  parameters: 'first'
}

const cl = {
  body: 1,
  arguments: 'first'
}

const vr = {
  'var': 2,
  'let': 2,
  'const': 3,
}

module.exports.indentation = {
  depth: 2,
  options: {
    SwitchCase:       2,
    ObjectExpression: 1,
    MemberExpression: 1,
    ConditionalExpression: 1,
    FunctionDeclaration: fn,
    FunctionExpression:  fn,
    CallExpression: cl,
    ArrayExpression: 'first',
    ObjectExpression: 'first',
    ImportDeclaration: 'first',
    VariableDeclarator: vr

  }
}

module.exports.comments = {
  beforeBlockComment: true,
  afterBlockComment:  true,
  beforeLineComment:  true,
  afterLineComment:   false,
  allowClassEnd:      false,
  allowBlockEnd:      false,
}
