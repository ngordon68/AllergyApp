import { DISHES, SYNONYMS } from './dishes.js'

export function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

// True when either string contains the other. The reverse direction
// (allergen contains term) needs 3+ letters so tiny words like "a" don't match.
function overlaps(term, needle) {
  if (term.includes(needle)) return true
  return term.length >= 3 && needle.includes(term)
}

/**
 * Check a dish against saved allergies.
 * @param {string} dishText what the user typed
 * @param {string[]} allergies saved allergy names (lowercase)
 * @returns {{ name: string, known: boolean, matched: string[], isSafe: boolean }}
 */
export function checkDish(dishText, allergies) {
  const name = normalize(dishText)
  const known = Object.hasOwn(DISHES, name)
  const terms = known
    ? DISHES[name]
    : name.split(' ').map(w => w.replace(/[^a-z]/g, '')).filter(Boolean)

  const matched = allergies.filter(allergy => {
    const needles = [allergy, ...(SYNONYMS[allergy] ?? [])]
    return terms.some(term => needles.some(needle => overlaps(term, needle)))
  })

  return { name, known, matched, isSafe: matched.length === 0 }
}

export function titleCase(text) {
  return text.replace(/(^|\s)\S/g, ch => ch.toUpperCase())
}
