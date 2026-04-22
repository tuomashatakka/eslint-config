/**
 * @fileoverview Disallows inline type definitions that span multiple lines.
 */
import noInline from './rules/no-inline-multiline-types.mjs'


export default {
  rules: {
    'no-inline-multiline-types': noInline,
  },
}
