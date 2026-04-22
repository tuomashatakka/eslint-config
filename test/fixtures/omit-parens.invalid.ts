// expect-warning: omit/omit-unnecessary-parens-brackets
const foo = ('bar')

// expect-warning: omit/omit-unnecessary-parens-brackets
function getValue () {
  return ('value')
}

// expect-warning: omit/omit-unnecessary-parens-brackets
const arr = ([1, 2, 3])

export { foo, getValue, arr }