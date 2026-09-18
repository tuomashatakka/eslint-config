/**
 * @fileoverview Enforce consistent indentation in CSS files: every rule, at-rule,
 * declaration, continuation selector and closing brace that starts a line is indented
 * by `size` spaces per nesting level.
 * @author tuomashatakka
 */

import { Positions, blockDepth, indentFor } from '../utils.mjs'


/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent indentation in CSS files',
      category:    'Stylistic Issues',
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:       'object',
      properties: {
        size: { type: 'integer', minimum: 0, default: 2 },
      },
      additionalProperties: false,
    }],
    messages: {
      wrongIndent: 'Expected indentation of {{expected}} {{unit}} but found {{actual}}.',
    },
  },
  create (context) {
    const sourceCode = context.sourceCode
    const text       = sourceCode.text
    const positions  = new Positions(text)
    const size       = (context.options[0] || {}).size ?? 2

    function check (offset, depth) {
      const lineStart = positions.lineStartOf(offset)
      const leading   = text.slice(lineStart, offset)

      if (leading.trim() !== '')
        return

      const expected = indentFor(depth, size)

      if (leading === expected)
        return

      context.report({
        loc:       { start: positions.locOf(lineStart), end: positions.locOf(offset) },
        messageId: 'wrongIndent',
        data:      {
          expected: expected.length,
          unit:     expected.length === 1 ? 'space' : 'spaces',
          actual:   leading.includes('\t') ? `${leading.length} characters including tabs` : leading.length,
        },
        fix: fixer => fixer.replaceTextRange([ lineStart, offset ], expected),
      })
    }

    function checkSelectors (node, depth) {
      const selectors = node.prelude && node.prelude.children

      if (!selectors)
        return

      for (const selector of selectors.slice(1))
        check(selector.loc.start.offset, depth)
    }

    return {
      Rule (node) {
        const depth = blockDepth(sourceCode, node)

        check(node.loc.start.offset, depth)
        checkSelectors(node, depth)
      },
      Atrule (node) {
        check(node.loc.start.offset, blockDepth(sourceCode, node))
      },
      Declaration (node) {
        check(node.loc.start.offset, blockDepth(sourceCode, node))
      },
      Block (node) {
        check(node.loc.end.offset - 1, blockDepth(sourceCode, node))
      },
    }
  },
}
