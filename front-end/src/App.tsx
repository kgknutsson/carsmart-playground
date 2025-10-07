import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [hello, setHello] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHello = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/hello')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      setHello(text)
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch on mount
    fetchHello()
  }, [])

  return (
    <div className="App">
      <h1>Backend call</h1>
      <button onClick={fetchHello} disabled={loading}>
        {loading ? 'Calling /hello…' : 'Call /hello'}
      </button>
      <div>
        {error && <p style={{ color: 'salmon' }}>Error: {error}</p>}
        {!error && hello && <p>Backend says: {hello}</p>}
      </div>
    </div>
  )
}

export default App
