/**
 * @fileoverview Enforces the order of top-level module definitions.
 */
import topLevelDefinitions from './rules/top-level-definitions.mjs'


export const rules = {
  'top-level-definitions': topLevelDefinitions,
}


export default { rules }
