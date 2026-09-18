/**
 * @fileoverview Enforce blank-line padding between CSS rules, declarations and block edges.
 * Mirrors the JS conventions (padded-blocks: never, padding between statements,
 * no-multiple-empty-lines, eol-last) for the @eslint/css language.
 * @author tuomashatakka
 */

import { Positions, blockDepth, contentEnd, gapBetween, indentFor, newlinesIn } from '../utils.mjs'


function isStatement (node) {
  return node.type === 'Declaration' || node.type === 'Atrule' && !node.block
}


/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce blank-line padding between CSS rules, declarations and block edges',
      category:    'Stylistic Issues',
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:       'object',
      properties: {
        rootPadding:   { type: 'integer', minimum: 0, default: 2 },
        nestedPadding: { type: 'integer', minimum: 0, default: 1 },
        indent:        { type: 'integer', minimum: 0, default: 2 },
      },
      additionalProperties: false,
    }],
    messages: {
      expectedPadding:    'Expected {{expected}} blank {{lines}} before this {{kind}}, but found {{actual}}.',
      expectedNewline:    'Expected this {{kind}} to start on its own line.',
      paddedBlockStart:   'Unexpected blank line at the beginning of a block.',
      paddedBlockEnd:     'Unexpected blank line at the end of a block.',
      closingBraceOnLine: 'Expected the closing brace to be on its own line.',
      paddedFileStart:    'Unexpected blank line at the beginning of the file.',
      eofNewline:         'Expected exactly one newline at the end of the file.',
    },
  },
  create (context) {
    const sourceCode    = context.sourceCode
    const text          = sourceCode.text
    const positions     = new Positions(text)
    const options       = context.options[0] || {}
    const rootPadding   = options.rootPadding ?? 2
    const nestedPadding = options.nestedPadding ?? 1
    const indentSize    = options.indent ?? 2

    function kindOf (node) {
      if (node.type === 'Declaration')
        return 'declaration'

      if (node.type === 'Atrule')
        return `@${node.name} rule`

      return 'rule'
    }

    function expectedRange (prev, next, depth, parentAtrule) {
      const max = depth === 0 ? rootPadding : nestedPadding
      const min = isStatement(prev) && isStatement(next) || parentAtrule === 'keyframes' ? 0 : max
      return { min, max }
    }

    function checkGap (prevEnd, next, depth, { min, max }) {
      const [ end, start ] = gapBetween(sourceCode, positions, prevEnd, next.loc.start.offset)
      const newlines       = newlinesIn(text.slice(end, start))
      const blank          = newlines - 1

      if (newlines > 0 && blank >= min && blank <= max)
        return

      const expected = Math.min(Math.max(blank, min), max)

      context.report({
        node:      next,
        messageId: newlines === 0 ? 'expectedNewline' : 'expectedPadding',
        data:      {
          expected,
          actual: Math.max(blank, 0),
          lines:  expected === 1 ? 'line' : 'lines',
          kind:   kindOf(next),
        },
        fix: fixer => fixer.replaceTextRange([ end, start ], '\n'.repeat(expected + 1) + indentFor(depth, indentSize)),
      })
    }

    function checkBlockStart (block, depth) {
      const first          = block.children[0]
      const [ end, start ] = gapBetween(sourceCode, positions, block.loc.start.offset + 1, first.loc.start.offset)
      const newlines       = newlinesIn(text.slice(end, start))

      if (newlines === 1)
        return

      context.report({
        node:      first,
        messageId: newlines === 0 ? 'expectedNewline' : 'paddedBlockStart',
        data:      { kind: kindOf(first) },
        fix:       fixer => fixer.replaceTextRange([ end, start ], `\n${indentFor(depth, indentSize)}`),
      })
    }

    function checkBlockEnd (block, depth) {
      const last           = block.children[block.children.length - 1]
      const close          = block.loc.end.offset - 1
      const [ end, start ] = gapBetween(sourceCode, positions, contentEnd(text, last), close)
      const newlines       = newlinesIn(text.slice(end, start))

      if (newlines === 1)
        return

      context.report({
        loc:       { start: positions.locOf(close), end: positions.locOf(close + 1) },
        messageId: newlines === 0 ? 'closingBraceOnLine' : 'paddedBlockEnd',
        fix:       fixer => fixer.replaceTextRange([ end, start ], `\n${indentFor(depth - 1, indentSize)}`),
      })
    }

    function checkFileStart (first) {
      const firstComment = sourceCode.comments[0]
      const start        = Math.min(first.loc.start.offset, firstComment ? firstComment.loc.start.offset : Infinity)

      if (!newlinesIn(text.slice(0, start)))
        return

      context.report({
        loc:       { start: positions.locOf(0), end: positions.locOf(start) },
        messageId: 'paddedFileStart',
        fix:       fixer => fixer.removeRange([ 0, start ]),
      })
    }

    function checkFileEnd (last) {
      let end = contentEnd(text, last)

      for (const comment of sourceCode.comments)
        if (comment.loc.start.offset >= end)
          end = comment.loc.end.offset

      if (text.slice(end) === '\n')
        return

      context.report({
        loc:       { start: positions.locOf(end), end: positions.locOf(text.length) },
        messageId: 'eofNewline',
        fix:       fixer => fixer.replaceTextRange([ end, text.length ], '\n'),
      })
    }

    function checkSiblings (children, depth, parentAtrule) {
      for (let i = 1; i < children.length; i++) {
        const prev = children[i - 1]
        const next = children[i]

        checkGap(contentEnd(text, prev), next, depth, expectedRange(prev, next, depth, parentAtrule))
      }
    }

    return {
      StyleSheet (node) {
        if (!node.children.length)
          return

        checkFileStart(node.children[0])
        checkSiblings(node.children, 0, null)
        checkFileEnd(node.children[node.children.length - 1])
      },
      Block (node) {
        if (!node.children.length)
          return

        const depth  = blockDepth(sourceCode, node) + 1
        const parent = sourceCode.getParent(node)

        checkBlockStart(node, depth)
        checkSiblings(node.children, depth, parent && parent.type === 'Atrule' ? parent.name : null)
        checkBlockEnd(node, depth)
      },
    }
  },
}
