package kr.co.tkinfo.watchlater.repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import kr.co.tkinfo.watchlater.domain.Post;
import kr.co.tkinfo.watchlater.domain.PostStatus;
import kr.co.tkinfo.watchlater.domain.QPost;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostQueryRepository {

    private final JPAQueryFactory queryFactory;

    public List<Post> searchPosts(String keyword, PostStatus status) {
        QPost post = QPost.post;

        return queryFactory
                .selectFrom(post)
                .where(
                        keywordContains(keyword),
                        statusEq(status)
                )
                .orderBy(post.id.desc())
                .fetch();
    }

    private BooleanExpression keywordContains(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        return QPost.post.title.containsIgnoreCase(keyword)
                .or(QPost.post.content.containsIgnoreCase(keyword))
                .or(QPost.post.author.containsIgnoreCase(keyword));
    }

    private BooleanExpression statusEq(PostStatus status) {
        if (status == null) {
            return null;
        }
        return QPost.post.status.eq(status);
    }
}
