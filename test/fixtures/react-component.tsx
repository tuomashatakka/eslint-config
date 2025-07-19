// React TypeScript component test
import React, { useState, useEffect } from 'react'


interface Props {
  title:    string
  count?:   number
  onUpdate: (value: number) => void
}


interface State {
  isLoading: boolean
  data:      string[]
}


const TestComponent: React.FC<Props> = ({ title, count = 0, onUpdate }) => {
  const [ state, setState ] = useState<State>({
    isLoading: false,
    data:      []
  })


  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true }))

      try {
        const response                                                                                                                                                                                                                                                                                                                                                                                                                                     = await fetch('/api/data')
        const data                                                                                                                                                                                                                                                                                                                                                                                                                           = await response.json()

        setState(prev => ({
          ...prev,
          isLoading: false,
          data
        }))
      }
      catch (error) {
        console.error('Failed to fetch data:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }


    fetchData()
  }, [])


  const handleClick = (value: number) => {
    onUpdate(value)
  }


  const renderItem = (item: string, index: number) =>
    <li key={ index } className="list-item">
      {item}
    </li>


  if (state.isLoading)
    return <div className="loading">
      <span>Loading...</span>
    </div>


  return <div className="container">
    <h1>{title}</h1>

    <div className="content">
      <button
        onClick={ () => handleClick(count + 1) }
        disabled={ state.isLoading }>
        Click me ({count})
      </button>

      <ul className="data-list">
        {state.data.map(renderItem)}
      </ul>
    </div>
  </div>
}

export default TestComponent
