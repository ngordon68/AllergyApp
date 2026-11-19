import { useEffect, useState } from 'react'

function timeAgo(iso, now) {
  const secs = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function History({ rows }) {
  const [now, setNow] = useState(() => Date.now())

  // Re-render every 30s so "2m ago" stays current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="card">
      <h2>Recent checks</h2>
      {rows.length === 0 ? (
        <p className="muted">No checks yet.</p>
      ) : (
        <ul className="history">
          {rows.map(row => (
            <li key={row.id}>
              <span className="history-name">
                {row.is_safe ? '✅' : '⚠️'} {row.name}
                {!row.is_safe && row.matched_allergens?.length > 0 && (
                  <span className="muted"> — {row.matched_allergens.join(', ')}</span>
                )}
              </span>
              <span className="muted history-time">{timeAgo(row.created_at, now)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
