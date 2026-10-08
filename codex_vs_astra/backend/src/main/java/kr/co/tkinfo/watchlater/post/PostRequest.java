package kr.co.tkinfo.watchlater.post;

import jakarta.validation.constraints.*;

public record PostRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank @Size(max = 1000) String videoUrl,
    @Size(max = 10000) String content,
    @NotNull Post.Status status,
    Long version
) {}
