package kr.co.tkinfo.watchlater.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.tkinfo.watchlater.config.JwtTokenProvider;
import kr.co.tkinfo.watchlater.domain.User;
import kr.co.tkinfo.watchlater.dto.LoginRequest;
import kr.co.tkinfo.watchlater.dto.LoginResponse;
import kr.co.tkinfo.watchlater.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getUsername(), user.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUsername());

        // Save refresh token to Redis / In-memory
        long validity = jwtTokenProvider.getRefreshTokenValidityInSeconds();
        refreshTokenService.saveRefreshToken(user.getUsername(), refreshToken, validity);

        // Set HttpOnly Cookie
        addRefreshTokenCookie(response, refreshToken, (int) validity);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public LoginResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractCookie(request, REFRESH_TOKEN_COOKIE_NAME);
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("리프레시 토큰이 유효하지 않습니다. 다시 로그인해주세요.");
        }

        String username = jwtTokenProvider.getUsername(refreshToken);
        if (!refreshTokenService.validateRefreshToken(username, refreshToken)) {
            throw new IllegalArgumentException("저장된 리프레시 토큰과 일치하지 않습니다.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtTokenProvider.createAccessToken(user.getUsername(), user.getRole());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getUsername());

        long validity = jwtTokenProvider.getRefreshTokenValidityInSeconds();
        refreshTokenService.saveRefreshToken(username, newRefreshToken, validity);
        addRefreshTokenCookie(response, newRefreshToken, (int) validity);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public void logout(String username, HttpServletResponse response) {
        refreshTokenService.deleteRefreshToken(username);
        addRefreshTokenCookie(response, "", 0);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return Map.of(
                "username", user.getUsername(),
                "role", user.getRole(),
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        );
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(false) // Local development
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }
}
