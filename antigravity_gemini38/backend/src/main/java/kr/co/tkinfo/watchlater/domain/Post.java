package kr.co.tkinfo.watchlater.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "WLA_POSTS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "wla_post_seq_gen")
    @SequenceGenerator(name = "wla_post_seq_gen", sequenceName = "WLA_POST_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "VIDEO_URL", nullable = false, length = 500)
    private String videoUrl;

    @Lob
    @Column(name = "CONTENT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    private PostStatus status;

    @Column(name = "AUTHOR", nullable = false, length = 50)
    private String author;

    @Builder
    public Post(String title, String videoUrl, String content, PostStatus status, String author) {
        this.title = title;
        this.videoUrl = videoUrl;
        this.content = content;
        this.status = status != null ? status : PostStatus.NEW;
        this.author = author;
    }

    public void update(String title, String videoUrl, String content, PostStatus status) {
        this.title = title;
        this.videoUrl = videoUrl;
        this.content = content;
        if (status != null) {
            this.status = status;
        }
    }
}
