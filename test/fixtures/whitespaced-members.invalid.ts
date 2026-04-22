import path from 'path'


type ResultsType = { passed: number; failed: number; errors: string[] }


class TestRunner {
  fixturesDir: string

  configPath: string

  results: ResultsType

  constructor () {
    this.fixturesDir = path.join('/test', 'fixtures')
    this.configPath  = path.join('/test', '../index.mjs')
    this.results     = {
      passed: 0,
      failed: 0,
      errors: [],
    }
  }
}
