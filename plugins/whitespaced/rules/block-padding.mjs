/**
 * @fileoverview ESLint rule to enforce whitespaced block padding with docstring support
 * @author tuomashatakka
 */

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce whitespaced block padding with docstring support',
      category:    "Stylistic Issues",
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:       "object",
      properties: {
        rootBlockPadding:          { type: 'integer', minimum: 0, default: 2 },
        nestedBlockPadding:        { type: 'integer', minimum: 0, default: 1 },
        enforceBeginningPadding:   { type: 'boolean', default: false },
        enforceEndPadding:         { type: 'boolean', default: false },
        docstringPadding:          { type: 'integer', minimum: 0, default: 1 },
        treatCommentsAsDocstrings: { type: 'boolean', default: true },
      },
      additionalProperties: false,
    },],
    messages: {
      missingPaddingBetweenRootBlocks:   "Expected {{expected}} empty {{lineText}} between root-level blocks, but found {{actual}}.",
      missingPaddingBetweenNestedBlocks: 'Expected {{expected}} empty {{lineText}} between nested blocks, but found {{actual}}.',
      missingPaddingAtBeginning:         "Expected no empty lines at the beginning of the file.",
      missingPaddingAtEnd:               "Expected {{expected}} empty {{lineText}} at the end of the file, but found {{actual}}.",
      missingPaddingAfterDocstring:      "Expected {{expected}} empty {{lineText}} after docstring, but found {{actual}}.",
    },
  },
  create (context) {
    const sourceCode                          = context.sourceCode || context.getSourceCode()
    const options                             = context.options[0] || {}
    const rootBlockPadding                    = options.rootBlockPadding !== undefined ? options.rootBlockPadding : 2
    const nestedBlockPadding                  = options.nestedBlockPadding !== undefined ? options.nestedBlockPadding : 1
    const enforceBeginningPadding             = options.enforceBeginningPadding !== undefined ? options.enforceBeginningPadding : false
    const enforceEndPadding                   = options.enforceEndPadding !== undefined ? options.enforceEndPadding : false
    const docstringPadding                    = options.docstringPadding !== undefined ? options.docstringPadding : 1
    const treatCommentsAsDocstrings                     = options.treatCommentsAsDocstrings !== undefined ? options.treatCommentsAsDocstrings : true

    function getBlankLinesBetween (node1, node2) {
      const node1End               = node1.loc.end.line
      const node2Start                         = node2.loc.start.line
      return node2Start - node1End - 1
    }


function isDocstring (comment) {
      if (comment.type === 'Block') {
        const commentText                        = comment.value
        const isMultiline                        = commentText.includes('\n');
        const hasDocstringPatterns                             = (/\s*@\w+|param|return|description|example|author/).test(commentText)
        return isMultiline || hasDocstringPatterns
      }
      return false
    }


function getDocstringComments (node) {
      const comments = sourceCode.getCommentsBefore(node)

      if (!comments || !comments.length)
        return []

      if (comments.some(comment => comment.type === 'Block')) {
        const lastBlockComment = [ ...comments ].reverse().find(comment => comment.type === 'Block')
        return lastBlockComment && isDocstring(lastBlockComment)
? [
          lastBlockComment,
        ]
: []
      }

      if (treatCommentsAsDocstrings && comments.some(comment => comment.type === 'Line')) {
        const consecutiveLineComments = []
        let lastLine = -1

        for (let i = comments.length - 1; i >= 0; i--) {
          const comment = comments[i]
          if (comment.type !== 'Line')
            continue;

          if (lastLine === -1 || comment.loc.end.line + 1 === lastLine) {
            consecutiveLineComments.unshift(comment)
            lastLine = comment.loc.start.line
          }
 else 
break;
        }

        if (consecutiveLineComments.length >= 2 ||
            consecutiveLineComments.length === 1 &&
             (/\s*@\w+|param|return|description|example|author/).test(consecutiveLineComments[0].value)) 
return consecutiveLineComments
      }

      return []
    }


function checkDocstringPadding (node) {
      const docstringComments = getDocstringComments(node)

      if (!docstringComments.length)
        return;

      const lastComment                         = docstringComments[docstringComments.length - 1]
      const commentEnd              = lastComment.loc.end.line
      const nodeStart               = node.loc.start.line
      const blankLines              = nodeStart - commentEnd - 1

      if (blankLines !== docstringPadding) 
context.report({
        node,
        messageId: "missingPaddingAfterDocstring",
        data: {
            expected: docstringPadding,
            actual: blankLines,
            lineText: docstringPadding === 1 ? "line" : "lines",
          },
        fix(fixer) {
            const range = [lastComment.range[1], sourceCode.getFirstToken(node).range[0]];
            const newLines = "\n".repeat(docstringPadding + 1);
            return fixer.replaceTextRange(range, newLines);
          },
      });
    }


    function checkRootLevelBlankLines (nodes) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const currentNode                             = nodes[i]
        const nextNode                  = nodes[i + 1]
        const blankLines                = getBlankLinesBetween(currentNode, nextNode)

        if (blankLines !== rootBlockPadding) 
context.report({
          node: nextNode,
          messageId: "missingPaddingBetweenRootBlocks",
          data: {
              expected: rootBlockPadding,
              actual: blankLines,
              lineText: rootBlockPadding === 1 ? "line" : "lines",
            },
          fix(fixer) {
              const endOfCurrentNode = sourceCode.getLastToken(currentNode);
              const startOfNextNode = sourceCode.getFirstToken(nextNode);
              const range = [endOfCurrentNode.range[1], startOfNextNode.range[0]];
              const newLines = "\n".repeat(rootBlockPadding + 1);
              return fixer.replaceTextRange(range, newLines);
            },
        });
      }
    }


    function checkNestedBlankLines (node, bodyNodes) {
      for (let i = 0; i < bodyNodes.length - 1; i++) {
        const currentNode                             = bodyNodes[i]
        const nextNode                  = bodyNodes[i + 1]
        const blankLines                = getBlankLinesBetween(currentNode, nextNode)

        if (blankLines !== nestedBlockPadding) 
context.report({
          node: nextNode,
          messageId: "missingPaddingBetweenNestedBlocks",
          data: {
              expected: nestedBlockPadding,
              actual: blankLines,
              lineText: nestedBlockPadding === 1 ? "line" : "lines",
            },
          fix(fixer) {
              const endOfCurrentNode = sourceCode.getLastToken(currentNode);
              const startOfNextNode = sourceCode.getFirstToken(nextNode);
              const range = [endOfCurrentNode.range[1], startOfNextNode.range[0]];
              const newLines = "\n".repeat(nestedBlockPadding + 1);
              return fixer.replaceTextRange(range, newLines);
            },
        });
      }
    }


    function checkBeginningPadding (firstNode) {
      if (enforceBeginningPadding && firstNode) {
        const startLine = firstNode.loc.start.line

        if (startLine > 1) 
context.report({
          node: firstNode,
          messageId: "missingPaddingAtBeginning",
          fix(fixer) {
              const rangeStart = 0;
              const rangeEnd = sourceCode.getFirstToken(firstNode).range[0];
              const sourceText = sourceCode.getText().substring(0, rangeEnd);
              const contentStart = sourceText.search(/\S/);

              if (contentStart !== -1) {
                return fixer.removeRange([0, contentStart]);
              } else {
                return fixer.removeRange([0, rangeEnd]);
              }
            },
        });
      }
    }


    function checkEndPadding (lastNode) {
      if (enforceEndPadding && lastNode) {
        const sourceText                    = sourceCode.getText()
        const lastNodeEnd                   = lastNode.loc.end.line
        const totalLines                    = sourceText.split('\n').length
        const blankLinesAtEnd                             = totalLines - lastNodeEnd

        if (blankLinesAtEnd !== rootBlockPadding) 
context.report({
          node: lastNode,
          messageId: "missingPaddingAtEnd",
          data: {
              expected: rootBlockPadding,
              actual: blankLinesAtEnd,
              lineText: rootBlockPadding === 1 ? "line" : "lines",
            },
          fix(fixer) {
              const endOfLastNode = sourceCode.getLastToken(lastNode);
              const end = sourceCode.getText().length;
              const newLines = "\n".repeat(rootBlockPadding);
              return fixer.replaceTextRange([endOfLastNode.range[1], end], newLines);
            },
        });
      }
    }


    return {
  Program (node) {
        const body = node.body
        if (body.length === 0) 
return;

        checkBeginningPadding(body[0])
        checkEndPadding(body[body.length - 1])
        checkRootLevelBlankLines(body)

        body.forEach(childNode => {
          checkDocstringPadding(childNode)
        });
      },
  BlockStatement (node) {
        if (node.body.length > 1) {
          checkNestedBlankLines(node, node.body)

          node.body.forEach(childNode => {
            checkDocstringPadding(childNode)
          });
        }
      },
  SwitchStatement (node) {
        if (node.cases.length > 1) checkNestedBlankLines(node, node.cases);
      },
  ClassBody (node) {
        if (node.body.length > 1) {
          checkNestedBlankLines(node, node.body)

          node.body.forEach(childNode => {
            checkDocstringPadding(childNode)
          });
        }
      },
  FunctionDeclaration (node) {
        checkDocstringPadding(node)
      },
  ClassDeclaration (node) {
        checkDocstringPadding(node)
      },
  MethodDefinition (node) {
        checkDocstringPadding(node)
      },
  ArrowFunctionExpression (node) {
        if (node.parent.type === 'VariableDeclarator') checkDocstringPadding(node);
      },
}
  },
}
