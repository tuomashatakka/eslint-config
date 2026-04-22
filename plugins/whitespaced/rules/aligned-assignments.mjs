/**
 * @fileoverview ESLint rule to enforce vertically aligned assignments
 * @author tuomashatakka
 */

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce vertically aligned assignments in declaration blocks',
      category:    "Stylistic Issues",
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:       "object",
      properties: {
        alignComments:              { type: "boolean", default: false },
        alignLiterals:              { type: "boolean", default: false },
        blockSize:                  { type: "integer", minimum: 2, default: 2 },
        ignoreAdjacent:                { type: "boolean", default: true },
        ignoreIfAssignmentsNotInBlock: { type: "boolean", default: true },
        alignTypes:                 { type: "boolean", default: false },
        ignoreTypesMismatch:        { type: "boolean", default: true },
        alignMemberAssignments:     { type: "boolean", default: true },
      },
      additionalProperties: false,
    },],
    messages: {
      misalignedAssignment: "Assignment operators should be vertically aligned within blocks.",
      misalignedTypes:      "Type declarations should be vertically aligned within blocks.",
    },
  },
  create (context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const options    = context.options[0] || {}

    const alignComments                 = options.alignComments !== undefined ? options.alignComments : false
    const alignLiterals                 = options.alignLiterals !== undefined ? options.alignLiterals : false
    const blockSize                     = options.blockSize !== undefined ? options.blockSize : 2
    const ignoreAdjacent                = options.ignoreAdjacent !== undefined ? options.ignoreAdjacent : true
    const ignoreIfAssignmentsNotInBlock = options.ignoreIfAssignmentsNotInBlock !== undefined ? options.ignoreIfAssignmentsNotInBlock : true
    const alignTypes                    = options.alignTypes !== undefined ? options.alignTypes : false
    const ignoreTypesMismatch           = options.ignoreTypesMismatch !== undefined ? options.ignoreTypesMismatch : true
    const alignMemberAssignments        = options.alignMemberAssignments !== undefined ? options.alignMemberAssignments : true


function getEqualsColumn (declarator) {
      const equalsToken = sourceCode.getTokenBefore(
        declarator.init,
        token => token.value === '='
      )

      return equalsToken ? equalsToken.loc.start.column : null
    }


function getTypeColonColumn (declarator) {
      if (declarator.id && declarator.id.typeAnnotation) {
        const colonToken = sourceCode.getFirstToken(declarator.id.typeAnnotation)
        return colonToken ? colonToken.loc.start.column : null
      }
      return null
    }


function areNodesAdjacent (node1, node2) {
      return node2.loc.start.line === node1.loc.end.line + 1
    }


function haveSameKind (declarations) {
      if (!declarations.length)
        return true

      const firstKind = declarations[0].parent.kind
      return declarations.every(decl => decl.parent.kind === firstKind)
    }


function allHaveTypes (declarations) {
      return declarations.every(decl =>
        decl.id && decl.id.typeAnnotation
      )
    }


function anyHaveTypes (declarations) {
      return declarations.some(decl =>
        decl.id && decl.id.typeAnnotation
      )
    }


function getMaxEqualsColumn (declarations) {
      return Math.max(...declarations.map(getEqualsColumn))
    }


function getMaxTypeColonColumn (declarations) {
      const columns = declarations
        .map(getTypeColonColumn)
        .filter(column => column !== null)

      return columns.length ? Math.max(...columns) : null
    }


function getFixedDeclaration (declarator, targetMaxIdLength, targetMaxTypeLength) {
      const originalText = sourceCode.getText(declarator)
      const idText = sourceCode.getText(declarator.id)
      const initText = declarator.init ? sourceCode.getText(declarator.init) : ''

      const hasType = declarator.id && declarator.id.typeAnnotation
      const typeText = hasType ? sourceCode.getText(declarator.id.typeAnnotation) : ''

      if (!initText)
        return originalText

      let result = idText

      if (hasType && targetMaxTypeLength !== null) {
        const typeLength = typeText.length
        const typePadding = targetMaxTypeLength - typeLength
        result += ' '.repeat(typePadding) + typeText
      }

      const idLength = idText.length + (hasType ? 1 + typeText.length : 0)
      const equalsPadding = targetMaxIdLength - idLength
      result += ' '.repeat(equalsPadding) + '= ' + initText

      return result
    }


function getIdLengthWithType (declarator) {
      const idText = sourceCode.getText(declarator.id)
      if (declarator.id && declarator.id.typeAnnotation) {
        const typeText = sourceCode.getText(declarator.id.typeAnnotation)
        return idText.length + 1 + typeText.length
      }
      return idText.length
    }


function checkAlignment (declarations) {
      if (declarations.length < blockSize)
return;

      if (ignoreIfAssignmentsNotInBlock && !haveSameKind(declarations))
return;

      const maxIdLength = Math.max(...declarations.map(getIdLengthWithType))

      let maxTypeLength = null
      if (alignTypes && anyHaveTypes(declarations)) {
        if (ignoreTypesMismatch && !allHaveTypes(declarations)) {
          // Skip only type alignment but still do equals alignment
        }
        else {
          const typeLengths = declarations
            .map(d => d.id?.typeAnnotation ? sourceCode.getText(d.id.typeAnnotation).length : 0)
            .filter(l => l > 0)
          maxTypeLength = typeLengths.length ? Math.max(...typeLengths) : null
        }
      }

      declarations.forEach(declarator => {
        const currentIdLength = getIdLengthWithType(declarator)

        if (currentIdLength !== maxIdLength)
context.report({
          node: declarator,
          messageId: "misalignedAssignment",
          fix(fixer) {
              return fixer.replaceText(
                declarator,
                getFixedDeclaration(declarator, maxIdLength, maxTypeLength)
              );
            },
        });
      })
    }


function processDeclarationGroup (declarations) {
      if (!declarations.length)
        return;

      const declarationsWithInits = declarations.filter(decl => decl.init)

      if (declarationsWithInits.length < blockSize)
return;

      if (ignoreAdjacent) {
        const adjacentGroups = []
        let currentGroup = [ declarationsWithInits[0] ]

        for (let i = 1; i < declarationsWithInits.length; i++) {
          const prevDecl                    = declarationsWithInits[i - 1]
          const currentDecl                                 = declarationsWithInits[i]

          if (areNodesAdjacent(prevDecl, currentDecl))
currentGroup.push(currentDecl); else {
            if (currentGroup.length >= blockSize)
adjacentGroups.push(currentGroup)
            currentGroup = [ currentDecl ]
          }
        }

        if (currentGroup.length >= blockSize)
adjacentGroups.push(currentGroup)

        adjacentGroups.forEach(checkAlignment)
      }
 else
checkAlignment(declarationsWithInits)
    }


    // ── Member assignment alignment (this.prop = value, obj.prop = value) ────

    function getMemberAssignEqualsColumn (exprStmt) {
      const assignExpr  = exprStmt.expression
      const equalsToken = sourceCode.getTokenBefore(
        assignExpr.right,
        token => token.value === '=' && token.type === 'Punctuator'
      )
      return equalsToken ? equalsToken.loc.start.column : null
    }


function getFixedMemberAssignment (exprStmt, targetMaxLeftLength) {
      const assignExpr = exprStmt.expression
      const left = assignExpr.left
      const right = assignExpr.right
      const leftText = sourceCode.getText(left)
      const rightText = sourceCode.getText(right)

      const leftLength = leftText.length
      const padding = targetMaxLeftLength - leftLength

      return leftText + ' '.repeat(padding) + '= ' + rightText
    }


function getMemberLeftLength (exprStmt) {
      const left = exprStmt.expression.left
      return sourceCode.getText(left).trimEnd().length
    }


function getMemberEqualsColumn (exprStmt) {
      const assignExpr = exprStmt.expression
      const equalsToken = sourceCode.getTokenBefore(
        assignExpr.right,
        token => token.value === '=' && token.type === 'Punctuator'
      )
      return equalsToken ? equalsToken.loc.start.column : null
    }


function checkMemberAlignment (stmts) {
      if (stmts.length < blockSize)
        return;

      const lengths = stmts.map(getMemberLeftLength)
      const maxLength = Math.max(...lengths)

      // Check if already aligned by comparing equals columns
      const equalsColumns = stmts.map(s => getMemberEqualsColumn(s)).filter(c => c !== null)
      if (equalsColumns.length >= 2) {
        const maxCol = Math.max(...equalsColumns)
        const allAligned = equalsColumns.every(c => c === maxCol)
        if (allAligned)
          return
      }

      stmts.forEach(stmt => {
        const length = getMemberLeftLength(stmt)
        if (length !== maxLength)
context.report({
          node: stmt.expression,
          messageId: 'misalignedAssignment',
          fix(fixer) {
              return fixer.replaceText(stmt.expression, getFixedMemberAssignment(stmt, maxLength));
            },
        });
      })
    }


function processMemberAssignments (blockBody) {
      if (!alignMemberAssignments)
        return;

      const memberStmts = blockBody.filter(stmt =>
        stmt.type === 'ExpressionStatement' &&
        stmt.expression &&
        stmt.expression.type === 'AssignmentExpression' &&
        stmt.expression.operator === '=' &&
        stmt.expression.left.type === 'MemberExpression'
      )

      if (memberStmts.length < blockSize)
        return;

      if (ignoreAdjacent) {
        const groups = []
        let group    = [ memberStmts[0] ]

        for (let i = 1; i < memberStmts.length; i++)
if (areNodesAdjacent(memberStmts[i - 1], memberStmts[i])) group.push(memberStmts[i]);
        else {
          if (group.length >= blockSize)
groups.push(group)
            group = [ memberStmts[i] ]
          }
        if (group.length >= blockSize)
          groups.push(group)
        groups.forEach(checkMemberAlignment)
      }
      else
checkMemberAlignment(memberStmts)
    }


    // ── Shared block processor ─────────────────────────────────────────────

    function processBlockVariables (node) {
      const scopeBody    = node.type === 'Program' ? node.body : node.body ? node.body : []
      const declarations = []

      for (const statement of scopeBody)
if (statement.type === 'VariableDeclaration')
        declarations.push(...statement.declarations)

      processDeclarationGroup(declarations)
      processMemberAssignments(scopeBody)
    }


return {
      Program (node) {
        processBlockVariables(node)
      },

      BlockStatement (node) {
        processBlockVariables(node)
      },

      SwitchCase (node) {
        if (!node.consequent)
          return;

        const declarations = []
        const memberStmts  = []

        for (const statement of node.consequent)
if (statement.type === 'VariableDeclaration')
          declarations.push(...statement.declarations)

        processDeclarationGroup(declarations)
        processMemberAssignments(node.consequent)
      },
    }
  },
}
