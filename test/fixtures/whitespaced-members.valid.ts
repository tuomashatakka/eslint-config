import path from 'path'


class TestRunner {
  fixturesDir: string

  configPath: string

  constructor () {
    this.fixturesDir = path.join('/test', 'fixtures')
    this.configPath = path.join('/test', '../index.mjs')
  }
}
