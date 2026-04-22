/**
 * @fileoverview Disallows inline TSTypeLiteral annotations that span multiple lines.
 */

function toPascalCase (str) {
  if (!str)
    return ''
  str = str.replace(/_([a-z])/g, (match, char) => char.toUpperCase())
  return str.charAt(0).toUpperCase() + str.slice(1)
}


/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows inline TSTypeLiteral annotations',
      recommended: false,
      url:         null,
    },
    fixable:  "code",
    schema:   [],
    messages: {
      inlineType: 'Inline type literal annotations are disallowed. Extract to a named interface or type alias.',
    },
  },

  create (context) {
    const sourceCode = context.getSourceCode()


    function findInsertionPointAncestor (startNode) {
      let currentNode = startNode
      const targetAncestorTypes = new Set([
        'VariableDeclaration',
        'FunctionDeclaration',
        'ClassDeclaration',
        'TSInterfaceDeclaration',
        'TSTypeAliasDeclaration',
      ])
      const validParentContextTypes = new Set([
        'Program',
        'BlockStatement',
        'ExportNamedDeclaration',
        'ExportDefaultDeclaration',
      ])

      while (currentNode.parent) {
        if (targetAncestorTypes.has(currentNode.type) && currentNode.parent && validParentContextTypes.has(currentNode.parent.type)) {
          if (currentNode.parent.type === 'ExportNamedDeclaration' || currentNode.parent.type === 'ExportDefaultDeclaration')
            return currentNode.parent
          return currentNode
        }
        if ((currentNode.type === 'ExportNamedDeclaration' || currentNode.type === 'ExportDefaultDeclaration') &&
            currentNode.declaration && targetAncestorTypes.has(currentNode.declaration.type))
          return currentNode

        currentNode = currentNode.parent
        if (currentNode.type === 'Program') {
          if (targetAncestorTypes.has(startNode.type))
            return startNode
          break
        }
      }
      return null
    }


    function deriveTypeName (typeAnnotationNode) {
      const parent = typeAnnotationNode.parent
      if (!parent)
        return 'ExtractedType'

      try {
        if (parent.type === 'Identifier' && parent.parent && parent.parent.type === 'VariableDeclarator')
          return toPascalCase(parent.name) + 'Type'

        if (parent.type === 'Identifier' && parent.parent && (
          parent.parent.type === 'FunctionDeclaration' ||
          parent.parent.type === 'FunctionExpression' ||
          parent.parent.type === 'ArrowFunctionExpression' ||
          parent.parent.type === 'TSParameterProperty'
        )) {
          if (parent.parent.params && parent.parent.params.includes(parent))
            return toPascalCase(parent.name) + 'Type'
          if (parent.parent.type === 'TSParameterProperty' && parent.parent.parameter === parent)
            return toPascalCase(parent.name) + 'Type'
        }

        if (parent.type === 'ObjectPattern' && parent.parent && (
          parent.parent.type === 'FunctionDeclaration' ||
          parent.parent.type === 'FunctionExpression' ||
          parent.parent.type === 'ArrowFunctionExpression'
        )) {
          const funcName = parent.parent.id?.name
          return funcName ? toPascalCase(funcName) + 'Props' : 'PropsType'
        }

        if (parent.type === 'ArrayPattern' && parent.parent && (
          parent.parent.type === 'FunctionDeclaration' ||
          parent.parent.type === 'FunctionExpression' ||
          parent.parent.type === 'ArrowFunctionExpression'
        ))
          return 'ParamsType'

        if (parent.type === 'PropertyDefinition' && parent.key && parent.key.type === 'Identifier')
          return toPascalCase(parent.key.name) + 'Type'

        if ((parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression' || parent.type === 'ArrowFunctionExpression') &&
            parent.returnType === typeAnnotationNode) {
          const funcName = parent.id?.name
          if (!funcName && parent.parent && parent.parent.type === 'VariableDeclarator' && parent.parent.id.type === 'Identifier')
            return toPascalCase(parent.parent.id.name) + 'ReturnType'
          return toPascalCase(funcName || 'Function') + 'ReturnType'
        }

        if (parent.type === 'TSParameterProperty' && parent.parameter && parent.parameter.type === 'Identifier')
          return toPascalCase(parent.parameter.name) + 'Type'
      }
      catch (e) {
        console.error('Error deriving type name:', e)
      }

      return 'ExtractedType'
    }


    function checkMultilineLiteralInAnnotation (typeAnnotationNode) {
      if (!typeAnnotationNode || typeAnnotationNode.type !== 'TSTypeAnnotation')
        return

      const literalNode = typeAnnotationNode.typeAnnotation

      if (literalNode && literalNode.type === 'TSTypeLiteral')
        context.report({
          node:      literalNode,
          messageId: 'inlineType',
          fix (fixer) {
            const newTypeName        = deriveTypeName(typeAnnotationNode)
            const literalText        = sourceCode.getText(literalNode)
            const typeAliasString    = `type ${newTypeName} = ${literalText};\n\n`
            const insertionAncestor  = findInsertionPointAncestor(typeAnnotationNode)

            if (!insertionAncestor)
              return null

            return [
              fixer.insertTextBefore(insertionAncestor, typeAliasString),
              fixer.replaceText(literalNode, newTypeName),
            ]
          },
        })
    }


    return {
      VariableDeclarator (node) {
        if (node.id && node.id.typeAnnotation)
          checkMultilineLiteralInAnnotation(node.id.typeAnnotation)
      },
      PropertyDefinition (node) {
        if (node.typeAnnotation)
          checkMultilineLiteralInAnnotation(node.typeAnnotation)
      },
      ':function' (node) {
        if (node.returnType)
          checkMultilineLiteralInAnnotation(node.returnType)
        if (node.params)
          for (const param of node.params)
            if (param && param.typeAnnotation)
              checkMultilineLiteralInAnnotation(param.typeAnnotation)
            else if (param.type === 'TSParameterProperty' && param.parameter && param.parameter.typeAnnotation)
              checkMultilineLiteralInAnnotation(param.parameter.typeAnnotation)
      },
    }
  },
}


export default rule
