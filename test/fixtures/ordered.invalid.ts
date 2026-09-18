export function helper () {
  return 1
}

export const VALUE = helper() // expect-warning: ordered/top-level-definitions

export type Shape = { size: number } // expect-warning: ordered/top-level-definitions

export class Box {
  size = VALUE
} // expect-warning: ordered/top-level-definitions
