/**
 * @fileoverview ESLint rule to enforce consistent formatting for multiline objects and arrays
 * @author tuomashatakka
 */

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent formatting for multiline objects and arrays',
      category:    'Stylistic Issues',
      recommended: false,
    },
    fixable: 'whitespace',
    schema:  [{
      type:       'object',
      properties: {
        allowSingleLine: { type: 'boolean', default: true },
        multilineStyle:  { type: 'string',
          enum: [
            'consistent',
            'always',
            'never',
          ],
          default: 'consistent' },
        minItems:               { type: 'integer', minimum: 2, default: 3 },
        maxLineLength:          { type: 'integer', minimum: 40, default: 80 },
        bracketStyle:           { type: 'string', enum: [ 'same-line', 'new-line' ], default: 'same-line' },
        indentation:            { type: 'integer', minimum: 1, default: 2 },
        trailingComma:          { type: 'string', enum: [ 'always', 'never' ], default: 'always' },
        emptyLineBetweenGroups: { type: 'boolean', default: false },
        consistentSpacing:      { type: 'boolean', default: true },
        objectAlignment:        { type: 'string',
          enum: [
            'colon',
            'value',
            'none',
          ],
          default: 'none' },
      },
      additionalProperties: false,
    }],
    messages: {
      singleLineToMultiline:   'Object/array with {{count}} items should be multiline.',
      inconsistentNewlines:    'Object/array items should consistently be on {{style}} lines.',
      incorrectBracketStyle:   'The {{bracket}} bracket should be on a {{style}}.',
      inconsistentIndentation: 'Object/array items should be indented by {{spaces}} spaces.',
      missingTrailingComma:    'Multiline object/array should have trailing commas.',
      unexpectedTrailingComma: 'Multiline object/array should not have trailing commas.',
      inconsistentSpacing:     'Inconsistent spacing in object/array items.',
      incorrectColonAlignment: 'Object property colons should be aligned.'
    },
  },


  create (context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const options    = context.options[0] || {}

    const allowSingleLine        = options.allowSingleLine !== undefined ? options.allowSingleLine : true
    const multilineStyle         = options.multilineStyle !== undefined ? options.multilineStyle : 'consistent'
    const minItems               = options.minItems !== undefined ? options.minItems : 3
    const maxLineLength          = options.maxLineLength !== undefined ? options.maxLineLength : 80
    const bracketStyle           = options.bracketStyle !== undefined ? options.bracketStyle : 'same-line'
    const indentation            = options.indentation !== undefined ? options.indentation : 2
    const trailingComma          = options.trailingComma !== undefined ? options.trailingComma : 'always'
    const emptyLineBetweenGroups = options.emptyLineBetweenGroups !== undefined ? options.emptyLineBetweenGroups : false
    const consistentSpacing      = options.consistentSpacing !== undefined ? options.consistentSpacing : true
    const objectAlignment        = options.objectAlignment !== undefined ? options.objectAlignment : 'none'


    // Returns the number of leading spaces on the line that contains `token`.
    function getLineIndentation (token) {
      const src       = sourceCode.getText()
      const lineStart = src.lastIndexOf('\n', token.range[0]) + 1
      return src.slice(lineStart, token.range[0]).match(/^(\s*)/)[1].length
    }


    function isMultiline (node) {
      const openBracket  = sourceCode.getFirstToken(node)
      const closeBracket = sourceCode.getLastToken(node)

      return openBracket.loc.start.line !== closeBracket.loc.start.line
    }


    function getExpectedIndentation (node) {
      const firstToken = sourceCode.getFirstToken(node)
      return getLineIndentation(firstToken) + indentation
    }


    function wouldExceedMaxLineLength (node) {
      const firstToken  = sourceCode.getFirstToken(node)
      const lastToken   = sourceCode.getLastToken(node)
      const startColumn = firstToken.loc.start.column

      const singleLineText = sourceCode.getText().substring(
        firstToken.range[0],
        lastToken.range[1]
      )
        .replace(/\n\s*/g, ' ')

      return startColumn + singleLineText.length > maxLineLength
    }


    function allElementsOnSameLine (node, elements) {
      if (!elements.length)
        return true

      const firstElementLine = elements[0].loc.start.line
      return elements.every(element => element.loc.start.line === firstElementLine)
    }


    function allElementsOnSeparateLines (node, elements) {
      if (!elements.length)
        return true

      const openingBracket = sourceCode.getFirstToken(node)
      const closingBracket = sourceCode.getLastToken(node)

      if (bracketStyle === 'new-line' && openingBracket.loc.start.line === elements[0].loc.start.line)
        return false

      for (let i = 0; i < elements.length - 1; i++)
        if (elements[i].loc.end.line === elements[i + 1].loc.start.line)
          return false

      if (elements.length > 0 && elements[elements.length - 1].loc.end.line === closingBracket.loc.start.line)
        return false

      return true
    }


    function hasConsistentColonSpacing (node) {
      if (node.type !== 'ObjectExpression' || !node.properties.length)
        return true

      const properties = node.properties.filter(prop => prop.type === 'Property')
      if (properties.length <= 1)
        return true

      const spacings = properties.map(prop => {
        const colon = sourceCode.getTokenBefore(prop.value, token => token.value === ':')
        if (!colon)
          return null

        const beforeSpace = colon.range[0] - sourceCode.getTokenBefore(colon).range[1]
        const afterSpace  = sourceCode.getTokenAfter(colon).range[0] - colon.range[1]

        return { beforeSpace, afterSpace }
      }
      ).filter(Boolean)

      if (spacings.length <= 1)
        return true

      const firstSpacing = spacings[0]
      return spacings.every(spacing =>
        spacing.beforeSpace === firstSpacing.beforeSpace &&
        spacing.afterSpace === firstSpacing.afterSpace
      )
    }


    function createFixedText (node, elements) {
      const sourceText     = sourceCode.getText()
      const isObj          = node.type === 'ObjectExpression'
      const openingBracket = isObj ? '{' : '['
      const closingBracket = isObj ? '}' : ']'
      // Use line-base indentation (matches @stylistic/indent behavior)
      const nodeIndent = getLineIndentation(sourceCode.getFirstToken(node))
      const indent     = ' '.repeat(nodeIndent)
      const itemIndent = ' '.repeat(nodeIndent + indentation)

      let fixedText = ''

      // Opening bracket
      if (bracketStyle === 'same-line')
        fixedText += openingBracket; else
        fixedText += openingBracket + '\n' + itemIndent

      // Empty object/array
      if (elements.length === 0)
        return fixedText + closingBracket

      // Handle items
      if (allElementsOnSameLine(node, elements) && allowSingleLine &&
          elements.length < minItems && !wouldExceedMaxLineLength(node)) {
        // Single line format
        const items = elements.map(el => sourceText.slice(el.range[0], el.range[1])).join(', ')
        fixedText += ' ' + items + ' ' + closingBracket
      }
      else {
        // Multiline format
        fixedText += '\n'

        // For objects, calculate alignment if necessary
        let colonPos = 0
        if (isObj && objectAlignment === 'colon')
          colonPos = Math.max(...elements
            .filter(el => el.type === 'Property' && el.key)
            .map(el => {
              const keyText = sourceText.slice(el.key.range[0], el.key.range[1])
              return keyText.length
            })
          )

        // Add each element
        elements.forEach((element, i) => {
          let elementText = sourceText.slice(element.range[0], element.range[1])

          // Handle object property alignment
          if (isObj && element.type === 'Property' && element.key) {
            if (objectAlignment === 'colon') {
              const keyText                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        = sourceText.slice(element.key.range[0], element.key.range[1])
              const colonIndex                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         = elementText.indexOf(':')
              if (colonIndex !== -1) {
                const padding = ' '.repeat(colonPos - keyText.length)
                elementText = keyText + padding + elementText.slice(colonIndex)
              }
            }
          }

          // Add the element with proper indentation
          fixedText += itemIndent + elementText

          // Add comma and newline except for last element if trailing commas are disabled
          if (i < elements.length - 1 || trailingComma === 'always')
            fixedText += ','

          fixedText += '\n'
        })

        // Closing bracket
        fixedText += indent + closingBracket
      }

      return fixedText
    }


    function processObjectExpression (node) {
      if (!node.properties || node.properties.length === 0)
        return

      // Determine if object should be multiline
      const shouldBeMultiline =
        node.properties.length >= minItems ||
        wouldExceedMaxLineLength(node) ||
        multilineStyle === 'always'

      const isNodeMultiline = isMultiline(node)

      // Check if object should be converted to multiline
      if (shouldBeMultiline && !isNodeMultiline && multilineStyle !== 'never') {
        context.report({
          node,
          messageId: 'singleLineToMultiline',
          data:      {
            count: node.properties.length,
          },
          fix (fixer) {
            return fixer.replaceText(
              node,
              createFixedText(node, node.properties)
            )
          },
        })
        return
      }

      // If already multiline, check formatting
      if (isNodeMultiline) {
        const expectedIndent = getExpectedIndentation(node)

        // Check item indentation
        const itemsWithWrongIndent = node.properties.filter(prop => {
          const propToken = sourceCode.getFirstToken(prop)
          return propToken.loc.start.line !== sourceCode.getFirstToken(node).loc.start.line &&
                 propToken.loc.start.column !== expectedIndent
        })

        if (itemsWithWrongIndent.length > 0) {
          context.report({
            node,
            messageId: 'inconsistentIndentation',
            data:      {
              spaces: indentation,
            },
            fix (fixer) {
              return fixer.replaceText(
                node,
                createFixedText(node, node.properties)
              )
            },
          })
          return
        }

        // Check if all items are on separate lines or all on same line
        const allSeparate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             = allElementsOnSeparateLines(node, node.properties)
        const allSame                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   = allElementsOnSameLine(node, node.properties)

        if (!allSeparate && multilineStyle === 'always') {
          context.report({
            node,
            messageId: 'inconsistentNewlines',
            data:      {
              style: 'separate',
            },
            fix (fixer) {
              return fixer.replaceText(
                node,
                createFixedText(node, node.properties)
              )
            },
          })
          return
        }

        // Check trailing comma
        const lastProp                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         = node.properties[node.properties.length - 1]
        const tokenAfterLastProp                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             = sourceCode.getTokenAfter(lastProp)

        if (trailingComma === 'always' && tokenAfterLastProp && tokenAfterLastProp.value !== ',') {
          context.report({
            node,
            messageId: 'missingTrailingComma',
            fix (fixer) {
              return fixer.insertTextAfter(lastProp, ',')
            },
          })
          return
        }
        else if (trailingComma === 'never' && tokenAfterLastProp && tokenAfterLastProp.value === ',') {
          context.report({
            node,
            messageId: 'unexpectedTrailingComma',
            fix (fixer) {
              return fixer.removeRange([
                lastProp.range[1],
                tokenAfterLastProp.range[1],
              ])
            },
          })
          return
        }

        // Check consistent spacing around colons
        if (consistentSpacing && !hasConsistentColonSpacing(node)) {
          context.report({
            node,
            messageId: 'inconsistentSpacing',
            fix (fixer) {
              return fixer.replaceText(
                node,
                createFixedText(node, node.properties)
              )
            },
          })
          return
        }

        // Check colon alignment for multiline objects
        if (objectAlignment === 'colon' && node.properties.length > 1) {
          // Get all property nodes with a key
          const propsWithKeys = node.properties
            .filter(prop => prop.type === 'Property' && prop.key)

          if (propsWithKeys.length <= 1)
            return

          // Find all colons
          const colonPositions = propsWithKeys.map(prop => {
            const colon = sourceCode.getTokenBefore(prop.value, token => token.value === ':')
            return colon ? colon.loc.start.column : null
          }).filter(Boolean)

          // Check if all colons are aligned
          if (colonPositions.length > 1) {
            const firstColonPos = colonPositions[0]
            const allAligned    = colonPositions.every(pos => pos === firstColonPos)

            if (!allAligned)
              context.report({
                node,
                messageId: 'incorrectColonAlignment',
                fix (fixer) {
                  return fixer.replaceText(
                    node,
                    createFixedText(node, node.properties)
                  )
                },
              })
          }
        }
      }
    }


    function processArrayExpression (node) {
      if (!node.elements || node.elements.length === 0)
        return

      // Determine if array should be multiline
      const shouldBeMultiline =
        node.elements.length >= minItems ||
        wouldExceedMaxLineLength(node) ||
        multilineStyle === 'always'

      const isNodeMultiline = isMultiline(node)

      // Check if array should be converted to multiline
      if (shouldBeMultiline && !isNodeMultiline && multilineStyle !== 'never') {
        context.report({
          node,
          messageId: 'singleLineToMultiline',
          data:      {
            count: node.elements.length,
          },
          fix (fixer) {
            return fixer.replaceText(
              node,
              createFixedText(node, node.elements.filter(el => el !== null))
            )
          },
        })
        return
      }

      // If already multiline, check formatting
      if (isNodeMultiline) {
        const expectedIndent = getExpectedIndentation(node)

        // Check item indentation
        const nonNullElements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    = node.elements.filter(el => el !== null)
        const itemsWithWrongIndent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             = nonNullElements.filter(elem => {
          if (!elem)
            return false

          const elemToken = sourceCode.getFirstToken(elem)
          return elemToken.loc.start.line !== sourceCode.getFirstToken(node).loc.start.line &&
                 elemToken.loc.start.column !== expectedIndent
        })

        if (itemsWithWrongIndent.length > 0) {
          context.report({
            node,
            messageId: 'inconsistentIndentation',
            data:      {
              spaces: indentation,
            },
            fix (fixer) {
              return fixer.replaceText(
                node,
                createFixedText(node, nonNullElements)
              )
            },
          })
          return
        }

        // Check if all items are on separate lines or all on same line
        const allSeparate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             = allElementsOnSeparateLines(node, nonNullElements)
        const allSame                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   = allElementsOnSameLine(node, nonNullElements)

        if (!allSeparate && multilineStyle === 'always') {
          context.report({
            node,
            messageId: 'inconsistentNewlines',
            data:      {
              style: 'separate',
            },
            fix (fixer) {
              return fixer.replaceText(
                node,
                createFixedText(node, nonNullElements)
              )
            },
          })
          return
        }

        // Check trailing comma
        if (nonNullElements.length > 0) {
          const lastElem                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           = nonNullElements[nonNullElements.length - 1]
          const tokenAfterLastElem                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 = sourceCode.getTokenAfter(lastElem)

          if (trailingComma === 'always' && tokenAfterLastElem && tokenAfterLastElem.value !== ',') {
            context.report({
              node,
              messageId: 'missingTrailingComma',
              fix (fixer) {
                return fixer.insertTextAfter(lastElem, ',')
              },
            })
            return
          }
          else if (trailingComma === 'never' && tokenAfterLastElem && tokenAfterLastElem.value === ',') {
            context.report({
              node,
              messageId: 'unexpectedTrailingComma',
              fix (fixer) {
                return fixer.removeRange([
                  lastElem.range[1],
                  tokenAfterLastElem.range[1],
                ])
              },
            })
            return
          }
        }
      }
    }


    return {
      ObjectExpression (node) {
        processObjectExpression(node)
      },
      ArrayExpression (node) {
        processArrayExpression(node)
      },
    }
  },
}
