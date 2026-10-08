package kr.co.tkinfo.watchlater.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class WatchLaterCreateRequest {

    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 200, message = "제목은 최대 200자까지 가능합니다.")
    private String title;

    @NotBlank(message = "영상 URL을 입력해주세요.")
    @Size(max = 500, message = "URL은 최대 500자까지 가능합니다.")
    private String videoUrl;

    private String content;

    private String watchYn = "N"; // 'N': 신규, 'Y': 완료

    public WatchLaterCreateRequest() {}

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

    public String getWatchYn() {
        return watchYn;
    }

    public void setWatchYn(String watchYn) {
        this.watchYn = watchYn;
    }
}
