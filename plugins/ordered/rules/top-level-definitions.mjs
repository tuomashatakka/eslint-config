/**
 * @fileoverview Enforce the order of top-level module definitions:
 * constants, then type definitions, then classes, then functions.
 *
 * Constants whose initializer eagerly references a class or a function-valued
 * binding (`const store = new Store()`, `const run = compose(fn)`) are exempt by
 * default, because moving them above that binding would throw a TDZ error.
 * @author tuomashatakka
 */

const DEFAULT_ORDER = [ 'constant', 'type', 'class', 'function' ]

const FUNCTION_EXPRESSIONS = new Set([ 'FunctionExpression', 'ArrowFunctionExpression' ])

const HOISTED_DEFINITIONS = new Set([ 'FunctionName', 'ImportBinding', 'Type' ])


function unwrapExport (statement) {
  if (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration')
    return statement.declaration

  return statement
}


function classifyVariable (node) {
  const inits = node.declarations.map(declarator => declarator.init).filter(Boolean)

  if (inits.length && inits.every(init => FUNCTION_EXPRESSIONS.has(init.type)))
    return 'function'

  if (inits.length && inits.every(init => init.type === 'ClassExpression'))
    return 'class'

  return 'constant'
}


function classify (statement) {
  const node = unwrapExport(statement)

  if (!node)
    return null

  switch (node.type) {
    case 'VariableDeclaration':
      return classifyVariable(node)
    case 'TSEnumDeclaration':
      return 'constant'
    case 'TSTypeAliasDeclaration':
    case 'TSInterfaceDeclaration':
      return 'type'
    case 'ClassDeclaration':
    case 'ClassExpression':
      return 'class'
    case 'FunctionDeclaration':
    case 'TSDeclareFunction':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return 'function'
    default:
      return null
  }
}


function getName (statement, sourceCode) {
  const node = unwrapExport(statement)

  if (node.type === 'VariableDeclaration')
    return node.declarations
      .map(({ id }) => id.type === 'Identifier' ? id.name : sourceCode.getText(id))
      .join(', ')

  return node.id ? node.id.name : 'default'
}


/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the order of top-level definitions: constants, types, classes, functions',
      category:    'Stylistic Issues',
      recommended: false,
    },
    schema: [{
      type:       'object',
      properties: {
        order: {
          type:        'array',
          items:       { enum: DEFAULT_ORDER },
          uniqueItems: true,
        },
        respectDependencies: { type: 'boolean', default: true },
      },
      additionalProperties: false,
    }],
    messages: {
      wrongOrder: '{{kind}} `{{name}}` should be declared before {{prevKind}} `{{prevName}}` (expected order: {{order}}).',
    },
  },
  create (context) {
    const sourceCode          = context.sourceCode
    const options             = context.options[0] || {}
    const order               = options.order || DEFAULT_ORDER
    const respectDependencies = options.respectDependencies !== false
    const constantRank        = order.indexOf('constant')

    function dependsOnLaterGroup (statement, scope, kinds) {
      const [ start, end ] = statement.range

      return scope.references.some(reference => {
        const { identifier, resolved } = reference

        if (!resolved || reference.isTypeReference || identifier.range[0] < start || identifier.range[1] > end)
          return false

        const definition = resolved.defs[0]

        if (!definition || HOISTED_DEFINITIONS.has(definition.type))
          return false

        const declaration = definition.type === 'Variable' ? definition.parent : definition.node
        const kind        = kinds.get(declaration)

        return kind !== undefined && order.indexOf(kind) > constantRank
      })
    }

    function moduleScope (program) {
      const scope = sourceCode.getScope(program)
      return scope.childScopes.find(child => child.type === 'module') || scope
    }

    return {
      Program (program) {
        const scope = moduleScope(program)
        const kinds = new Map(program.body.map(statement => [ unwrapExport(statement), classify(statement) ]))
        let highest = null

        for (const statement of program.body) {
          const kind = kinds.get(unwrapExport(statement))
          const rank = kind ? order.indexOf(kind) : -1

          if (rank === -1 || kind === 'constant' && respectDependencies && dependsOnLaterGroup(statement, scope, kinds))
            continue

          if (highest && rank < highest.rank) {
            context.report({
              node:      statement,
              messageId: 'wrongOrder',
              data:      {
                kind,
                name:     getName(statement, sourceCode),
                prevKind: highest.kind,
                prevName: getName(highest.statement, sourceCode),
                order:    order.join(', '),
              },
            })
            continue
          }

          if (!highest || rank > highest.rank)
            highest = { rank, kind, statement }
        }
      },
    }
  },
}
