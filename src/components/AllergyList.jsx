import { useState } from 'react'

export default function AllergyList({ allergies, loading, onAdd, onRemove }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (onAdd(text)) setText('')
  }

  return (
    <section className="card">
      <h2>My allergies</h2>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : allergies.length === 0 ? (
        <p className="muted">No allergies saved yet.</p>
      ) : (
        <ul className="chips">
          {allergies.map(a => (
            <li key={a.id} className="chip">
              {a.name}
              <button type="button" onClick={() => onRemove(a.id)} aria-label={`Remove ${a.name}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="row" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="add allergy..."
          aria-label="New allergy"
        />
        <button type="submit">Add</button>
      </form>
    </section>
  )
}
