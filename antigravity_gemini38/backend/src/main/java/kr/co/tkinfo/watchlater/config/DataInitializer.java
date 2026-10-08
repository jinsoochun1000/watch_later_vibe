package kr.co.tkinfo.watchlater.config;

import kr.co.tkinfo.watchlater.domain.User;
import kr.co.tkinfo.watchlater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        String defaultUsername = "stk1";
        String defaultPassword = "stk1";

        userRepository.findByUsername(defaultUsername).ifPresentOrElse(
                user -> {
                    // Update password to ensure valid BCrypt encoding of "stk1"
                    if (!passwordEncoder.matches(defaultPassword, user.getPassword())) {
                        userRepository.delete(user);
                        userRepository.flush();
                        User updatedUser = User.builder()
                                .username(defaultUsername)
                                .password(passwordEncoder.encode(defaultPassword))
                                .role("ROLE_USER")
                                .build();
                        userRepository.save(updatedUser);
                        log.info("[DataInitializer] Updated password for default user '{}'.", defaultUsername);
                    } else {
                        log.info("[DataInitializer] Default user '{}' already has valid password.", defaultUsername);
                    }
                },
                () -> {
                    User newUser = User.builder()
                            .username(defaultUsername)
                            .password(passwordEncoder.encode(defaultPassword))
                            .role("ROLE_USER")
                            .build();
                    userRepository.save(newUser);
                    log.info("[DataInitializer] Default user '{}' created successfully.", defaultUsername);
                }
        );
    }
}
