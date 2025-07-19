// Complex TypeScript patterns test
import type { FC, PropsWithChildren } from 'react'


type ComplexType<T> = {
  [K in keyof T]: T[K] extends string
    ? `processed_${T[K]}`
    : T[K]
}


interface GenericInterface<T, U = string> {
  data:      T
  meta:      U
  transform: (input: T) => U
}


const complexObject = {
  nested: {
    deeply: {
      buried: {
        value: 'found'
      }
    }
  },
  array: [
    { id: 1, name: 'first' },
    { id: 2, name: 'second' },
    { id: 3, name: 'third' }
  ],
  methods: {
    process:  (data: unknown[]) => data.filter(Boolean),
    validate: (input: string) => input.length > 0
  }
}


function complexFunction<T extends Record<string, unknown>> (
  input: T,
  config: {
    validate?:  boolean
    transform?: (item: T) => T
    fallback?:  T
  } = {}
): T | null {
  const { validate = true, transform, fallback } = config


  if (validate && !input)
    return fallback || null


  const result = transform ? transform(input) : input


  return result
}


class GenericClass<T> {
  private data: T[]

  constructor (initialData: T[] = []) {
    this.data = initialData
  }

  add (item: T): void {
    this.data.push(item)
  }


  get (index: number): T | undefined {
    return this.data[index]
  }


  filter (predicate: (item: T) => boolean): T[] {
    return this.data.filter(predicate)
  }


  map<U>(transform: (item: T) => U): U[] {
    return this.data.map(transform)
  }
}


const ternaryChain = (value: number) =>
  value > 100
    ? 'large'
    : value > 50
      ? 'medium'
      : value > 10
        ? 'small'
        : 'tiny'


type PropsType = {
  name:          string
  age:           number
  location?:     { city?: string; country?: string }
  [key: string]: unknown
}

const destructuringExample = ({
  name,
  age,
  location: { city, country } = {},
  ...rest
}: PropsType) => ({
  displayName: name,
  years:       age,
  place:       city && country ? `${city}, ${country}` : 'Unknown',
  metadata:    rest
})

export type { ComplexType, GenericInterface }

export { GenericClass, complexFunction, destructuringExample, ternaryChain }
