/**
 * @fileoverview Prefer native CSS nesting: a top-level rule whose selector extends another
 * top-level rule's selector (`.card:hover`, `.card .title`, `.card > .body`) and an at-rule
 * that only styles one top-level rule (`@media (...) { .card { } }`) belong inside that
 * rule's block. Keeps every component's styles grouped in one module-like block.
 * @author tuomashatakka
 */

const DEFAULT_IGNORE = [ ':root', 'html', 'body', '*' ]

const NESTABLE_AT_RULES = new Set([ 'media', 'container', 'supports', 'starting-style' ])

const BOUNDARY = /^[\s>+~:.#[]/

const COMBINATOR = /^[\s>+~]/


function selectorsOf (sourceCode, rule) {
  const children = rule.prelude && rule.prelude.children
  return children ? children.map(selector => sourceCode.getText(selector).trim()) : null
}


/**
 * Nested form of `selector` relative to `parent`, or null when `selector` does not extend `parent`
 */
function nestedForm (selector, parent) {
  if (selector === parent || !selector.startsWith(parent))
    return null

  const suffix = selector.slice(parent.length)

  if (!BOUNDARY.test(suffix))
    return null

  return COMBINATOR.test(suffix) ? suffix.trim() : `&${suffix}`
}


/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer nesting rules and at-rules that extend a top-level rule inside that rule',
      category:    'Best Practices',
      recommended: false,
    },
    schema: [{
      type:       'object',
      properties: {
        ignore:  { type: 'array', items: { type: 'string' }, uniqueItems: true },
        atRules: { type: 'boolean', default: true },
      },
      additionalProperties: false,
    }],
    messages: {
      nestRule:   'Selector `{{selector}}` extends `{{parent}}`. Nest it inside the `{{parent}}` block as `{{nested}}`.',
      nestAtRule: '`@{{name}}` only styles `{{parent}}`. Nest it inside the `{{parent}}` block.',
    },
  },
  create (context) {
    const sourceCode   = context.sourceCode
    const options      = context.options[0] || {}
    const ignore       = new Set(options.ignore || DEFAULT_IGNORE)
    const checkAtRules = options.atRules !== false

    function findParent (parents, selectors) {
      for (const parent of parents) {
        const nested = selectors.map(selector => nestedForm(selector, parent))

        if (nested.every(Boolean))
          return { parent, nested: nested.join(', ') }
      }

      return null
    }

    function stylesOnly (parents, rules) {
      const selectorLists = rules.map(rule => selectorsOf(sourceCode, rule))

      if (selectorLists.some(list => !list))
        return null

      return parents.find(parent =>
        selectorLists.every(list =>
          list.every(selector => selector === parent || nestedForm(selector, parent)))) || null
    }

    function checkRules (parents, entries) {
      for (const { rule, selectors } of entries) {
        const match = findParent(parents, selectors)

        if (match)
          context.report({
            node:      rule,
            messageId: 'nestRule',
            data:      { selector: selectors.join(', '), parent: match.parent, nested: match.nested },
          })
      }
    }

    function checkAtRulesIn (parents, children) {
      for (const node of children) {
        if (node.type !== 'Atrule' || !node.block || !NESTABLE_AT_RULES.has(node.name))
          continue

        const rules = node.block.children

        if (!rules.length || !rules.every(child => child.type === 'Rule'))
          continue

        const parent = stylesOnly(parents, rules)

        if (parent)
          context.report({ node, messageId: 'nestAtRule', data: { name: node.name, parent }})
      }
    }

    return {
      StyleSheet (node) {
        const entries = node.children
          .filter(child => child.type === 'Rule')
          .map(rule => ({ rule, selectors: selectorsOf(sourceCode, rule) }))
          .filter(entry => entry.selectors)

        const parents = entries
          .filter(entry => entry.selectors.length === 1 && !ignore.has(entry.selectors[0]))
          .map(entry => entry.selectors[0])
          .sort((a, b) => b.length - a.length)

        checkRules(parents, entries)

        if (checkAtRules)
          checkAtRulesIn(parents, node.children)
      },
    }
  },
}
