#!/usr/bin/env node
import { exec } from 'child_process'
import { promisify } from 'util'
import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'


const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Format testing tool for ESLint configuration
 * Tests that the configuration produces consistent formatting results
 */


class FormatTester {
  constructor () {
    this.fixturesDir = path.join(__dirname, 'fixtures')
    this.configPath = path.join(__dirname, '../index.mjs')
    this.results = {
      tested:    0,
      formatted: 0,
      errors:    []
    }
  }

  async runFormatTests () {
    console.log('🎨 Running ESLint format tests...\n')

    try {
      const fixtures  = await readdir(this.fixturesDir)
      const testFiles = fixtures.filter(file =>
        file.endsWith('.js') ||
        file.endsWith('.jsx') ||
        file.endsWith('.ts') ||
        file.endsWith('.tsx')
      )

      if (testFiles.length === 0) {
        console.log('⚠️  No test fixtures found in test/fixtures/')
        return
      }

      for (const file of testFiles)
        await this.testFormatting(file)

      this.printFormatSummary()
    }
    catch (error) {
      console.error('❌ Format tester failed:', error.message)
      process.exit(1)
    }
  }

  async testFormatting (filename) {
    const filepath = path.join(this.fixturesDir, filename)

    try {
      console.log(`🔧 Testing formatting for ${filename}...`)

      // Read original content
      const originalContent = await readFile(filepath, 'utf8')

      // Run ESLint with --fix to format the code
      const { stdout, stderr } = await execAsync(
        `npx eslint "${filepath}" --config "${this.configPath}" --fix --format json`,
        { cwd: path.join(__dirname, '..') }
      )

      if (stderr && stderr.trim())
        console.log(`  ⚠️  Warnings: ${stderr}`)

      // Read the formatted content
      const formattedContent = await readFile(filepath, 'utf8')

      // Check if content was changed
      const wasFormatted = originalContent !== formattedContent

      if (wasFormatted) {
        console.log(`  ✨ Formatted successfully`)
        this.results.formatted++
      }
      else
        console.log(`  ✅ Already properly formatted`)

      // Parse ESLint results to check for remaining issues
      const results    = JSON.parse(stdout)
      const fileResult = results[0]

      if (fileResult) {
        const errorCount   = fileResult.errorCount
        const warningCount = fileResult.warningCount

        if (errorCount > 0) {
          console.log(`  ❌ ${errorCount} remaining errors after formatting`)
          fileResult.messages.forEach(msg => {
            if (msg.severity === 2)
              console.log(`     Error: ${msg.message} (${msg.ruleId})`)
          })
          this.results.errors.push({
            file:   filename,
            errors: fileResult.messages.filter(m => m.severity === 2)
          })
        }
        else if (warningCount > 0)
          console.log(`  ⚠️  ${warningCount} warnings remaining`)
      }

      this.results.tested++

      // Restore original content for consistent testing
      await writeFile(filepath, originalContent)
    }
    catch (error) {
      console.log(`  ❌ Format test failed: ${error.message}`)
      this.results.errors.push({
        file:  filename,
        error: error.message
      })
    }
  }

  printFormatSummary () {
    console.log('\n📊 Format Test Summary:')
    console.log(`📝 Files tested: ${this.results.tested}`)
    console.log(`✨ Files formatted: ${this.results.formatted}`)
    console.log(`❌ Files with errors: ${this.results.errors.length}`)

    if (this.results.errors.length > 0) {
      console.log('\n🔍 Format Issues:')
      this.results.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.error || 'Formatting errors remain'}`)
        if (error.errors)
          error.errors.forEach(err => {
            console.log(`    - ${err.message} (${err.ruleId})`)
          })
      })
    }

    console.log('\n🎉 Format testing completed!')

    if (this.results.errors.length > 0)
      console.log('💡 Some files had formatting issues. Review the configuration for these rules.')
    else
      console.log('✅ All files formatted successfully with no remaining errors!')
  }

  async demonstrateFormatting () {
    console.log('\n🎯 Demonstrating key formatting rules...\n')

    const examples = [
      {
        name:   'Object alignment',
        before: `const obj = {
name: 'test',
value: 42,
description: 'A test object'
}`,
        rules: [ '@stylistic/key-spacing' ]
      },
      {
        name:   'Array formatting',
        before: `const arr = [ 1, 2, 3, 4, 5 ]`,
        rules:  [ '@stylistic/array-bracket-spacing' ]
      },
      {
        name:   'Function spacing',
        before: `function test( param1,param2 ){
return param1+param2
}`,
        rules: [ '@stylistic/space-before-function-paren', '@stylistic/space-infix-ops' ]
      }
    ]

    examples.forEach(example => {
      console.log(`📋 ${example.name}:`)
      console.log('   Before:', example.before.replace(/\n/g, '\\n'))
      console.log('   Rules: ', example.rules.join(', '))
      console.log()
    })
  }
}


// Run format tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FormatTester()

  if (process.argv.includes('--demo'))
    await tester.demonstrateFormatting()
  else
    await tester.runFormatTests()
}

export default FormatTester
