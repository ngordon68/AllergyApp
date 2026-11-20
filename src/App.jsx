import { useEffect, useState } from 'react'
import './App.css'
import AllergyList from './components/AllergyList.jsx'
import DishChecker from './components/DishChecker.jsx'
import ResultBanner from './components/ResultBanner.jsx'
import History from './components/History.jsx'
import { checkDish, normalize } from './checkDish.js'
import { loadEntries } from './api.js'

function App() {
  const [allergies, setAllergies] = useState([])
  const [history, setHistory] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false // skip stale results (StrictMode runs effects twice in dev)
    loadEntries()
      .then(data => {
        if (ignore) return
        setAllergies(data.allergies)
        setHistory(data.history)
      })
      .catch(err => {
        if (!ignore) setError(err.message || String(err))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  // Returns true when the allergy was added, so the input can clear.
  function addAllergy(text) {
    const name = normalize(text)
    if (!name) return false
    if (allergies.some(a => a.name === name)) return false
    setAllergies(prev => [...prev, { id: crypto.randomUUID(), name }])
    return true
  }

  function removeAllergy(id) {
    setAllergies(prev => prev.filter(a => a.id !== id))
  }

  function runCheck(text) {
    const r = checkDish(text, allergies.map(a => a.name))
    setResult(r)
    setHistory(prev => [
      {
        id: crypto.randomUUID(),
        kind: 'check',
        name: r.name,
        matched_allergens: r.matched,
        is_safe: r.isSafe,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 20))
  }

  return (
    <main className="app">
      <h1>Allergy Checker</h1>

      {error && (
        <div className="banner danger" role="alert">
          Couldn't load your data: {error}
        </div>
      )}

      <AllergyList allergies={allergies} loading={loading} onAdd={addAllergy} onRemove={removeAllergy} />

      <section className="card">
        <h2>Check a dish</h2>
        <DishChecker onCheck={runCheck} />
        <ResultBanner result={result} />
      </section>

      <History rows={history} loading={loading} />

      <footer className="muted">Not medical advice. Always ask staff.</footer>
    </main>
  )
}

export default App
