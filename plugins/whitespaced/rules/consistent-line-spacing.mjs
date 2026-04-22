/**
 * @fileoverview ESLint rule to enforce consistent line spacing before and after statements
 * @author tuomashatakka
 */

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent line spacing before and after statements',
      category:    "Stylistic Issues",
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:       "object",
      properties: {
        beforeImports:      { type: 'integer', minimum: 0, default: 1 },
        afterImports:       { type: 'integer', minimum: 0, default: 1 },
        beforeExports:      { type: 'integer', minimum: 0, default: 1 },
        afterExports:       { type: 'integer', minimum: 0, default: 1 },
        beforeClass:        { type: 'integer', minimum: 0, default: 2 },
        afterClass:         { type: 'integer', minimum: 0, default: 2 },
        beforeFunction:     { type: 'integer', minimum: 0, default: 2 },
        afterFunction:      { type: 'integer', minimum: 0, default: 2 },
        beforeComment:      { type: 'integer', minimum: 0, default: 1 },
        ignoreTopLevelCode: { type: 'boolean', default: false },
        skipImportGroups:   { type: 'boolean', default: true },
        docstringSpacing:   { type: 'integer', minimum: 0, default: 0 },
      },
      additionalProperties: false,
    },],
    messages: {
      missingLinesBefore:      "Expected {{expected}} empty {{lineText}} before {{nodeType}}, but found {{actual}}.",
      missingLinesAfter:       "Expected {{expected}} empty {{lineText}} after {{nodeType}}, but found {{actual}}.",
      incorrectDocstringSpacing: "Expected {{expected}} empty {{lineText}} between docstring and {{nodeType}}, but found {{actual}}.",
    },
  },
  create (context) {
    const sourceCode                                                                                                     = context.sourceCode || context.getSourceCode()
    const options                                                                                              = context.options[0] || {}

    const beforeImports                                                                                                = options.beforeImports !== undefined ? options.beforeImports : 1
    const afterImports                                                                                                 = options.afterImports !== undefined ? options.afterImports : 1
    const beforeExports                                                                                                = options.beforeExports !== undefined ? options.beforeExports : 1
    const afterExports                                                                                                 = options.afterExports !== undefined ? options.afterExports : 1
    const beforeClass                                                                                                  = options.beforeClass !== undefined ? options.beforeClass : 2
    const afterClass                                                                                                   = options.afterClass !== undefined ? options.afterClass : 2
    const beforeFunction                                                                                               = options.beforeFunction !== undefined ? options.beforeFunction : 2
    const afterFunction                                                                                                = options.afterFunction !== undefined ? options.afterFunction : 2
    const beforeComment                                                                                                          = options.beforeComment !== undefined ? options.beforeComment : 1
    const ignoreTopLevelCode                                                                                                     = options.ignoreTopLevelCode !== undefined ? options.ignoreTopLevelCode : false
    const skipImportGroups                                                                                                       = options.skipImportGroups !== undefined ? options.skipImportGroups : true
    const docstringSpacing                                                                                                       = options.docstringSpacing !== undefined ? options.docstringSpacing : 0


    function isFirstInParent (node) {
      const parent = node.parent
      if (!parent || !parent.body || !parent.body.length)
        return true
      return parent.body[0] === node
    }


    function isLastInParent (node) {
      const parent = node.parent
      if (!parent || !parent.body || !parent.body.length)
        return true
      return parent.body[parent.body.length - 1] === node
    }


    function isTopLevel (node) {
      return node.parent && node.parent.type === 'Program'
    }


    function isImport (node) {
      return node.type === 'ImportDeclaration'
    }


    /**
     * Returns the first token of the docstring immediately preceding `node`
     * (no blank lines between docstring end and node start), or null.
     *
     * Detects two docstring forms:
     *   • Block comment  /* ... *\/  on the line immediately before node
     *   • One or more consecutive // line comments on the lines immediately before node
     */
    function getDocstringBefore (node) {
      const prev = sourceCode.getTokenBefore(node, { includeComments: true })
      if (!prev)
        return null

      // Block comment touching the node (0 blank lines between)
      if (prev.type === 'Block' && node.loc.start.line <= prev.loc.end.line + 1)
        return prev

      // Chain of consecutive line comments touching the node
      if (prev.type === 'Line' && node.loc.start.line <= prev.loc.end.line + 1) {
        let first = prev
        for (;;) {
          const p = sourceCode.getTokenBefore(first, { includeComments: true })
          if (!p || p.type !== 'Line' || first.loc.start.line > p.loc.end.line + 1)
            break
          first = p
        }
        return first
      }

      return null
    }


    /**
     * Checks blank lines before `node` (or before its attached docstring).
     *
     * Key behaviour: if a docstring immediately precedes `node`, we measure
     * `requiredLines` blank lines from the previous non-comment code token to
     * the **start of the docstring**, not to the node keyword itself.
     * This way `beforeFunction: 2` works correctly even when the function has
     * a leading JSDoc / line-comment block.
     */
    function checkLinesBefore (node, requiredLines, nodeType) {
      if (isFirstInParent(node) && ignoreTopLevelCode && isTopLevel(node))
        return

      const docstring     = getDocstringBefore(node)
      const effectiveNode = docstring ?? node // measure TO this node's start

      // Previous non-comment code token (before the docstring if present)
      const prevCode = sourceCode.getTokenBefore(effectiveNode, {
        includeComments: false,
      })
      if (!prevCode)
        return

      // Skip consecutive imports when skipImportGroups is on
      if (skipImportGroups && isImport(node)) {
        const prevNode = sourceCode.getNodeByRangeIndex(prevCode.range[0])
        if (prevNode && isImport(prevNode))
          return
      }

      const blankLines = effectiveNode.loc.start.line - prevCode.loc.end.line - 1

      if (blankLines !== requiredLines)
        context.report({
          node:        effectiveNode,
          messageId:   'missingLinesBefore',
          data: {
            expected: requiredLines,
            actual:   blankLines,
            nodeType,
            lineText: requiredLines === 1 ? 'line' : 'lines',
          },
          fix(fixer) {
            return fixer.replaceTextRange(
              [ prevCode.range[1], effectiveNode.range[0] ],
              '\n'.repeat(requiredLines + 1)
            );
          },
        });

      // Also enforce spacing between docstring end and node start
      if (docstring) {
        const blankBetween = node.loc.start.line - docstring.loc.end.line - 1
        if (blankBetween !== docstringSpacing)
          context.report({
            node,
            messageId: 'incorrectDocstringSpacing',
            data: {
              expected: docstringSpacing,
              actual:   blankBetween,
              nodeType,
              lineText: docstringSpacing === 1 ? 'line' : 'lines',
            },
            fix(fixer) {
              return fixer.replaceTextRange(
                [ docstring.range[1], node.range[0] ],
                '\n'.repeat(docstringSpacing + 1)
              );
            },
          });
      }
    }


    function checkLinesAfter (node, requiredLines, nodeType) {
      if (isLastInParent(node) && (ignoreTopLevelCode && isTopLevel(node)))
        return

      const nextToken = sourceCode.getTokenAfter(node, {
        includeComments: false,
      })
      const nextNode  = nextToken ? sourceCode.getNodeByRangeIndex(nextToken.range[0]) : null

      if (skipImportGroups && isImport(node) && nextNode && isImport(nextNode))
        return

      const nextTokenWithComments = sourceCode.getTokenAfter(node, {
        includeComments: true,
      })
      if (!nextTokenWithComments)
        return

      const blankLines = nextTokenWithComments.loc.start.line - node.loc.end.line - 1

      if (blankLines !== requiredLines)
        context.report({
          node,
          messageId: "missingLinesAfter",
          data: {
            expected: requiredLines,
            actual: blankLines,
            nodeType,
            lineText: requiredLines === 1 ? "line" : "lines",
          },
          fix(fixer) {
            const tokenAfter = sourceCode.getTokenAfter(node, { includeComments: true });
            if (!tokenAfter) {
              return null;
            }

            const range = [node.range[1], tokenAfter.range[0]];
            const newLines = "\n".repeat(requiredLines + 1); // +1 because one newline is the end of the current line

            return fixer.replaceTextRange(range, newLines);
          },
        });
    }


    return {
      ImportDeclaration (node) {
        checkLinesBefore(node, beforeImports, 'import declaration')
        checkLinesAfter(node, afterImports, 'import declaration')
      },
      ExportNamedDeclaration (node) {
        checkLinesBefore(node, beforeExports, 'export declaration')
        checkLinesAfter(node, afterExports, 'export declaration')
      },
      ExportDefaultDeclaration (node) {
        checkLinesBefore(node, beforeExports, 'export declaration')
        checkLinesAfter(node, afterExports, 'export declaration')
      },
      ExportAllDeclaration (node) {
        checkLinesBefore(node, beforeExports, 'export declaration')
        checkLinesAfter(node, afterExports, 'export declaration')
      },
      ClassDeclaration (node) {
        checkLinesBefore(node, beforeClass, 'class declaration')
        checkLinesAfter(node, afterClass, 'class declaration')
      },
      FunctionDeclaration (node) {
        checkLinesBefore(node, beforeFunction, 'function declaration')
        checkLinesAfter(node, afterFunction, 'function declaration')
      },
      BlockComment (node) {
        if (node.loc.start.column === 0)
          checkLinesBefore(node, beforeComment, 'block comment')
      },
    }
  },
}
