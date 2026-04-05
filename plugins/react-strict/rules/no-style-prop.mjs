const DRAG_DROP_HANDLERS = new Set([
  'onDrag',
  'onDragStart',
  'onDragEnd',
  'onDragEnter',
  'onDragLeave',
  'onDragOver',
  'onDrop',
])


export default {
  meta: {
                         type:    'suggestion',
                         docs:    { description: 'Disallow inline style props unless used with drag/drop interactions' },
                         fixable: null,
                         schema:  [],
                         messages: {
      noStyleProp: 'Avoid inline style props. Use CSS classes or styled components instead. Inline styles are only acceptable for dynamic user interaction scenarios like drag/drop.',
    },
                       },
  create (context) {
    return {
             JSXAttribute (node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'style')
          return

        const opening = node.parent

        if (opening.type !== 'JSXOpeningElement')
          return

        const hasDragHandler = opening.attributes.some(attr =>
          attr.type === 'JSXAttribute' &&
          attr.name.type === 'JSXIdentifier' &&
          DRAG_DROP_HANDLERS.has(attr.name.name))

        if (!hasDragHandler)
          context.report({ node, messageId: 'noStyleProp' })
      },
           }
  },
}
