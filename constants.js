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

module.exports.indentation = {
  depth: 2,
  options: {
    MemberExpression: 1,
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
