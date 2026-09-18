/**
 * @fileoverview Shared helpers for css-strict rules operating on the @eslint/css (css-tree) AST.
 * All positions are absolute offsets into `sourceCode.text`; `loc` columns are 1-based like css-tree.
 */

const WHITESPACE = /\s/


/**
 * Offset to line/column lookup for a source text
 */
export class Positions {
  constructor (text) {
    this.text       = text
    this.lineStarts = [ 0 ]

    for (let i = 0; i < text.length; i++)
      if (text[i] === '\n')
        this.lineStarts.push(i + 1)
  }

  lineOf (offset) {
    let low  = 0
    let high = this.lineStarts.length - 1

    while (low < high) {
      const mid = Math.ceil((low + high) / 2)

      if (this.lineStarts[mid] <= offset)
        low = mid
      else
        high = mid - 1
    }

    return low + 1
  }

  lineStartOf (offset) {
    return this.lineStarts[this.lineOf(offset) - 1]
  }

  locOf (offset) {
    const line = this.lineOf(offset)
    return { line, column: offset - this.lineStarts[line - 1] + 1 }
  }
}


export function skipWhitespace (text, offset, direction = 1) {
  let i = offset

  while (i >= 0 && i < text.length && WHITESPACE.test(text[i]))
    i += direction

  return i
}


/**
 * End offset of a node's content: trailing whitespace excluded, terminating semicolon included
 */
export function contentEnd (text, node) {
  const end  = skipWhitespace(text, node.loc.end.offset - 1, -1) + 1
  const next = skipWhitespace(text, end)
  return text[next] === ';' ? next + 1 : end
}


/**
 * Narrow the whitespace gap between two offsets around comments: a comment on the
 * previous node's last line extends the previous node, any later comment becomes
 * the start of the next node.
 * @returns {[number, number]} `[end, start]` offsets of the pure-whitespace gap
 */
export function gapBetween (sourceCode, positions, prevEnd, nextStart) {
  let end   = prevEnd
  let start = nextStart

  for (const comment of sourceCode.comments) {
    const commentStart = comment.loc.start.offset
    const commentEnd   = comment.loc.end.offset

    if (commentStart < end || commentEnd > start)
      continue

    if (positions.lineOf(commentStart) === positions.lineOf(end))
      end = commentEnd
    else {
      start = commentStart
      break
    }
  }

  return [ end, start ]
}


export function newlinesIn (text) {
  return (text.match(/\n/g) || []).length
}


export function indentFor (depth, size) {
  return ' '.repeat(Math.max(depth, 0) * size)
}


/**
 * Nesting depth of a node: the number of `Block` ancestors
 */
export function blockDepth (sourceCode, node) {
  return sourceCode.getAncestors(node).filter(ancestor => ancestor.type === 'Block').length
}
