type Bag = { texture: { colorSpace: string }, name: number, x: number, b: number, d: number, value: number }


// Case 1: const + member assignment, aligned.
export function caseMergeBlock (bag: Bag) {
  const texture      = bag.texture
  texture.colorSpace = 'srgb'
  return texture
}


// Case 2: off-by-1 cleanly aligned.
export function caseOffByOne () {
  const a  = 1
  const bb = 2
  return a + bb
}


// Case 3: aligned (the long row dictates the target).
export function caseShrink () {
  const a        = 1
  const longname = 2
  return a + longname
}


// Case 4: kind-split groups, each sub-block aligned within itself.
export function caseKindSplit (bag: Bag) {
  const a = 1
  bag.b   = 2

  let c = 3
  bag.d = 4
  c++
  return a + c
}


// Case 5: TS type annotation contributes to LHS-end (here naturally aligned).
export function caseTypeAnnotation () {
  const aa: string = 'x'
  const bb: number = 2
  return aa + bb
}


// Case 6: computed and static member access aligned.
export function caseComputedMix (bag: Bag, key: 'name' | 'x') {
  bag[key] = 1
  bag.x    = 2
  return bag
}


// Case 7: aligned inside SwitchCase.
export function caseSwitch (n: number, bag: Bag) {
  switch (n) {
    case 1: {
      const a = 1
      bag.b   = 2
      return a
    }
  }
  return 0
}
