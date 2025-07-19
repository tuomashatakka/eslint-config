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
 */


class ESLintConfigTester {
  constructor () {
    this.fixturesDir = path.join(__dirname, 'fixtures')
    this.configPath = path.join(__dirname, '../index.mjs')
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    }
  }

  async runTests () {
    console.log('🚀 Running ESLint configuration tests...\n')

    try {
      const fixtures  = await readdir(this.fixturesDir)
      const testFiles = fixtures.filter(file => file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts'))

      if (testFiles.length === 0) {
        console.log('⚠️  No test fixtures found in test/fixtures/')
        return
      }

      for (const file of testFiles)
        await this.testFile(file)

      this.printSummary()
    }
    catch (error) {
      console.error('❌ Test runner failed:', error.message)
      process.exit(1)
    }
  }

  async testFile (filename) {
    const filepath = path.join(this.fixturesDir, filename)

    try {
      console.log(`📝 Testing ${filename}...`)

      // Run ESLint on the test file
      const { stdout, stderr } = await execAsync(
        `npx eslint "${filepath}" --config "${this.configPath}" --format json`,
        { cwd: path.join(__dirname, '..') }
      )

      if (stderr && stderr.trim())
        throw new Error(`ESLint stderr: ${stderr}`)

      const results    = JSON.parse(stdout)
      const fileResult = results[0]

      if (!fileResult)
        throw new Error('No ESLint results returned')

      const errorCount   = fileResult.errorCount
      const warningCount = fileResult.warningCount

      if (errorCount > 0) {
        console.log(`  ❌ ${errorCount} errors, ${warningCount} warnings`)
        fileResult.messages.forEach(msg => {
          if (msg.severity === 2)
            console.log(`     Error: ${msg.message} (${msg.ruleId})`)
        })
        this.results.failed++
        this.results.errors.push({
          file:   filename,
          errors: fileResult.messages.filter(m => m.severity === 2)
        })
      }
      else {
        console.log(`  ✅ 0 errors, ${warningCount} warnings`)
        this.results.passed++
      }
    }
    catch (error) {
      console.log(`  ❌ Test failed: ${error.message}`)
      this.results.failed++
      this.results.errors.push({
        file:  filename,
        error: error.message
      })
    }
  }

  printSummary () {
    console.log('\n📊 Test Summary:')
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)

    if (this.results.failed > 0) {
      console.log('\n🔍 Failures:')
      this.results.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.error || 'ESLint errors'}`)
      })
      process.exit(1)
    }
    else
      console.log('\n🎉 All tests passed!')
  }
}


// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ESLintConfigTester()
  tester.runTests()
}

export default ESLintConfigTester
