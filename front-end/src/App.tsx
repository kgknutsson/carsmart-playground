import { useQuery } from 'react-query'
import { Container, Typography, Alert, Button, CircularProgress, List, ListItem, ListItemText, Box } from '@mui/material'

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
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Recipes
      </Typography>

      {isLoading && (
        <Box display="flex" alignItems="center" gap={2} my={2}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">Loading recipes…</Typography>
        </Box>
      )}

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          Error loading recipes: {error?.message}
        </Alert>
      )}

      {recipes && recipes.length === 0 && (
        <Typography>No recipes yet.</Typography>
      )}

      {recipes && recipes.length > 0 && (
        <List>
          {recipes.map((r: Recipe) => (
            <ListItem key={r.id} divider>
              <ListItemText
                primary={`#${r.id} — ${r.description}`}
                secondary={`Ingredients: ${r.ingredients.join(', ')}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  )
}

export default App
