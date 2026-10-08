package kr.co.tkinfo.watchlater.post;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService service;
    public PostController(PostService service) { this.service = service; }
    @GetMapping public List<Post> list() { return service.list(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Post create(@Valid @RequestBody PostRequest request, Authentication user) { return service.create(request, user.getName()); }
    @PutMapping("/{id}") public Post update(@PathVariable long id, @Valid @RequestBody PostRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) { service.delete(id); }
}
