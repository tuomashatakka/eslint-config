/**
 * @fileoverview Formatting and structure rules for CSS files linted with the `css/css` language from @eslint/css.
 */
import blockPadding from './rules/block-padding.mjs'
import blockSpacing from './rules/block-spacing.mjs'
import declarationSpacing from './rules/declaration-spacing.mjs'
import indent from './rules/indent.mjs'
import preferNesting from './rules/prefer-nesting.mjs'


export const rules = {
  'block-padding':       blockPadding,
  'block-spacing':       blockSpacing,
  'declaration-spacing': declarationSpacing,
  'indent':              indent,
  'prefer-nesting':      preferNesting,
}


export default { rules }
