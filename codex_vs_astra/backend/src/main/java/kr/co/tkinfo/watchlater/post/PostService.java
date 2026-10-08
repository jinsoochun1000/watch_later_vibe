package kr.co.tkinfo.watchlater.post;

import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class PostService {
    private final PostRepository repository;
    private final JPAQueryFactory query;
    public PostService(PostRepository repository, EntityManager entityManager) {
        this.repository = repository;
        this.query = new JPAQueryFactory(entityManager);
    }
    public List<Post> list() {
        PathBuilder<Post> p = new PathBuilder<>(Post.class, "post");
        return query.selectFrom(p).orderBy(p.getDateTime("createdAt", LocalDateTime.class).desc(), p.getNumber("id", Long.class).desc()).fetch();
    }
    @Transactional
    public Post create(PostRequest request, String author) { return repository.save(new Post(request, author)); }
    @Transactional
    public Post update(long id, PostRequest request) {
        Post post = find(id);
        if (!Objects.equals(request.version(), post.getVersion()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "다른 사용자가 수정했습니다. 목록을 새로고침해 주세요.");
        post.update(request);
        return repository.saveAndFlush(post);
    }
    @Transactional
    public void delete(long id) { repository.delete(find(id)); }
    private Post find(long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시물을 찾을 수 없습니다."));
    }
}
