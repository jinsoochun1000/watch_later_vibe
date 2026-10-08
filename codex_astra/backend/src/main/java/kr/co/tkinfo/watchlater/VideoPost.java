package kr.co.tkinfo.watchlater;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "WL_ASTRA_POSTS")
public class VideoPost {
    public enum Status { NEW, DONE }
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq")
    @SequenceGenerator(name = "post_seq", sequenceName = "WL_ASTRA_POST_SEQ", allocationSize = 1)
    Long id;
    @Column(nullable = false, length = 200) String title;
    @Column(name = "VIDEO_URL", nullable = false, length = 1000) String videoUrl;
    @Column(name = "VIDEO_ID", nullable = false, length = 11) String videoId;
    @Lob String content;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) Status status;
    @Column(nullable = false, length = 50) String author;
    @Column(name = "CREATED_AT", nullable = false) OffsetDateTime createdAt;
    @Column(name = "UPDATED_AT", nullable = false) OffsetDateTime updatedAt;
    @Version Long version;
    protected VideoPost() {}
}
