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
  'import',
  'flowtype',
  'flowtype-errors',
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
  parameters: 'first'
}

const cl = {
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
    SwitchCase: 1,
    CallExpression: cl,
  }
}

module.exports.comments = {
  beforeBlockComment: true,
  // afterBlockComment:  true,
  beforeLineComment:  true,
  afterLineComment:   false,
  allowClassEnd:      false,
  allowBlockEnd:      false,
}
