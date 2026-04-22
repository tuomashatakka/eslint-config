function isComponentFunction (node) {
  let current = node

  while (current) {
    if (
      current.type === 'ArrowFunctionExpression' ||
      current.type === 'FunctionExpression' ||
      current.type === 'FunctionDeclaration'
    ) {
      const parent = current.parent

      if (parent && parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        const name = parent.id.name

        if (name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase())
          return true
      }

      if (current.type === 'FunctionDeclaration' && current.id) {
        const name = current.id.name

        if (name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase())
          return true
      }
    }

    current = current.parent
  }

  return false
}


function isInsideReturnJSX (node) {
  let current = node.parent

  while (current) {
    if (current.type === 'ReturnStatement')
      return true

    if (current.type === 'ArrowFunctionExpression' && current.body.type !== 'BlockStatement')
      return true

    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    )
      return false

    current = current.parent
  }

  return false
}


export default {
  meta: {
    type:    'suggestion',
    docs:    { description: 'Disallow value calculations and assignments inside JSX return blocks' },
    fixable: null,
    schema:  [],
    messages: {
      noJsxCalculations: 'Move value calculations and assignments outside the return block. Compute values before the return statement.',
    },
  },
  create (context) {
    return {
      JSXExpressionContainer (node) {
        if (!isComponentFunction(node) || !isInsideReturnJSX(node))
          return

        const expr = node.expression

        if (!expr || expr.type === 'JSXEmptyExpression')
          return

        if (expr.type === 'AssignmentExpression') {
          context.report({ node: expr, messageId: 'noJsxCalculations' })
          return
        }

        if (expr.type === 'SequenceExpression') {
          const hasAssignment = expr.expressions.some(e => e.type === 'AssignmentExpression')

          if (hasAssignment)
            context.report({ node: expr, messageId: 'noJsxCalculations' })
        }
      },
      VariableDeclaration (node) {
        if (!isComponentFunction(node) || !isInsideReturnJSX(node))
          return

        context.report({ node, messageId: 'noJsxCalculations' })
      },
    }
  },
}
