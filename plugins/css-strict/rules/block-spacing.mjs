/**
 * @fileoverview Enforce exactly one space between a rule's prelude and its opening brace
 * (the CSS counterpart of `space-before-blocks`).
 * @author tuomashatakka
 */

import { Positions, skipWhitespace } from '../utils.mjs'


/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce exactly one space before the opening brace of a block',
      category:    'Stylistic Issues',
      recommended: false,
    },
    fixable:  'whitespace',
    schema:   [],
    messages: {
      spaceBeforeBrace: 'Expected exactly one space before `{`.',
    },
  },
  create (context) {
    const sourceCode = context.sourceCode
    const text       = sourceCode.text
    const positions  = new Positions(text)

    function checkBlock (node) {
      if (!node.block)
        return

      const brace   = node.block.loc.start.offset
      const wsStart = skipWhitespace(text, brace - 1, -1) + 1

      if (text.slice(wsStart, brace) === ' ')
        return

      context.report({
        loc:       { start: positions.locOf(wsStart), end: positions.locOf(brace + 1) },
        messageId: 'spaceBeforeBrace',
        fix:       fixer => fixer.replaceTextRange([ wsStart, brace ], ' '),
      })
    }

    return {
      Rule:   checkBlock,
      Atrule: checkBlock,
    }
  },
}
