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
      description: 'Enforce no space before the colon and consistent spacing after it in declarations',
      category:    'Stylistic Issues',
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:                 'object',
      properties:           { alignedValues: { type: 'boolean', default: false }},
      additionalProperties: false,
    }],
    messages: {
      noSpaceBeforeColon: 'Unexpected whitespace before `:` in `{{property}}`.',
      spaceAfterColon:    'Expected valid spacing after the colon in `{{property}}`.',
    },
  },
  create (context) {
    const sourceCode    = context.sourceCode
    const text          = sourceCode.text
    const positions     = new Positions(text)
    const alignedValues = (context.options[0] || {}).alignedValues === true

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

        if (emptyValue || (alignedValues ? (/^ +$/).test(after) : after === ' ') || after.includes('\n'))
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
