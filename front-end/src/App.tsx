import { useEffect, useMemo, useState } from 'react'
import './App.css'

// Types aligned with backend RecipeController
interface Recipe {
  id: number
  description: string
  ingredients: string[]
}

interface RecipeRequest {
  description: string
  ingredients: string[]
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [description, setDescription] = useState('')
  const [ingredientsText, setIngredientsText] = useState('') // comma separated
  const [editingId, setEditingId] = useState<number | null>(null)

  const ingredientsArray = useMemo(
    () => ingredientsText.split(',').map(s => s.trim()).filter(Boolean),
    [ingredientsText]
  )

  const resetForm = () => {
    setDescription('')
    setIngredientsText('')
    setEditingId(null)
  }

  const loadRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/recipes')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Recipe[] = await res.json()
      setRecipes(data)
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: RecipeRequest = {
      description: description.trim(),
      ingredients: ingredientsArray,
    }
    if (!payload.description) {
      setError('Description is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        editingId ? `/recipes/${editingId}` : '/recipes',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadRecipes()
      resetForm()
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const onEdit = (r: Recipe) => {
    setEditingId(r.id)
    setDescription(r.description)
    setIngredientsText(r.ingredients.join(', '))
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete this recipe?')) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/recipes/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
      await loadRecipes()
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App" style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1>Recipes</h1>

      {error && (
        <div style={{ color: 'salmon', marginBottom: 12 }}>Error: {error}</div>
      )}

      <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
        <h2>{editingId ? 'Edit recipe' : 'Add a new recipe'}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={loading}
            style={{ flex: 2, minWidth: 240 }}
          />
          <input
            type="text"
            placeholder="Ingredients (comma separated)"
            value={ingredientsText}
            onChange={e => setIngredientsText(e.target.value)}
            disabled={loading}
            style={{ flex: 3, minWidth: 280 }}
          />
          <button type="submit" disabled={loading}>
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2>Existing recipes</h2>
        {loading && recipes.length === 0 && <p>Loading…</p>}
        {!loading && recipes.length === 0 && <p>No recipes yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
          {recipes.map(r => (
            <li key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.description}</div>
                  <div style={{ color: '#555' }}>{r.ingredients.join(', ') || '—'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onEdit(r)} disabled={loading}>Edit</button>
                  <button onClick={() => onDelete(r.id)} disabled={loading}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
