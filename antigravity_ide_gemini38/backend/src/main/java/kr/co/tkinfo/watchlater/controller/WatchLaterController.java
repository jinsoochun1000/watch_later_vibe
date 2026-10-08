package kr.co.tkinfo.watchlater.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.co.tkinfo.watchlater.dto.WatchLaterCreateRequest;
import kr.co.tkinfo.watchlater.dto.WatchLaterResponse;
import kr.co.tkinfo.watchlater.dto.WatchLaterUpdateRequest;
import kr.co.tkinfo.watchlater.service.WatchLaterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "나중에 볼 영상 게시판 API", description = "YouTube 영상 메모 게시판 CRUD 및 상태 변경 API")
@RestController
@RequestMapping("/api/watchlater")
public class WatchLaterController {

    private final WatchLaterService watchLaterService;

    public WatchLaterController(WatchLaterService watchLaterService) {
        this.watchLaterService = watchLaterService;
    }

    @Operation(summary = "게시물 전체 목록 조회", description = "페이징 없이 삭제되지 않은 모든 영상 목록을 최신순으로 반환합니다.")
    @GetMapping
    public ResponseEntity<List<WatchLaterResponse>> getAllPosts() {
        List<WatchLaterResponse> list = watchLaterService.getAllPosts();
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "게시물 상세 조회", description = "단건 게시물 정보를 조회하며 조회수가 1 증가합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<WatchLaterResponse> getPostById(@PathVariable("id") Long id) {
        WatchLaterResponse response = watchLaterService.getPostById(id, true);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "게시물 등록", description = "제목, 영상 URL, 내용 및 신규/완료 여부를 지정하여 새 게시물을 등록합니다.")
    @PostMapping
    public ResponseEntity<WatchLaterResponse> createPost(
            @Valid @RequestBody WatchLaterCreateRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        WatchLaterResponse created = watchLaterService.createPost(request, userId);
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "게시물 수정", description = "제목, 영상 URL, 내용, 신규/완료 상태를 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<WatchLaterResponse> updatePost(
            @PathVariable("id") Long id,
            @Valid @RequestBody WatchLaterUpdateRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        WatchLaterResponse updated = watchLaterService.updatePost(id, request, userId);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "영상 시청 상태 토글", description = "신규('N')와 완료('Y') 상태를 토글 전환합니다.")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<WatchLaterResponse> toggleStatus(
            @PathVariable("id") Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        WatchLaterResponse updated = watchLaterService.toggleWatchStatus(id, userId);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "게시물 삭제", description = "게시물을 논리 삭제(DEL_YN = 'Y') 처리합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @PathVariable("id") Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        watchLaterService.deletePost(id, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "게시물이 삭제되었습니다.", "postId", id));
    }
}
