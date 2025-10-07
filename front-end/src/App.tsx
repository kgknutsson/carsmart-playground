import { useEffect, useState } from 'react'
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
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [editingId, setEditingId] = useState<number | null>(null)


  const resetForm = () => {
    setDescription('')
    setIngredients([''])
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
      ingredients: ingredients.map(s => s.trim()).filter(Boolean),
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
    setIngredients(r.ingredients.length ? r.ingredients : [''])
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
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={loading}
            style={{ width: '100%', minWidth: 240 }}
          />
          <div style={{ minWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: '#444' }}>Ingredients</label>
              <button
                type="button"
                onClick={() => setIngredients([...ingredients, ''])}
                disabled={loading}
                title="Add ingredient"
              >
                Add
              </button>
            </div>
            {ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input
                  type="text"
                  placeholder={`Ingredient #${idx + 1}`}
                  value={ing}
                  onChange={e => {
                    const next = [...ingredients]
                    next[idx] = e.target.value
                    setIngredients(next)
                  }}
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = ingredients.filter((_, i) => i !== idx)
                    setIngredients(next.length ? next : [''])
                  }}
                  disabled={loading}
                  title="Remove ingredient"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading}>
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
            )}
          </div>
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
