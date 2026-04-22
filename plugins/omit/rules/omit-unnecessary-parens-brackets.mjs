/**
 * @fileoverview Rule to omit unnecessary parentheses, brackets, and braces
 */

import { isValidDotNotationIdentifier, isDeclaration, isParenthesized } from '../utils.mjs'


export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Omit unnecessary parentheses, brackets, and braces',
      category:    "Stylistic Issues",
      recommended: false,
      url:         null,
    },
    fixable:  "code",
    schema:   [],
    messages: {
      unnecessaryParens:   "Unnecessary parentheses",
      useDotNotation:      "Use dot notation instead of bracket notation",
      unnecessaryBraces:   "Unnecessary curly braces",
    }
  },
  create (context) {
    const sourceCode = context.getSourceCode()


function checkDotNotation (node) {
      if (node.computed &&
        node.property.type === 'Literal' &&
        typeof node.property.value === 'string' &&
        isValidDotNotationIdentifier(node.property.value) &&
        !node.optional
      ) context.report({
          node: node.property,
          messageId: "useDotNotation",
          fix(fixer) {
            const propText      = node.property.value
            const openingBracket = sourceCode.getTokenBefore(node.property)
            const closingBracket = sourceCode.getTokenAfter(node.property)

            if (!openingBracket || openingBracket.value !== '[' || !closingBracket || closingBracket.value !== ']')
              return null

            const textBetweenObjectAndBracket   = sourceCode.text.slice(node.object.range[1], openingBracket.range[0])
            const textBetweenPropertyAndBracket = sourceCode.text.slice(node.property.range[1], closingBracket.range[0])

            if (textBetweenObjectAndBracket.trim() !== '' || textBetweenPropertyAndBracket.trim() !== '')
              return null

            return fixer.replaceTextRange(
              [openingBracket.range[0], closingBracket.range[1]],
              `.${propText}`
            )
          }
        })
    }


function checkUnnecessaryParens (node) {
      if (!node || !isParenthesized(node, sourceCode))
        return

      const parent      = node.parent
      const tokenBefore = sourceCode.getTokenBefore(node)
      const tokenAfter  = sourceCode.getTokenAfter(node)

      if (!tokenBefore || !tokenAfter)
        return

      const reportAndFixUnnecessaryParens = reportedNode => {
        context.report({
          node:      reportedNode,
          loc:       { start: tokenBefore.loc.start, end: tokenAfter.loc.end },
          messageId: 'unnecessaryParens',
          fix:       (fixer) => [ fixer.remove(tokenBefore), fixer.remove(tokenAfter) ],
        })
      }

      if (parent && isParenthesized(parent, sourceCode)) {
        const parentTokenBefore = sourceCode.getTokenBefore(parent)
        const parentTokenAfter  = sourceCode.getTokenAfter(parent)
        if (parentTokenBefore && parentTokenAfter &&
          parentTokenBefore.range[0] === tokenBefore.range[0] - 1 &&
          parentTokenAfter.range[1] === tokenAfter.range[1] + 1) {
          reportAndFixUnnecessaryParens(node)
          return
        }
      }

      if (node.type === 'Literal' || node.type === 'Identifier') {
        if (parent && (
          parent.type === 'VariableDeclarator'  && parent.init      === node ||
          parent.type === 'ReturnStatement'     && parent.argument   === node ||
          parent.type === 'ExpressionStatement' && parent.expression === node ||
          parent.type === 'ArrayExpression'     && parent.elements.includes(node) ||
          parent.type === 'Property'            && parent.value === node && !parent.method && !parent.shorthand
        )) {
          reportAndFixUnnecessaryParens(node)
          return
        }
      }

      if (node.type === 'AwaitExpression' || node.type === 'YieldExpression') {
        if (parent && (
          parent.type === 'ExpressionStatement' ||
          parent.type === 'VariableDeclarator' ||
          parent.type === 'ReturnStatement' ||
          parent.type === 'AssignmentExpression' && parent.right === node
        )) {
          reportAndFixUnnecessaryParens(node)
          return
        }
      }

      if (parent && parent.type === 'ArrowFunctionExpression' && parent.body === node) {
        if (node.type !== 'ObjectExpression') {
          reportAndFixUnnecessaryParens(node)
          return
        }
      }

      if (parent && parent.type === 'ReturnStatement' && parent.argument === node &&
          (node.type === 'JSXElement' || node.type === 'JSXFragment')) {
        context.report({
          node,
          loc:       { start: tokenBefore.loc.start, end: tokenAfter.loc.end },
          messageId: 'unnecessaryParens',
          fix:       (fixer) => {
            const returnToken = sourceCode.getFirstToken(parent)
            return [
              fixer.replaceTextRange([ returnToken.range[1], node.range[0] ], ' '),
              fixer.removeRange([ node.range[1], tokenAfter.range[1] ]),
            ]
          },
        })
        return
      }
    }


function checkUnnecessaryBraces (blockStatement, controllingNode) {
      if (!blockStatement || blockStatement.type !== 'BlockStatement')
        return

      if (blockStatement.body.length !== 1)
        return

      const singleStatement = blockStatement.body[0]

      if (isDeclaration(singleStatement))
        return

      if (controllingNode && controllingNode.type === 'IfStatement' &&
        !controllingNode.alternate &&
        singleStatement.type === 'IfStatement')
        return

      if (singleStatement.type === 'BlockStatement')
        return

      context.report({
        node:      blockStatement,
        messageId: 'unnecessaryBraces',
        fix (fixer) {
          const firstToken = sourceCode.getFirstToken(blockStatement)
          const lastToken  = sourceCode.getLastToken(blockStatement)
          const innerText  = sourceCode.getText(singleStatement)

          if (!firstToken || firstToken.value !== '{' || !lastToken || lastToken.value !== '}')
            return null

          const firstStatementToken = sourceCode.getFirstToken(singleStatement)
          const lastStatementToken  = sourceCode.getLastToken(singleStatement)

          if (firstStatementToken && firstToken.range[1] < firstStatementToken.range[0]) {
            const tokensBefore = sourceCode.getTokensBetween(firstToken, firstStatementToken, {
              includeComments: false,
            })
            if (tokensBefore.length > 0)
              return null
          }

          if (lastStatementToken && lastToken.range[1] < lastStatementToken.range[0]) {
            const tokensAfter = sourceCode.getTokensBetween(lastStatementToken, lastToken, {
              includeComments: false,
            })
            if (tokensAfter.length > 0)
              return null
          }

          return fixer.replaceTextRange(blockStatement.range, innerText)
        },
      })
    }


function checkArrowFunctionBraces (node) {
      if (!node.body || node.body.type !== 'BlockStatement')
        return

      const blockBody = node.body
      if (blockBody.body.length !== 1)
        return

      const singleStatement = blockBody.body[0]
      if (singleStatement.type !== 'ReturnStatement')
        return

      if (!singleStatement.argument)
        return

      const returnedExpression = singleStatement.argument
      const needsParens        = returnedExpression.type === 'ObjectExpression'

      context.report({
        node:      blockBody,
        messageId: 'unnecessaryBraces',
        fix (fixer) {
          const arrowToken     = sourceCode.getTokenBefore(blockBody)
          if (!arrowToken || arrowToken.value !== '=>')
            return null

          const firstBlockToken = sourceCode.getFirstToken(blockBody)
          const lastBlockToken  = sourceCode.getLastToken(blockBody)
          if (!firstBlockToken || firstBlockToken.value !== '{' || !lastBlockToken || lastBlockToken.value !== '}')
            return null

          let expressionText = sourceCode.getText(returnedExpression)

          const textBeforeBlock  = sourceCode.text.slice(arrowToken.range[1], firstBlockToken.range[0])
          if (textBeforeBlock.trim())
            return null

          const returnToken      = sourceCode.getFirstToken(singleStatement)
          const textBeforeReturn = sourceCode.text.slice(firstBlockToken.range[1], returnToken.range[0])
          const textAfterReturn  = sourceCode.text.slice(returnToken.range[1], returnedExpression.range[0])
          const textAfterExpr    = sourceCode.text.slice(returnedExpression.range[1], lastBlockToken.range[0])

          if (textBeforeReturn.trim() || textAfterReturn.trim() || textAfterExpr.trim())
            return null

          if (needsParens && !isParenthesized(returnedExpression, sourceCode))
            expressionText = `(${expressionText})`

          let replacementText = (needsParens || expressionText.startsWith('(') ? '' : ' ') + expressionText
          replacementText = replacementText.replace(/\s+/g, ' ')
          return fixer.replaceTextRange(blockBody.range, replacementText.trim())
        },
      })
    }


return {
      MemberExpression: checkDotNotation,

      VariableDeclarator (node) {
 checkUnnecessaryParens(node.init) 
},
      ExpressionStatement (node) {
 checkUnnecessaryParens(node.expression) 
},
      ReturnStatement (node) {
 checkUnnecessaryParens(node.argument) 
},
      BinaryExpression (node) {
 checkUnnecessaryParens(node.left); checkUnnecessaryParens(node.right) 
},
      LogicalExpression (node) {
 checkUnnecessaryParens(node.left); checkUnnecessaryParens(node.right) 
},
      UnaryExpression (node) {
 checkUnnecessaryParens(node.argument) 
},
      AwaitExpression (node) {
 checkUnnecessaryParens(node.argument) 
},
      YieldExpression (node) {
 checkUnnecessaryParens(node.argument) 
},
      ConditionalExpression (node) {
        checkUnnecessaryParens(node.test)
        checkUnnecessaryParens(node.consequent)
        checkUnnecessaryParens(node.alternate)
      },
      CallExpression (node) {
        node.arguments.forEach(arg => checkUnnecessaryParens(arg))
        checkUnnecessaryParens(node.callee)
      },
      NewExpression (node) {
        node.arguments.forEach(arg => checkUnnecessaryParens(arg))
        checkUnnecessaryParens(node.callee)
      },
      ArrayExpression (node) {
 node.elements.forEach(arg => checkUnnecessaryParens(arg)) 
},
      Property (node) {
 checkUnnecessaryParens(node.value) 
},

      IfStatement (node) {
        checkUnnecessaryBraces(node.consequent, node)
        if (node.alternate && node.alternate.type !== 'IfStatement')
          checkUnnecessaryBraces(node.alternate, node)
      },
      ForStatement (node) {
 checkUnnecessaryBraces(node.body, node) 
},
      ForInStatement (node) {
 checkUnnecessaryBraces(node.body, node) 
},
      ForOfStatement (node) {
 checkUnnecessaryBraces(node.body, node) 
},
      WhileStatement (node) {
 checkUnnecessaryBraces(node.body, node) 
},
      DoWhileStatement (node) {
 checkUnnecessaryBraces(node.body, node) 
},

      ArrowFunctionExpression (node) {
        checkUnnecessaryParens(node.body)
        checkArrowFunctionBraces(node)
      },
    }
  },
}
