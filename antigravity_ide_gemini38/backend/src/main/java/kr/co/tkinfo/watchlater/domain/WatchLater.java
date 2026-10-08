package kr.co.tkinfo.watchlater.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_WATCHLATER")
public class WatchLater {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_TB_WATCHLATER_GEN")
    @SequenceGenerator(name = "SEQ_TB_WATCHLATER_GEN", sequenceName = "SEQ_TB_WATCHLATER", allocationSize = 1)
    @Column(name = "POST_ID")
    private Long postId;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "VIDEO_URL", nullable = false, length = 500)
    private String videoUrl;

    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;

    @Column(name = "VIEW_CNT", nullable = false)
    private Long viewCnt = 0L;

    @Column(name = "REG_USER_ID", nullable = false)
    private Long regUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "REG_USER_ID", insertable = false, updatable = false)
    private User author;

    @Column(name = "WATCH_YN", nullable = false, length = 1)
    private String watchYn = "N"; // 'N': 신규, 'Y': 완료

    @Column(name = "DEL_YN", nullable = false, length = 1)
    private String delYn = "N"; // 'N': 활성, 'Y': 삭제

    @Column(name = "REG_DT", nullable = false)
    private LocalDateTime regDt;

    @Column(name = "UPT_DT", nullable = false)
    private LocalDateTime uptDt;

    public WatchLater() {
    }

    public WatchLater(String title, String videoUrl, String content, Long regUserId, String watchYn) {
        this.title = title;
        this.videoUrl = videoUrl;
        this.content = content;
        this.regUserId = regUserId;
        this.watchYn = (watchYn != null && watchYn.equalsIgnoreCase("Y")) ? "Y" : "N";
        this.delYn = "N";
        this.viewCnt = 0L;
        this.regDt = LocalDateTime.now();
        this.uptDt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.regDt == null) {
            this.regDt = LocalDateTime.now();
        }
        if (this.uptDt == null) {
            this.uptDt = LocalDateTime.now();
        }
        if (this.viewCnt == null) {
            this.viewCnt = 0L;
        }
        if (this.watchYn == null) {
            this.watchYn = "N";
        }
        if (this.delYn == null) {
            this.delYn = "N";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.uptDt = LocalDateTime.now();
    }

    public void incrementViewCnt() {
        if (this.viewCnt == null) {
            this.viewCnt = 1L;
        } else {
            this.viewCnt++;
        }
    }

    // Getters and Setters
    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getViewCnt() {
        return viewCnt;
    }

    public void setViewCnt(Long viewCnt) {
        this.viewCnt = viewCnt;
    }

    public Long getRegUserId() {
        return regUserId;
    }

    public void setRegUserId(Long regUserId) {
        this.regUserId = regUserId;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getWatchYn() {
        return watchYn;
    }

    public void setWatchYn(String watchYn) {
        this.watchYn = watchYn;
    }

    public String getDelYn() {
        return delYn;
    }

    public void setDelYn(String delYn) {
        this.delYn = delYn;
    }

    public LocalDateTime getRegDt() {
        return regDt;
    }

    public void setRegDt(LocalDateTime regDt) {
        this.regDt = regDt;
    }

    public LocalDateTime getUptDt() {
        return uptDt;
    }

    public void setUptDt(LocalDateTime uptDt) {
        this.uptDt = uptDt;
    }
}
