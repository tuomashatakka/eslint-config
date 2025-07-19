// JSX formatting test cases
import React, { Fragment } from 'react'


const JSXFormattingTest = ({ items, onSelect, className }) => {
  const handleClick = id => {
    onSelect(id)
  }


  return <div className={ `container ${className || ''}` }>
    <h1>JSX Formatting Test</h1>
    {/* Single-line JSX */}
    <p>Simple paragraph</p>

    {/* Multi-line JSX with props */}
    <button
      onClick={ () => handleClick('test') }
      disabled={ !items.length }
      className="primary-button">
      Click me
    </button>

    {/* Conditional rendering */}
    {items.length > 0
      ? <ul className="item-list">
        {items.map((item, index) =>
          <li
            key={ item.id || index }
            className={ item.active ? 'active' : 'inactive' }
            onClick={ () => handleClick(item.id) }>
            <span>{item.name}</span>

            {item.description &&
                <small>{item.description}</small>
            }
          </li>
        )}
      </ul>
      : <div className="empty-state">
        <p>No items found</p>

        <button onClick={ () => handleClick('refresh') }>
          Refresh
        </button>
      </div>
    }

    {/* Fragment usage */}
    <div>Fragment content 1</div>
    <div>Fragment content 2</div>

    {/* Short-circuit rendering */}
    {items.length > 5 &&
        <div className="overflow-indicator">
          Showing {items.length} items
        </div>
    }

    {/* Complex nested JSX */}
    <div className="complex-layout">
      <header>
        <h2>Section Header</h2>

        <nav>
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>

      <main>
        <section className="content">
          <article>
            <h3>Article Title</h3>

            <p>
              This is a paragraph with
              {' '}
              <strong>bold text</strong>
              {' '}
              and
              {' '}
              <em>italic text</em>
              .
            </p>
          </article>
        </section>
      </main>
    </div>

    {/* Self-closing tags */}
    <input
      type="text"
      placeholder="Enter text"
      onChange={ e => handleClick(e.target.value) } />

    <img src="/placeholder.jpg" alt="Placeholder" />
    <br />

    {/* JSX expressions */}
    <div>
      Current time: {new Date().toLocaleTimeString()}
    </div>

    <div>
      Math result: {2 + 2 === 4 ? 'Correct' : 'Error'}
    </div>
  </div>
}


// Higher-order component pattern
const withLoading = Component => ({ isLoading, ...props }) => {
  if (isLoading)
    return <div className="loading-spinner">
      {' '}
      <span>Loading...</span>
      {' '}
    </div>
  return <Component { ...props } />
}


// Component with render prop
const DataProvider = ({ children, data }) => {
  const enhancedData = data.map(item => ({
    ...item,
    processed: true,
  }))


  return children(enhancedData)
}

export default JSXFormattingTest

export { withLoading, DataProvider }
