import { useState } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1 class="text-3xl font-bold underline">
          Hello world!
        </h1>
      </header>
    </div>
  )
}

export default App
