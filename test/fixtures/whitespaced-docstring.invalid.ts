import path from 'path'


// Only 1 blank line before this docstring — should be 2.
function getFixturesDir (): string {
  return path.join('/test', 'fixtures')
}


export { getFixturesDir }
