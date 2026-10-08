package kr.co.tkinfo.watchlater.auth;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class TokenService {
    public static final Duration REFRESH_TTL = Duration.ofDays(7);
    private final JwtEncoder encoder;
    private final StringRedisTemplate redis;
    private final SecureRandom random = new SecureRandom();
    public TokenService(JwtEncoder encoder, StringRedisTemplate redis) { this.encoder = encoder; this.redis = redis; }
    public Tokens issue(String username) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("watchlater").subject(username)
            .issuedAt(now).expiresAt(now.plusSeconds(900)).build();
        String access = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String refresh = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        redis.opsForValue().set(key(refresh), username, REFRESH_TTL);
        return new Tokens(access, refresh, username);
    }
    public Tokens rotate(String refresh) {
        if (refresh == null || refresh.length() > 100) throw unauthorized();
        // GETDEL atomically consumes the old token across all backend instances.
        String username = redis.opsForValue().getAndDelete(key(refresh));
        if (username == null) throw unauthorized();
        return issue(username);
    }
    public void revoke(String refresh) { if (refresh != null && refresh.length() <= 100) redis.delete(key(refresh)); }
    private String key(String token) {
        try {
            return "watchlater:refresh:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
    private ResponseStatusException unauthorized() { return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "다시 로그인해 주세요."); }
    public record Tokens(String accessToken, String refreshToken, String username) {
        @Override public String toString() { return "Tokens[REDACTED]"; }
    }
}
