/**
 * @fileoverview Simplified ESLint plugin for whitespaced formatting
 * 
 * Retained rules:
 * - aligned-assignments: Enforce vertical alignment for variable assignments and type annotations
 */

import alignedAssignments from './rules/aligned-assignments.mjs'


export default {
  rules: {
    "aligned-assignments": alignedAssignments,
  },
}
