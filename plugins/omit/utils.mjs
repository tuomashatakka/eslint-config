const RESERVED_WORDS = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])


export


function isValidDotNotationIdentifier (name) {
  const identifierRegex = /^[\p{L}\p{Nl}$_][\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}\p{Pc}$_]*$/u
  if (typeof name !== 'string' || name.length === 0)
    return false
  return identifierRegex.test(name) && !RESERVED_WORDS.has(name)
}


export


function isDeclaration (statement) {
  return statement.type === 'VariableDeclaration' ||
    statement.type === 'FunctionDeclaration' ||
    statement.type === 'ClassDeclaration'
}


export


function isParenthesized (node, sourceCode) {
  const previousToken = sourceCode.getTokenBefore(node)
  const nextToken     = sourceCode.getTokenAfter(node)

  return Boolean(
    previousToken && nextToken &&
    previousToken.value === '(' && previousToken.range[1] <= node.range[0] &&
    nextToken.value === ')' && nextToken.range[0] >= node.range[1]
  )
}


export default {
  isParenthesized,
  isDeclaration,
  isValidDotNotationIdentifier,
}
