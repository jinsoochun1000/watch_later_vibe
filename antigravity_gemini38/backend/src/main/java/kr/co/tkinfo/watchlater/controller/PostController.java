package kr.co.tkinfo.watchlater.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.co.tkinfo.watchlater.domain.PostStatus;
import kr.co.tkinfo.watchlater.dto.ApiResponse;
import kr.co.tkinfo.watchlater.dto.PostCreateRequest;
import kr.co.tkinfo.watchlater.dto.PostResponse;
import kr.co.tkinfo.watchlater.dto.PostUpdateRequest;
import kr.co.tkinfo.watchlater.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Posts", description = "YouTube 영상 게시판 API")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @Operation(summary = "게시물 전체 목록 조회", description = "페이징 없이 전체 게시물 목록을 조회합니다. 검색어 및 상태 필터링을 지원합니다.")
    @GetMapping
    public ApiResponse<List<PostResponse>> getAllPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PostStatus status
    ) {
        List<PostResponse> posts = postService.getAllPosts(keyword, status);
        return ApiResponse.success(posts);
    }

    @Operation(summary = "게시물 상세 조회", description = "ID로 특정 게시물의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getPost(@PathVariable Long id) {
        PostResponse post = postService.getPost(id);
        return ApiResponse.success(post);
    }

    @Operation(summary = "게시물 등록", description = "새로운 YouTube 영상 게시물을 등록합니다.")
    @PostMapping
    public ApiResponse<PostResponse> createPost(
            @Valid @RequestBody PostCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        PostResponse post = postService.createPost(request, username);
        return ApiResponse.success("게시물이 성공적으로 등록되었습니다.", post);
    }

    @Operation(summary = "게시물 수정", description = "게시물의 제목, 영상 URL, 내용, 상태를 수정합니다.")
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        PostResponse post = postService.updatePost(id, request, username);
        return ApiResponse.success("게시물이 성공적으로 수정되었습니다.", post);
    }

    @Operation(summary = "게시물 삭제", description = "게시물을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        postService.deletePost(id, username);
        return ApiResponse.success("게시물이 삭제되었습니다.", null);
    }

    @Operation(summary = "게시물 통계 조회 (MyBatis)", description = "MyBatis 매퍼를 통해 전체/신규/완료 게시물 통계를 조회합니다.")
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getStatistics() {
        Map<String, Object> statistics = postService.getStatistics();
        return ApiResponse.success(statistics);
    }
}
