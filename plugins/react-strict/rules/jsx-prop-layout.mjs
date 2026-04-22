const RESERVED_PROPS                                                                                                                         = new Set([
  'key',
  'ref',
])
const STYLE_PROPS                                                                                                                      = new Set([
  'className',
  'style',
  'id',
])


function getPropName (attr) {
  if (attr.type === 'JSXSpreadAttribute')
    return null

  if (attr.name.type === 'JSXIdentifier')
    return attr.name.name

  if (attr.name.type === 'JSXNamespacedName')
    return `${attr.name.namespace.name}:${attr.name.name.name}`

  return null
}


function getPropGroup (name) {
  if (!name)
    return 4 // spread attributes — middle

  if (RESERVED_PROPS.has(name))
    return 0

  if (STYLE_PROPS.has(name))
    return 1

  if (name.startsWith('data-') || name.startsWith('aria-'))
    return 2

  if (name.startsWith('on') && name[2] === name[2].toUpperCase())
    return 5

  return 3
}


export default {
  meta: {
    type:    'suggestion',
    docs:    { description: 'Enforce consistent JSX prop ordering: key/ref first, className/style next, data/aria attrs, then regular props, callbacks last' },
    fixable: 'code',
    schema:  [],
    messages: {
      propOrder: '`{{ current }}` should be placed before `{{ previous }}` ({{ currentGroup }} props should come before {{ previousGroup }} props).',
    },
  },
  create (context) {
    const groupNames = [
      'reserved',
      'style/class',
      'data/aria',
      'regular',
      'spread',
      'callback',
    ]

    return {
      JSXOpeningElement (node) {
        const attrs = node.attributes

        if (attrs.length < 2)
          return

        let lastGroup = -1
        let lastName  = null

        for (const attr of attrs) {
          const name  = getPropName(attr)
          const group = getPropGroup(name)

          if (group < lastGroup) {
            context.report({
              node:      attr,
              messageId: 'propOrder',
              data:      {
                current:       name || '{...spread}',
                previous:      lastName || '{...spread}',
                currentGroup:  groupNames[group],
                previousGroup: groupNames[lastGroup],
              },
            })
            break
          }

          lastGroup = group
          lastName = name
        }
      },
    }
  },
}
