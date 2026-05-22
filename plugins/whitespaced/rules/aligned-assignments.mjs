/**
 * @fileoverview ESLint rule to enforce vertically aligned assignments
 * @author tuomashatakka
 */

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce vertically aligned assignments in declaration blocks',
      category:    'Stylistic Issues',
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:       'object',
      properties: {
        alignComments:                 { type: 'boolean', default: false },
        alignLiterals:                 { type: 'boolean', default: false },
        blockSize:                     { type: 'integer', minimum: 2, default: 2 },
        ignoreAdjacent:                { type: 'boolean', default: true },
        ignoreIfAssignmentsNotInBlock: { type: 'boolean', default: true },
        alignTypes:                    { type: 'boolean', default: false },
        ignoreTypesMismatch:           { type: 'boolean', default: true },
        alignMemberAssignments:        { type: 'boolean', default: true },
      },
      additionalProperties: false,
    }],
    messages: {
      misalignedAssignment: 'Assignment operators should be vertically aligned within blocks.',
      misalignedTypes:      'Type declarations should be vertically aligned within blocks.',
    },
  },

  create (context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const options    = context.options[0] || {}

    const blockSize                     = options.blockSize !== undefined ? options.blockSize : 2
    const ignoreAdjacent                = options.ignoreAdjacent !== undefined ? options.ignoreAdjacent : true
    const ignoreIfAssignmentsNotInBlock = options.ignoreIfAssignmentsNotInBlock !== undefined ? options.ignoreIfAssignmentsNotInBlock : true
    const alignTypes                    = options.alignTypes !== undefined ? options.alignTypes : false
    const ignoreTypesMismatch           = options.ignoreTypesMismatch !== undefined ? options.ignoreTypesMismatch : true
    const alignMemberAssignments        = options.alignMemberAssignments !== undefined ? options.alignMemberAssignments : true


    // ── Row collection ────────────────────────────────────────────────────

    function findEqualsToken (rightNode) {
      return sourceCode.getTokenBefore(
        rightNode,
        token => token.type === 'Punctuator' && token.value === '='
      )
    }


    function declaratorLhsEnd (declarator) {
      const target = declarator.id?.typeAnnotation ?? declarator.id
      return { col: target.loc.end.column, idx: target.range[1] }
    }


    function declaratorRow (declarator) {
      if (!declarator.init)
        return null

      const equalsToken = findEqualsToken(declarator.init)

      if (!equalsToken)
        return null

      const { col, idx } = declaratorLhsEnd(declarator)

      return {
        reportNode: declarator,
        lhsEndCol:  col,
        lhsEndIdx:  idx,
        equalsToken,
        line:       equalsToken.loc.start.line,
        kind:       declarator.parent.kind,
      }
    }


    function memberAssignmentRow (stmt) {
      const expr = stmt.expression

      if (!expr || expr.type !== 'AssignmentExpression' || expr.operator !== '=' || expr.left.type !== 'MemberExpression')
        return null

      const equalsToken = findEqualsToken(expr.right)

      if (!equalsToken)
        return null

      return {
        reportNode: expr,
        lhsEndCol:  expr.left.loc.end.column,
        lhsEndIdx:  expr.left.range[1],
        equalsToken,
        line:       equalsToken.loc.start.line,
        kind:       'member',
      }
    }


    function collectRows (statements) {
      const rows = []

      for (const stmt of statements)
        if (stmt.type === 'VariableDeclaration') {
          for (const declarator of stmt.declarations) {
            const row = declaratorRow(declarator)
            if (row)
              rows.push(row)
          }
        }
        else if (alignMemberAssignments && stmt.type === 'ExpressionStatement') {
          const row = memberAssignmentRow(stmt)
          if (row)
            rows.push(row)
        }

      return rows
    }


    // ── Adjacency grouping ────────────────────────────────────────────────

    function groupByAdjacency (rows) {
      if (rows.length === 0)
        return []

      const sorted = [ ...rows ].sort((a, b) => a.line - b.line)
      const groups = []
      let current  = [ sorted[0] ]

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const row  = sorted[i]

        if (ignoreAdjacent && row.line !== prev.line + 1) {
          if (current.length >= blockSize)
            groups.push(current)
          current = []
        }

        current.push(row)
      }

      if (current.length >= blockSize)
        groups.push(current)

      return ignoreAdjacent ? groups : (rows.length >= blockSize ? [ sorted ] : [])
    }


    // ── Kind-transition sub-block split ───────────────────────────────────

    function splitByKind (group) {
      if (!ignoreIfAssignmentsNotInBlock)
        return [ group ]

      const subBlocks = []
      let current     = []
      let lockedKind  = null

      for (const row of group)
        if (row.kind === 'member')
          current.push(row)
        else if (lockedKind === null || lockedKind === row.kind) {
          current.push(row)
          lockedKind = row.kind
        }
        else {
          if (current.length >= blockSize)
            subBlocks.push(current)
          current    = [ row ]
          lockedKind = row.kind
        }

      if (current.length >= blockSize)
        subBlocks.push(current)

      return subBlocks
    }


    // ── Alignment check + fix ─────────────────────────────────────────────

    function checkAndFix (subBlock) {
      if (subBlock.length < blockSize)
        return

      const targetEqualsCol = Math.max(...subBlock.map(r => r.lhsEndCol)) + 1
      const allAligned      = subBlock.every(r => r.equalsToken.loc.start.column === targetEqualsCol)

      if (allAligned)
        return

      // Report the entire block as a single issue
      const firstRow = subBlock[0]
      const lastRow  = subBlock[subBlock.length - 1]
      
      context.report({
        loc: {
          start: firstRow.reportNode.loc.start,
          end:   lastRow.reportNode.loc.end,
        },
        messageId: 'misalignedAssignment',
        fix (fixer) {
          const fixes = []
          for (const row of subBlock) {
            const currentCol = row.equalsToken.loc.start.column
            if (currentCol === targetEqualsCol)
              continue

            const desiredPad = targetEqualsCol - row.lhsEndCol
            if (desiredPad >= 1) {
              fixes.push(fixer.replaceTextRange(
                [ row.lhsEndIdx, row.equalsToken.range[0] ],
                ' '.repeat(desiredPad)
              ))
            }
          }
          return fixes.length > 0 ? fixes : null
        },
      })
    }


    // ── Type colon alignment (orthogonal to equals alignment) ─────────────

    function getTypeColonColumn (declarator) {
      if (declarator.id && declarator.id.typeAnnotation) {
        const colonToken = sourceCode.getFirstToken(declarator.id.typeAnnotation)
        return colonToken ? colonToken.loc.start.column : null
      }
      return null
    }


    function checkTypeAlignment (declarators) {
      if (!alignTypes || declarators.length < blockSize)
        return

      const annotated = declarators.filter(d => d.id?.typeAnnotation)

      if (annotated.length < blockSize)
        return

      if (ignoreTypesMismatch && annotated.length !== declarators.length)
        return

      const colonColumns = annotated.map(getTypeColonColumn).filter(c => c !== null)

      if (colonColumns.length < blockSize)
        return

      const maxColonCol = Math.max(...colonColumns)
      const allAligned  = colonColumns.every(c => c === maxColonCol)

      if (allAligned)
        return

      // Report the entire block as a single issue
      const firstDecl = annotated[0]
      const lastDecl  = annotated[annotated.length - 1]
      
      context.report({
        loc: {
          start: firstDecl.loc.start,
          end:   lastDecl.loc.end,
        },
        messageId: 'misalignedTypes',
        fix (fixer) {
          const fixes = []
          for (const declarator of annotated) {
            const colonCol = getTypeColonColumn(declarator)

            if (colonCol === null || colonCol === maxColonCol)
              continue

            const colonToken = sourceCode.getFirstToken(declarator.id.typeAnnotation)
            const idEndIdx   = declarator.id.range[1]
            const desiredPad = maxColonCol - colonToken.loc.start.column

            if (desiredPad > 0) {
              fixes.push(fixer.replaceTextRange(
                [ colonToken.range[0], colonToken.range[0] ],
                ' '.repeat(desiredPad)
              ))
            } else if (desiredPad < 0) {
              // Colon is too far to the right, need to move it left
              // This is more complex, so we'll skip it for now
              continue
            }
          }
          return fixes.length > 0 ? fixes : null
        },
      })
    }


    // ── Block processor ───────────────────────────────────────────────────

    function processStatements (statements) {
      if (!statements || statements.length === 0)
        return

      const rows = collectRows(statements)

      for (const group of groupByAdjacency(rows))
        for (const subBlock of splitByKind(group))
          checkAndFix(subBlock)

      const declarators = []
      for (const stmt of statements)
        if (stmt.type === 'VariableDeclaration')
          for (const declarator of stmt.declarations)
            if (declarator.init)
              declarators.push(declarator)

      checkTypeAlignment(declarators)
    }


    return {
      Program (node) {
        processStatements(node.body)
      },

      BlockStatement (node) {
        processStatements(node.body)
      },

      SwitchCase (node) {
        processStatements(node.consequent)
      },
    }
  },
}
