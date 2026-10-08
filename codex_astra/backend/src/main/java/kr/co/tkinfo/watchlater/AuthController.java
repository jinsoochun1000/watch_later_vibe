package kr.co.tkinfo.watchlater;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.security.SecureRandom;
import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final SessionStore sessions;
    private final JwtEncoder encoder;
    private final boolean secure;
    private final String dummyHash;
    public AuthController(UserRepository users, PasswordEncoder passwords, SessionStore sessions, JwtEncoder encoder, @Value("${app.cookie-secure}") boolean secure) {
        this.users=users; this.passwords=passwords; this.sessions=sessions; this.encoder=encoder; this.secure=secure;
        this.dummyHash=passwords.encode("unavailable-account");
    }
    public record Login(@NotBlank @Size(max=50) String username, @NotBlank @Size(max=100) String password) {}
    public record Tokens(String accessToken, String username) {}
    @PostMapping("/login")
    public Tokens login(@Valid @RequestBody Login input, @CookieValue(name="wl_refresh", required=false) String old, HttpServletRequest req, HttpServletResponse res) {
        if (!sessions.allowLogin(req.getRemoteAddr())) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"로그인 시도가 많습니다. 1분 후 다시 시도해 주세요.");
        UserAccount user = users.findById(input.username()).orElse(null);
        boolean matches = passwords.matches(input.password(), user == null ? dummyHash : user.passwordHash);
        if (user == null || !matches) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"아이디 또는 비밀번호가 올바르지 않습니다.");
        if (old != null) sessions.consume(old);
        return issue(user.username,res);
    }
    @PostMapping("/refresh")
    public Tokens refresh(@CookieValue(name="wl_refresh", required=false) String token, HttpServletResponse res) {
        String username = token == null ? null : sessions.consume(token);
        if (username == null || !users.existsById(username)) {
            cookie(res,"",0); throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"다시 로그인해 주세요.");
        }
        return issue(username,res);
    }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name="wl_refresh", required=false) String token, HttpServletResponse res) {
        if (token != null) sessions.consume(token); cookie(res,"",0);
    }
    private Tokens issue(String username, HttpServletResponse res) {
        byte[] bytes = new byte[48]; new SecureRandom().nextBytes(bytes);
        String refresh = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        sessions.save(refresh,username); cookie(res,refresh,604800);
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("watchlater").subject(username).issuedAt(now).expiresAt(now.plusSeconds(900)).build();
        return new Tokens(encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),claims)).getTokenValue(),username);
    }
    private void cookie(HttpServletResponse res, String value, long age) {
        res.addHeader(HttpHeaders.SET_COOKIE,ResponseCookie.from("wl_refresh",value).httpOnly(true).secure(secure).sameSite("Strict").path("/api/auth").maxAge(Duration.ofSeconds(age)).build().toString());
    }
}
