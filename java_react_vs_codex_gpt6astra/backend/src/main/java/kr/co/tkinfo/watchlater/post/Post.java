package kr.co.tkinfo.watchlater.post;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "WLC_POSTS")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 200) private String title;
    @Column(name = "VIDEO_URL", nullable = false, length = 1000) private String videoUrl;
    @Lob private String content;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private Status status;
    @Column(nullable = false, length = 50) private String author;
    @Column(name = "CREATED_AT", nullable = false) private LocalDateTime createdAt;
    @Column(name = "UPDATED_AT", nullable = false) private LocalDateTime updatedAt;
    @Version private Long version;
    protected Post() {}
    public Post(PostRequest input, String author) {
        this.author = author;
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
        update(input);
    }
    public void update(PostRequest input) {
        title = input.title().strip();
        videoUrl = YoutubeUrl.normalize(input.videoUrl());
        content = input.content() == null ? "" : input.content().strip();
        status = input.status();
        updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getVideoUrl() { return videoUrl; }
    public String getContent() { return content; }
    public Status getStatus() { return status; }
    public String getAuthor() { return author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Long getVersion() { return version; }
    public enum Status { NEW, DONE }
}
