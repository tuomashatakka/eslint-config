// expect-warning: omit/omit-unnecessary-parens-brackets
// Stripping these braces would produce `return 'x' else if (...) return 'red' else return null`
// which is an ASI parse error. The autofix must inject `;` so the result still parses.
export function pickColor (x: unknown): string | null {
  if (x === true) { return 'x' } else if (x === 'blue') { return 'red' } else { return null }
}
