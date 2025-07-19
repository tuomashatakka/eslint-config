// Basic JavaScript formatting test
import { useState, useEffect } from 'react'
import lodash from 'lodash'


const testObject = {
  name:   'test',
  value:  42,
  nested: {
    property: 'value'
  }
}


function basicFunction (param1, param2) {
  const result = param1 + param2

  return result
}


const arrowFunction = (x, y) => {
  const calculation = x * y

  return calculation > 100 ? 'large' : 'small'
}


const asyncFunction = async data => {
  const response                                                                                                                                                                                                                                                 = await fetch('/api/data')
  const json                                                                                                                                                                                                                                             = await response.json()

  return json
}


class TestClass {
  constructor (name) {
    this.name = name
  }

  method () {
    return `Hello, ${this.name}`
  }
}


export default basicFunction

export { TestClass, arrowFunction }
