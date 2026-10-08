package kr.co.tkinfo.watchlater.service;

import kr.co.tkinfo.watchlater.domain.Post;
import kr.co.tkinfo.watchlater.domain.PostStatus;
import kr.co.tkinfo.watchlater.dto.PostCreateRequest;
import kr.co.tkinfo.watchlater.dto.PostResponse;
import kr.co.tkinfo.watchlater.dto.PostUpdateRequest;
import kr.co.tkinfo.watchlater.mapper.PostMapper;
import kr.co.tkinfo.watchlater.repository.PostQueryRepository;
import kr.co.tkinfo.watchlater.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostQueryRepository postQueryRepository;
    private final PostMapper postMapper;

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts(String keyword, PostStatus status) {
        List<Post> posts = postQueryRepository.searchPosts(keyword, status);
        return posts.stream()
                .map(PostResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. (ID: " + id + ")"));
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse createPost(PostCreateRequest request, String username) {
        Post post = Post.builder()
                .title(request.getTitle())
                .videoUrl(request.getVideoUrl())
                .content(request.getContent())
                .status(request.getStatus() != null ? request.getStatus() : PostStatus.NEW)
                .author(username)
                .build();

        Post saved = postRepository.save(post);
        log.info("[Post Created] ID: {}, Title: {}, Author: {}", saved.getId(), saved.getTitle(), saved.getAuthor());
        return PostResponse.from(saved);
    }

    @Transactional
    public PostResponse updatePost(Long id, PostUpdateRequest request, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. (ID: " + id + ")"));

        // Update post fields
        post.update(request.getTitle(), request.getVideoUrl(), request.getContent(), request.getStatus());
        log.info("[Post Updated] ID: {}, Updated by: {}", post.getId(), username);
        return PostResponse.from(post);
    }

    @Transactional
    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. (ID: " + id + ")"));

        postRepository.delete(post);
        log.info("[Post Deleted] ID: {}, Deleted by: {}", id, username);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        return postMapper.getPostStatistics();
    }
}
