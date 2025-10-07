package carsmart.demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/rest/controller")
class Controller {

    @GetMapping("/hello")
    fun hello() = "Hello World!"

}