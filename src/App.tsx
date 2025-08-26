import { useState, useEffect } from 'react'
import LotterySystem from './components/LotterySystem'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-orange-400">
      <LotterySystem />
    </div>
  )
}

export default App