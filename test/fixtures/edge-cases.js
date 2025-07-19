// Edge cases and tricky formatting scenarios
import './styles.css'


// Template literals and complex strings
const complexTemplate = `
  This is a multiline
  template literal with ${`nested ${`deeply ${`template`} literals`}`}
  and various formatting challenges
`


// Regular expressions and special characters
const regexPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]+$/,
  url:   /^https?:\/\/.+$/
}


// Chained method calls
const chainedOperations = [ 1, 2, 3, 4, 5 ]
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((acc, val) => acc + val, 0)


// Complex conditional logic
const complexCondition = (a, b, c) => a && b || c && !a ? 'condition met' : a > b && c < 10 ? 'alternate condition' : 'default case'


// Object with computed properties
const dynamicKeys = {
  [`key_${Date.now()}`]: 'dynamic value',
  [Symbol.iterator]:     function*() {
    yield 1
    yield 2
    yield 3
  },
  [Symbol.toStringTag]: 'CustomObject'
}


// Async/await with error handling
const asyncErrorHandling = async () => {
  try {
    const results = await Promise.all([
      fetch('/api/users'),
      fetch('/api/posts'),
      fetch('/api/comments')
    ])


    return await Promise.all(
      results.map(response => response.json())
    )
  }
  catch (error) {
    console.error('Failed to fetch data:', error)
    throw new Error('Data fetching failed')
  }
  finally {
    console.log('Cleanup completed')
  }
}


// Arrow functions with various patterns
const arrowFunctionPatterns = {
  simple:     x => x * 2,
  withParens: x => x * 2,
  multiParam: (x, y) => x + y,
  withBody:   x => {
    const result = x * 2
    return result
  },
  async: async x => {
    const result = await processValue(x)
    return result
  },
  destructured: ({ name, age }) => `${name} is ${age} years old`
}


// Switch statement with complex cases
const complexSwitch = (type, data) => {
  switch (type) {
    case 'USER':
    case 'ADMIN': {
      const { permissions } = data

      return permissions.includes('read')
        ? 'access granted'
        : 'access denied'
    }
    case 'GUEST':

      return 'limited access'
    default:

      throw new Error(`Unknown user type: ${type}`)
  }
}


// Export patterns

export {
  complexTemplate,
  regexPatterns,
  chainedOperations,
  complexCondition,
  dynamicKeys,
  asyncErrorHandling,
  arrowFunctionPatterns,
  complexSwitch
}

export default complexCondition
