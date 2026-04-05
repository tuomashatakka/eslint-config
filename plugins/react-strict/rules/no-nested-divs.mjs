const SEMANTIC_ALTERNATIVES = [
  'main',
  'section',
  'article',
  'aside',
  'header',
  'footer',
  'nav',
  'figure',
  'figcaption',
  'details',
  'summary',
  'dialog',
]


function getElementName (node) {
  if (node.type === 'JSXElement' && node.openingElement.name.type === 'JSXIdentifier')
    return node.openingElement.name.name

  return null
}


export default {
  meta: {
                         type:    'suggestion',
                         docs:    { description: 'Disallow nested div elements; prefer semantic HTML5 tags' },
                         fixable: null,
                         schema:  [],
                         messages: {
      noNestedDivs: 'Avoid nesting <div> inside <div>. Use semantic HTML5 elements instead ({{ alternatives }}).',
    },
                       },
  create (context) {
    return {
             JSXElement (node) {
        const name = getElementName(node)

        if (name !== 'div')
          return

        const parent = node.parent

        if (parent.type !== 'JSXElement')
          return

        const parentName = getElementName(parent)

        if (parentName === 'div') 
context.report({
                                                   node:      node.openingElement,
                                                   messageId: 'noNestedDivs',
                                                   data:      { alternatives: SEMANTIC_ALTERNATIVES.join(', ') },
                                                 })
      },
           }
  },
}
