package kr.co.tkinfo.watchlater.service;

import kr.co.tkinfo.watchlater.config.JwtTokenProvider;
import kr.co.tkinfo.watchlater.domain.User;
import kr.co.tkinfo.watchlater.dto.LoginRequest;
import kr.co.tkinfo.watchlater.dto.LoginResponse;
import kr.co.tkinfo.watchlater.dto.UserDto;
import kr.co.tkinfo.watchlater.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String loginId = request.getLoginId().trim();
        String rawPassword = request.getUserPw();

        User user = userRepository.findByLoginId(loginId)
                .orElseGet(() -> {
                    // 기본 계정 stk1 이 없을 경우 자동 생성 지원
                    if ("stk1".equalsIgnoreCase(loginId)) {
                        User newUser = new User();
                        newUser.setLoginId("stk1");
                        newUser.setUserNm("stk1");
                        newUser.setUserPw(passwordEncoder.encode("stk1"));
                        newUser.setEmail("stk1@tkinfo.co.kr");
                        newUser.setUseYn("Y");
                        return userRepository.save(newUser);
                    }
                    throw new IllegalArgumentException("존재하지 않는 사용자 계정입니다: " + loginId);
                });

        if (!"Y".equalsIgnoreCase(user.getUseYn())) {
            throw new IllegalStateException("비활성화된 계정입니다.");
        }

        boolean matches = passwordEncoder.matches(rawPassword, user.getUserPw());
        if (!matches && rawPassword.equals(user.getUserPw())) {
            // 평문 비밀번호가 저장되어 있을 경우 BCrypt 암호화로 업데이트
            user.setUserPw(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            matches = true;
        }

        if (!matches) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.generateToken(user.getUserId(), user.getLoginId());
        return new LoginResponse(token, user.getUserId(), user.getLoginId(), user.getUserNm());
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + loginId));
        return UserDto.fromEntity(user);
    }
}
