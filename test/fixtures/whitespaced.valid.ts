import path from 'path'
import fs from 'fs'


const shortName = 'hello'


const longValue = 'world'


class DataProcessor {
  static defaultConfig = { verbose: false }

  private name: string

  private data: string[]

  constructor (name: string) {
    this.name = name

    this.data = []
  }

  process (input: string) {
    const trimmed   = input.trim()

    const processed = trimmed.toLowerCase()

    this.data.push(processed)

    return processed
  }
}


function formatOutput (value: string): string {
  const prefix = '[OUT]'

  const result = `${prefix} ${value}`

  return result
}


function parseInput (raw: string): string[] {
  return raw.split('\n').filter(Boolean)
}


export { DataProcessor, formatOutput, parseInput }
