import { useState } from 'react'

export default function DishChecker({ onCheck }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (text.trim()) onCheck(text)
  }

  return (
    <form className="row" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="e.g. pad thai"
        aria-label="Dish name"
      />
      <button type="submit">Check</button>
    </form>
  )
}
