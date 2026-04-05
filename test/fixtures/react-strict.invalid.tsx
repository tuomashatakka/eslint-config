/* eslint-disable whitespaced/consistent-line-spacing */


import React, { useState, useEffect } from 'react'

// expect-warning: react-strict/prefer-no-use-effect
const BadComponent = () => {
  const [ data, setData ] = useState([])
  useEffect(() => {
    fetch('/api').then(r => r.json())
      .then(setData)
  }, [])

  return <div>
    {/* expect-warning: react-strict/no-nested-divs */}
    <div>
      <p>Nested div is bad</p>
    </div>

    {/* expect-warning: react-strict/no-style-prop */}
    <span style={{ color: 'red' }}>styled inline</span>

    {/* expect-warning: react-strict/no-complex-jsx-map */}
    {data.map((item: string) => {
      if (item === 'special')
        return <strong key={ item }>Special</strong>

      return <span key={ item }>{item}</span>
    })}
  </div>
}

export default BadComponent
