package kr.co.tkinfo.watchlater;

import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostRepository posts;
    private final EntityManager em;
    private final PostStatsMapper stats;
    public PostController(PostRepository posts, EntityManager em, PostStatsMapper stats) { this.posts = posts; this.em = em; this.stats = stats; }
    public record Input(@NotBlank @Size(max=200) String title, @NotBlank @Size(max=1000) String videoUrl,
                        @NotNull @Size(max=10000) String content, @NotNull VideoPost.Status status, @PositiveOrZero Long version) {}
    public record View(Long id, String title, String videoUrl, String videoId, String content, VideoPost.Status status,
                       String author, OffsetDateTime createdAt, OffsetDateTime updatedAt, Long version) {
        static View of(VideoPost p) { return new View(p.id,p.title,p.videoUrl,p.videoId,p.content == null ? "" : p.content,p.status,p.author,p.createdAt,p.updatedAt,p.version); }
    }
    @GetMapping @Transactional(readOnly=true)
    public List<View> list() {
        var p = new PathBuilder<>(VideoPost.class, "post");
        return new JPAQueryFactory(em).selectFrom(p).orderBy(p.getDateTime("createdAt", OffsetDateTime.class).desc(), p.getNumber("id", Long.class).desc()).fetch().stream().map(View::of).toList();
    }
    @GetMapping("/stats") public PostStatsMapper.Stats stats() { return stats.stats(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
    public View create(@Valid @RequestBody Input input, Authentication auth) {
        VideoPost p = new VideoPost(); p.author = auth.getName(); p.createdAt = OffsetDateTime.now();
        apply(p,input); return View.of(posts.saveAndFlush(p));
    }
    @PutMapping("/{id}") @Transactional
    public View update(@PathVariable Long id, @Valid @RequestBody Input input) {
        VideoPost p = find(id);
        if (input.version() == null || !input.version().equals(p.version)) throw new ResponseStatusException(HttpStatus.CONFLICT, "다른 사용자가 수정했습니다. 목록을 새로고침해 주세요.");
        apply(p,input); return View.of(posts.saveAndFlush(p));
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
    public void delete(@PathVariable Long id, @RequestParam Long version) {
        VideoPost p = find(id);
        if (!version.equals(p.version)) throw new ResponseStatusException(HttpStatus.CONFLICT, "다른 사용자가 수정했습니다. 목록을 새로고침해 주세요.");
        posts.delete(p); posts.flush();
    }
    private VideoPost find(Long id) { return posts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시물을 찾을 수 없습니다.")); }
    private void apply(VideoPost p, Input input) {
        p.videoId = YoutubeUrl.videoId(input.videoUrl()); p.videoUrl = "https://www.youtube.com/watch?v=" + p.videoId;
        p.title = input.title().trim(); p.content = input.content().trim(); p.status = input.status(); p.updatedAt = OffsetDateTime.now();
    }
}
