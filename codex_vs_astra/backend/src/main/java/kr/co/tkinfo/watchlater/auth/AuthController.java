package kr.co.tkinfo.watchlater.auth;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserMapper users;
    private final PasswordEncoder encoder;
    private final TokenService tokens;
    private final boolean secure;
    private final String dummyHash;
    public AuthController(UserMapper users, PasswordEncoder encoder, TokenService tokens, @Value("${app.cookie-secure}") boolean secure) {
        this.users = users; this.encoder = encoder; this.tokens = tokens; this.secure = secure;
        this.dummyHash = encoder.encode("unused-account-password");
    }
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest input, HttpServletResponse response,
                               @CookieValue(name = "wl_refresh", required = false) String oldRefresh) {
        var user = users.find(input.username());
        boolean matches = encoder.matches(input.password(), user == null ? dummyHash : user.passwordHash());
        if (user == null || !matches) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인해 주세요.");
        tokens.revoke(oldRefresh);
        return respond(tokens.issue(user.username()), response);
    }
    @PostMapping("/refresh")
    public LoginResponse refresh(@CookieValue(name = "wl_refresh", required = false) String refresh, HttpServletResponse response) {
        return respond(tokens.rotate(refresh), response);
    }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = "wl_refresh", required = false) String refresh, HttpServletResponse response) {
        tokens.revoke(refresh);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
    }
    private LoginResponse respond(TokenService.Tokens value, HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(value.refreshToken(), TokenService.REFRESH_TTL).toString());
        return new LoginResponse(value.accessToken(), value.username());
    }
    private ResponseCookie cookie(String value, Duration maxAge) {
        return ResponseCookie.from("wl_refresh", value).httpOnly(true).secure(secure).sameSite("Strict").path("/api/auth").maxAge(maxAge).build();
    }
    public record LoginRequest(@NotBlank @Size(max = 50) String username, @NotBlank @Size(max = 100) String password) {
        @Override public String toString() { return "LoginRequest[credentials=REDACTED]"; }
    }
    public record LoginResponse(String accessToken, String username) {
        @Override public String toString() { return "LoginResponse[token=REDACTED]"; }
    }
}
