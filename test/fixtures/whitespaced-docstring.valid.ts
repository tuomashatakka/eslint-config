import path from 'path'


// Returns the fixtures directory path.
function getFixturesDir (): string {
  return path.join('/test', 'fixtures')
}


// Returns the config file path.
function getConfigPath (): string {
  return path.join('/test', '../index.mjs')
}


export { getFixturesDir, getConfigPath }
