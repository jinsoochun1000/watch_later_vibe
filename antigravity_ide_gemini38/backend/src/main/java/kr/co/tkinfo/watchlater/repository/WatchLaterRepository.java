package kr.co.tkinfo.watchlater.repository;

import kr.co.tkinfo.watchlater.domain.WatchLater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchLaterRepository extends JpaRepository<WatchLater, Long> {

    @Query("SELECT w FROM WatchLater w LEFT JOIN FETCH w.author WHERE w.delYn = :delYn ORDER BY w.postId DESC")
    List<WatchLater> findAllActiveWithAuthor(@Param("delYn") String delYn);

    @Query("SELECT w FROM WatchLater w LEFT JOIN FETCH w.author WHERE w.postId = :postId AND w.delYn = 'N'")
    Optional<WatchLater> findActiveByIdWithAuthor(@Param("postId") Long postId);
}
