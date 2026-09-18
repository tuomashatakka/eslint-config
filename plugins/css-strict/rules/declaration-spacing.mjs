/**
 * @fileoverview Enforce `property: value` colon spacing in declarations
 * (the CSS counterpart of `key-spacing`).
 * @author tuomashatakka
 */

import { Positions, skipWhitespace } from '../utils.mjs'


/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce no space before and exactly one space after the colon in declarations',
      category:    'Stylistic Issues',
      recommended: false,
    },
    fixable:  'whitespace',
    schema:   [],
    messages: {
      noSpaceBeforeColon: 'Unexpected whitespace before `:` in `{{property}}`.',
      spaceAfterColon:    'Expected exactly one space after `:` in `{{property}}`.',
    },
  },
  create (context) {
    const sourceCode = context.sourceCode
    const text       = sourceCode.text
    const positions  = new Positions(text)

    return {
      Declaration (node) {
        const start   = node.loc.start.offset
        const propEnd = start + node.property.length

        if (text.slice(start, propEnd) !== node.property)
          return

        const colon = skipWhitespace(text, propEnd)

        if (text[colon] !== ':')
          return

        if (colon !== propEnd)
          context.report({
            loc:       { start: positions.locOf(propEnd), end: positions.locOf(colon) },
            messageId: 'noSpaceBeforeColon',
            data:      { property: node.property },
            fix:       fixer => fixer.removeRange([ propEnd, colon ]),
          })

        const valueStart = skipWhitespace(text, colon + 1)
        const after      = text.slice(colon + 1, valueStart)
        const emptyValue = valueStart >= text.length || text[valueStart] === ';' || text[valueStart] === '}'

        if (emptyValue || after === ' ' || after.includes('\n'))
          return

        context.report({
          loc:       { start: positions.locOf(colon), end: positions.locOf(valueStart) },
          messageId: 'spaceAfterColon',
          data:      { property: node.property },
          fix:       fixer => fixer.replaceTextRange([ colon + 1, valueStart ], ' '),
        })
      },
    }
  },
}
