function isInsideJSXExpression (node) {
  let current = node.parent

  while (current) {
    if (current.type === 'JSXExpressionContainer')
      return true

    current = current.parent
  }

  return false
}


function hasComplexBody (callbackBody) {
  if (callbackBody.type === 'BlockStatement') {
    const hasIfOrSwitch = callbackBody.body.some(stmt =>
      stmt.type === 'IfStatement' || stmt.type === 'SwitchStatement')

    if (hasIfOrSwitch)
      return true

    if (callbackBody.body.length > 3)
      return true
  }

  return false
}


export default {
  meta: {
    type:    'suggestion',
    docs:    { description: 'Disallow complex .map() callbacks with inline logic inside JSX' },
    fixable: null,
    schema:  [],
    messages: {
      noComplexMap: 'Extract complex .map() callback into a separate component. Move conditional logic outside the JSX return block.',
    },
  },
  create (context) {
    return {
      CallExpression (node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'map'
        )
          return

        if (!isInsideJSXExpression(node))
          return

        const callback = node.arguments[0]

        if (!callback)
          return

        if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
          if (hasComplexBody(callback.body))
            context.report({ node, messageId: 'noComplexMap' })
        }
      },
    }
  },
}
