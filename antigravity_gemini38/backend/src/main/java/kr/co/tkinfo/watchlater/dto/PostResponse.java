package kr.co.tkinfo.watchlater.dto;

import kr.co.tkinfo.watchlater.domain.Post;
import kr.co.tkinfo.watchlater.domain.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String videoUrl;
    private String content;
    private PostStatus status;
    private String statusDescription;
    private String author;
    private String youtubeVideoId;
    private String thumbnailUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com\\/(?:[^\\/\\n\\s]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/|youtube\\.com\\/shorts\\/)([a-zA-Z0-9_-]{11})"
    );

    public static PostResponse from(Post post) {
        String videoId = extractYoutubeId(post.getVideoUrl());
        String thumbnail = (videoId != null && !videoId.isEmpty())
                ? "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg"
                : null;

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .videoUrl(post.getVideoUrl())
                .content(post.getContent())
                .status(post.getStatus())
                .statusDescription(post.getStatus() != null ? post.getStatus().getDescription() : "")
                .author(post.getAuthor())
                .youtubeVideoId(videoId)
                .thumbnailUrl(thumbnail)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public static String extractYoutubeId(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }
        Matcher matcher = YOUTUBE_PATTERN.matcher(url.trim());
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
