import { titleCase } from '../checkDish.js'

export default function ResultBanner({ result }) {
  if (!result) return null

  let tone, message
  if (!result.isSafe) {
    tone = 'danger'
    message = `⚠️ ${titleCase(result.name)} may contain: ${result.matched.join(', ')}`
  } else if (result.known) {
    tone = 'safe'
    message = '✅ No listed allergens found'
  } else {
    tone = 'unknown'
    message = '❓ Dish not in database; checked the name only'
  }

  return (
    <div className={`banner ${tone}`} role="status">
      {message}
    </div>
  )
}
