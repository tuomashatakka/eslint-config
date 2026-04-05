#!/usr/bin/env node
import { exec } from 'child_process'
import { promisify } from 'util'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'


const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))


/**
 * Test runner for ESLint configuration
 * Validates that the config works with various code samples
 *
 * Fixture naming conventions:
 *   *.valid.{ext}   — must produce zero errors AND zero warnings
 *   *.invalid.{ext} — must produce expected warnings (annotated with expect-warning: rule-id)
 *   *.<ext>         — must produce zero errors (warnings are tolerated)
 */


class ESLintConfigTester {
  constructor () {
    this.fixturesDir = path.join(__dirname, 'fixtures')
    this.configPath  = path.join(__dirname, '../index.mjs')
    this.results     = {
      passed: 0,
      failed: 0,
      errors: [],
    }
  }


  async runTests () {
    console.log('\n  Running ESLint configuration tests...\n')

    try {
      const fixtures  = await readdir(this.fixturesDir)
      const testFiles = fixtures.filter(file =>
        file.endsWith('.js') ||
        file.endsWith('.jsx') ||
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.mjs'))

      if (testFiles.length === 0) {
        console.log('  No test fixtures found in test/fixtures/')
        return
      }

      for (const file of testFiles)
        await this.testFile(file)

      this.printSummary()
    }
    catch (error) {
      console.error('  Test runner failed:', error.message)
      process.exit(1)
    }
  }


  getFixtureMode (filename) {
    if (filename.includes('.valid.'))
      return 'valid'

    if (filename.includes('.invalid.'))
      return 'invalid'

    return 'standard'
  }


  async parseExpectedWarnings (filepath) {
    const content  = await readFile(filepath, 'utf8')
    const lines    = content.split('\n')
    const expected = []

    for (const line of lines) {
      const match = line.match(/(?:\/\/|{\s*\/\*)\s*expect-warning:\s*([^\s*]+)/)

      if (match)
        expected.push(match[1].trim())
    }

    return expected
  }


  async testFile (filename) {
    const filepath = path.join(this.fixturesDir, filename)
    const mode     = this.getFixtureMode(filename)

    try {
      console.log(`  Testing ${filename} [${mode}]...`)

      const { stdout } = await execAsync(
        `npx eslint "${filepath}" --config "${this.configPath}" --format json`,
        { cwd: path.join(__dirname, '..'), maxBuffer: 1024 * 1024 }
      ).catch(e => ({ stdout: e.stdout, stderr: e.stderr }))

      const results    = JSON.parse(stdout)
      const fileResult = results[0]

      if (!fileResult)
        throw new Error('No ESLint results returned')

      const errorCount   = fileResult.errorCount
      const warningCount = fileResult.warningCount
      const messages     = fileResult.messages

      if (mode === 'valid')
        return this.assertValid(filename, errorCount, warningCount, messages)

      if (mode === 'invalid')
        return await this.assertInvalid(filename, filepath, errorCount, warningCount, messages)

      return this.assertStandard(filename, errorCount, warningCount, messages)
    }
    catch (error) {
      console.log(`    FAIL: ${error.message}`)
      this.results.failed++
      this.results.errors.push({ file: filename, error: error.message })
    }
  }


  assertStandard (filename, errorCount, warningCount, messages) {
    if (errorCount > 0) {
      console.log(`    FAIL — ${errorCount} errors, ${warningCount} warnings`)
      messages.filter(m => m.severity === 2).forEach(msg =>
        console.log(`      Error: ${msg.message} (${msg.ruleId}) [line ${msg.line}]`))
      this.results.failed++
      this.results.errors.push({ file: filename, errors: messages.filter(m => m.severity === 2) })
    }
    else {
      console.log(`    PASS — 0 errors, ${warningCount} warnings`)
      this.results.passed++
    }
  }


  assertValid (filename, errorCount, warningCount, messages) {
    if (errorCount > 0 || warningCount > 0) {
      console.log(`    FAIL — expected 0 issues, got ${errorCount} errors, ${warningCount} warnings`)
      messages.forEach(msg =>
        console.log(`      ${msg.severity === 2 ? 'Error' : 'Warn'}: ${msg.message} (${msg.ruleId}) [line ${msg.line}]`))
      this.results.failed++
      this.results.errors.push({ file: filename, errors: messages })
    }
    else {
      console.log(`    PASS — clean (0 errors, 0 warnings)`)
      this.results.passed++
    }
  }


  async assertInvalid (filename, filepath, errorCount, warningCount, messages) {
    const expected       = await this.parseExpectedWarnings(filepath)
    const warningRuleIds = messages.filter(m => m.severity === 1).map(m => m.ruleId)

    if (errorCount > 0) {
      console.log(`    FAIL — unexpected errors found`)
      messages.filter(m => m.severity === 2).forEach(msg =>
        console.log(`      Error: ${msg.message} (${msg.ruleId}) [line ${msg.line}]`))
      this.results.failed++
      this.results.errors.push({ file: filename, errors: messages.filter(m => m.severity === 2) })
      return
    }

    const missing = expected.filter(rule => !warningRuleIds.includes(rule))

    if (missing.length > 0) {
      console.log(`    FAIL — expected warnings not found: ${missing.join(', ')}`)
      this.results.failed++
      this.results.errors.push({ file: filename, error: `Missing expected warnings: ${missing.join(', ')}` })
    }
    else {
      console.log(`    PASS — ${warningCount} expected warnings from ${expected.length} rules`)
      this.results.passed++
    }
  }


  printSummary () {
    console.log('\n  Test Summary:')
    console.log(`    Passed: ${this.results.passed}`)
    console.log(`    Failed: ${this.results.failed}`)

    if (this.results.failed > 0) {
      console.log('\n  Failures:')
      this.results.errors.forEach(error =>
        console.log(`    ${error.file}: ${error.error || 'ESLint errors'}`))
      process.exit(1)
    }
    else
      console.log('\n  All tests passed!\n')
  }
}


if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ESLintConfigTester()

  tester.runTests()
}


export default ESLintConfigTester
