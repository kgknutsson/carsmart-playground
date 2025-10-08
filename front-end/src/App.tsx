import { useQuery } from 'react-query'

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

async function fetchRecipes(): Promise<Recipe[]> {
  const res = await fetch('/recipes')
  if (!res.ok) {
    throw new Error(`Failed to fetch recipes: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function App() {
  const {
    data: recipes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Recipe[], Error>({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  })

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipes</h1>
      {isLoading && (
        <p className="text-gray-600">Loading recipes…</p>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 mb-3">
          Error loading recipes: {error?.message}
          <button
            onClick={() => refetch()}
            className="ml-3 px-3 py-1 bg-red-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      )}

      {recipes && recipes.length === 0 && (
        <p>No recipes yet.</p>
      )}

      {recipes && recipes.length > 0 && (
        <ul className="space-y-3">
          {recipes.map((r: Recipe) => (
            <li key={r.id} className="p-3 border rounded">
              <div className="font-medium">#{r.id} — {r.description}</div>
              <div className="text-sm text-gray-600">
                Ingredients: {r.ingredients.join(', ')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
