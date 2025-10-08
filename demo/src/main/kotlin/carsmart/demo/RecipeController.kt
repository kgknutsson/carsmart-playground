package carsmart.demo

import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

// Simple in-memory models
data class Recipe(
    val id: Long,
    val description: String,
    val ingredients: List<String>
)

data class RecipeRequest(
    val description: String,
    val ingredients: List<String>
)

@RestController
@RequestMapping("/recipes")
class RecipeController {

    // Thread-safe in-memory storage as requested
    private val store = ConcurrentHashMap<Long, Recipe>()
    private val idSeq = AtomicLong(1)

    init {
        store[1] = Recipe(1, "Pasta", listOf("tomato", "pasta"))
        store[2] = Recipe(2, "Rice", listOf("rice", "oil"))
        store[3] = Recipe(3, "Noodles", listOf("noodles", "pasta"))
        store[4] = Recipe(4, "Spaghetti", listOf("spaghetti", "pasta"))
        store[5] = Recipe(5, "Cat Food", listOf("Can of cat food", "clams", "truffles"))
    }

    @GetMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    fun listAll(): List<Recipe> = store.values.sortedBy { it.id }

    @GetMapping("/{id}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getById(@PathVariable id: Long): ResponseEntity<Recipe> =
        store[id]?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()

    @PostMapping(consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun create(@RequestBody req: RecipeRequest): ResponseEntity<Recipe> {
        if (req.description.isBlank()) return ResponseEntity.badRequest().build()
        val id = idSeq.getAndIncrement()
        val recipe = Recipe(
            id = id,
            description = req.description,
            ingredients = req.ingredients
        )
        store[id] = recipe
        return ResponseEntity.created(URI.create("/recipes/$id")).body(recipe)
    }

    @PutMapping("/{id}", consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun update(@PathVariable id: Long, @RequestBody req: RecipeRequest): ResponseEntity<Recipe> {
        val existing = store[id] ?: return ResponseEntity.notFound().build()
        if (req.description.isBlank()) return ResponseEntity.badRequest().build()
        val updated = existing.copy(
            description = req.description,
            ingredients = req.ingredients
        )
        store[id] = updated
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) {
        store.remove(id)
    }
}
