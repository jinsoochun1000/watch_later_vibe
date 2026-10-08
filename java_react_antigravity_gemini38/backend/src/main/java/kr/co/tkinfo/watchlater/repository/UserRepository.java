package kr.co.tkinfo.watchlater.repository;

import kr.co.tkinfo.watchlater.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLoginId(String loginId);
    Optional<User> findByLoginIdAndUseYn(String loginId, String useYn);
}
