import React from 'react'

function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <h1>Marketing Campaign Orchestrator</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  )
}

export default TestApp
