package kr.co.tkinfo.watchlater.dto;

import kr.co.tkinfo.watchlater.domain.WatchLater;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class WatchLaterResponse {
    private Long postId;
    private String title;
    private String videoUrl;
    private String content;
    private Long viewCnt;
    private Long regUserId;
    private String authorName;
    private String authorLoginId;
    private String watchYn;
    private String delYn;
    private LocalDateTime regDt;
    private LocalDateTime uptDt;
    private String youtubeVideoId;

    public WatchLaterResponse() {}

    public static WatchLaterResponse fromEntity(WatchLater entity) {
        WatchLaterResponse res = new WatchLaterResponse();
        res.setPostId(entity.getPostId());
        res.setTitle(entity.getTitle());
        res.setVideoUrl(entity.getVideoUrl());
        res.setContent(entity.getContent());
        res.setViewCnt(entity.getViewCnt());
        res.setRegUserId(entity.getRegUserId());
        if (entity.getAuthor() != null) {
            res.setAuthorName(entity.getAuthor().getUserNm());
            res.setAuthorLoginId(entity.getAuthor().getLoginId());
        } else {
            res.setAuthorName("User #" + entity.getRegUserId());
            res.setAuthorLoginId("user" + entity.getRegUserId());
        }
        res.setWatchYn(entity.getWatchYn());
        res.setDelYn(entity.getDelYn());
        res.setRegDt(entity.getRegDt());
        res.setUptDt(entity.getUptDt());
        res.setYoutubeVideoId(extractYoutubeId(entity.getVideoUrl()));
        return res;
    }

    public static String extractYoutubeId(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }
        String pattern = "(?:youtube(?:-nocookie)?\\.com\\/(?:[^\\/\\n\\s]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/|youtube\\.com\\/shorts\\/)([a-zA-Z0-9_-]{11})";
        Pattern compiledPattern = Pattern.compile(pattern);
        Matcher matcher = compiledPattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

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

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorLoginId() {
        return authorLoginId;
    }

    public void setAuthorLoginId(String authorLoginId) {
        this.authorLoginId = authorLoginId;
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

    public String getYoutubeVideoId() {
        return youtubeVideoId;
    }

    public void setYoutubeVideoId(String youtubeVideoId) {
        this.youtubeVideoId = youtubeVideoId;
    }
}
