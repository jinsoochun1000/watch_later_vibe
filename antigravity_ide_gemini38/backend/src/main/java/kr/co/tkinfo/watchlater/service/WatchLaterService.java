package kr.co.tkinfo.watchlater.service;

import kr.co.tkinfo.watchlater.domain.User;
import kr.co.tkinfo.watchlater.domain.WatchLater;
import kr.co.tkinfo.watchlater.dto.WatchLaterCreateRequest;
import kr.co.tkinfo.watchlater.dto.WatchLaterResponse;
import kr.co.tkinfo.watchlater.dto.WatchLaterUpdateRequest;
import kr.co.tkinfo.watchlater.repository.UserRepository;
import kr.co.tkinfo.watchlater.repository.WatchLaterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchLaterService {

    private final WatchLaterRepository watchLaterRepository;
    private final UserRepository userRepository;

    public WatchLaterService(WatchLaterRepository watchLaterRepository, UserRepository userRepository) {
        this.watchLaterRepository = watchLaterRepository;
        this.userRepository = userRepository;
    }

    /**
     * 모든 게시물 목록 조회 (페이징 미사용, 활성 게시물 최신순)
     */
    @Transactional(readOnly = true)
    public List<WatchLaterResponse> getAllPosts() {
        List<WatchLater> list = watchLaterRepository.findAllActiveWithAuthor("N");
        return list.stream()
                .map(WatchLaterResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 게시물 단건 상세 조회 (조회수 1 증가 옵션)
     */
    @Transactional
    public WatchLaterResponse getPostById(Long postId, boolean incrementView) {
        WatchLater post = watchLaterRepository.findActiveByIdWithAuthor(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않거나 삭제된 게시물입니다: " + postId));

        if (incrementView) {
            post.incrementViewCnt();
        }

        return WatchLaterResponse.fromEntity(post);
    }

    /**
     * 게시물 등록
     */
    @Transactional
    public WatchLaterResponse createPost(WatchLaterCreateRequest req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("작성자 사용자를 찾을 수 없습니다: " + userId));

        String watchYn = (req.getWatchYn() != null && req.getWatchYn().equalsIgnoreCase("Y")) ? "Y" : "N";
        WatchLater post = new WatchLater(
                req.getTitle().trim(),
                req.getVideoUrl().trim(),
                req.getContent() != null ? req.getContent() : "",
                user.getUserId(),
                watchYn
        );
        post.setAuthor(user);

        WatchLater saved = watchLaterRepository.save(post);
        return WatchLaterResponse.fromEntity(saved);
    }

    /**
     * 게시물 수정 (제목, URL, 내용, 신규/완료 구분)
     */
    @Transactional
    public WatchLaterResponse updatePost(Long postId, WatchLaterUpdateRequest req, Long userId) {
        WatchLater post = watchLaterRepository.findActiveByIdWithAuthor(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않거나 삭제된 게시물입니다: " + postId));

        post.setTitle(req.getTitle().trim());
        post.setVideoUrl(req.getVideoUrl().trim());
        if (req.getContent() != null) {
            post.setContent(req.getContent());
        }
        if (req.getWatchYn() != null) {
            post.setWatchYn(req.getWatchYn().equalsIgnoreCase("Y") ? "Y" : "N");
        }

        WatchLater updated = watchLaterRepository.save(post);
        return WatchLaterResponse.fromEntity(updated);
    }

    /**
     * 게시물 상태 전환 (신규 <-> 완료 토글)
     */
    @Transactional
    public WatchLaterResponse toggleWatchStatus(Long postId, Long userId) {
        WatchLater post = watchLaterRepository.findActiveByIdWithAuthor(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않거나 삭제된 게시물입니다: " + postId));

        String newStatus = "Y".equalsIgnoreCase(post.getWatchYn()) ? "N" : "Y";
        post.setWatchYn(newStatus);
        WatchLater updated = watchLaterRepository.save(post);
        return WatchLaterResponse.fromEntity(updated);
    }

    /**
     * 게시물 삭제 (논리 삭제: DEL_YN = 'Y')
     */
    @Transactional
    public void deletePost(Long postId, Long userId) {
        WatchLater post = watchLaterRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물입니다: " + postId));

        post.setDelYn("Y");
        watchLaterRepository.save(post);
    }
}
