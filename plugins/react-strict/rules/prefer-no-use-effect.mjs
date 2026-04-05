export default {
  meta: {
                         type:    'suggestion',
                         docs:    { description: 'Discourage useEffect in favor of React context, custom hooks, or event-driven patterns' },
                         fixable: null,
                         schema:  [],
                         messages: {
      preferNoUseEffect: 'Consider alternatives to useEffect. Extract side effects into React context, a custom hook in a separate module, or use event-driven patterns.',
    },
                       },
  create (context) {
    return {
             CallExpression (node) {
        const isDirectCall = node.callee.type === 'Identifier' &&
          node.callee.name === 'useEffect'

        const isMemberCall = node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'useEffect'

        if (isDirectCall || isMemberCall)
          context.report({ node, messageId: 'preferNoUseEffect' })
      },
           }
  },
}
