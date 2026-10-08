package kr.co.tkinfo.watchlater.dto;

import jakarta.validation.constraints.NotBlank;
import kr.co.tkinfo.watchlater.domain.PostStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostUpdateRequest {

    @NotBlank(message = "영상 제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "영상 URL을 입력해주세요.")
    private String videoUrl;

    private String content;

    private PostStatus status;
}
