import { useState } from 'react'
import './App.css'
import AllergyList from './components/AllergyList.jsx'
import DishChecker from './components/DishChecker.jsx'
import ResultBanner from './components/ResultBanner.jsx'
import History from './components/History.jsx'
import { checkDish, normalize } from './checkDish.js'

// Phase 2 fake data. Replaced by Supabase in Phase 3.
const minutesAgo = m => new Date(Date.now() - m * 60_000).toISOString()

const SEED_ALLERGIES = [
  { id: crypto.randomUUID(), name: 'peanuts' },
  { id: crypto.randomUUID(), name: 'shellfish' },
]

const SEED_HISTORY = [
  {
    id: crypto.randomUUID(),
    kind: 'check',
    name: 'pad thai',
    matched_allergens: ['peanuts', 'shellfish'],
    is_safe: false,
    created_at: minutesAgo(2),
  },
  {
    id: crypto.randomUUID(),
    kind: 'check',
    name: 'caesar salad',
    matched_allergens: [],
    is_safe: true,
    created_at: minutesAgo(5),
  },
]

function App() {
  const [allergies, setAllergies] = useState(SEED_ALLERGIES)
  const [history, setHistory] = useState(SEED_HISTORY)
  const [result, setResult] = useState(null)

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

      <AllergyList allergies={allergies} onAdd={addAllergy} onRemove={removeAllergy} />

      <section className="card">
        <h2>Check a dish</h2>
        <DishChecker onCheck={runCheck} />
        <ResultBanner result={result} />
      </section>

      <History rows={history} />

      <footer className="muted">Not medical advice. Always ask staff.</footer>
    </main>
  )
}

export default App
