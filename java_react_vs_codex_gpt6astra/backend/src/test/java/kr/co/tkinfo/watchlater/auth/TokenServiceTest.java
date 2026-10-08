package kr.co.tkinfo.watchlater.auth;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class TokenServiceTest {
    @Test @SuppressWarnings("unchecked") void refreshIsSingleUseAndStoredHashed() {
        var redis = mock(StringRedisTemplate.class);
        ValueOperations<String, String> values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        var encoder = mock(JwtEncoder.class);
        when(encoder.encode(any())).thenReturn(Jwt.withTokenValue("access").header("alg", "HS256").subject("stk1").issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(900)).build());
        var service = new TokenService(encoder, redis);
        when(values.getAndDelete(anyString())).thenReturn("stk1", (String) null);
        var result = service.rotate("old-refresh");
        assertThat(result.username()).isEqualTo("stk1");
        verify(values).set(argThat(key -> key.startsWith("watchlater:refresh:") && !key.contains(result.refreshToken())), eq("stk1"), eq(TokenService.REFRESH_TTL));
        assertThatThrownBy(() -> service.rotate("old-refresh")).isInstanceOf(ResponseStatusException.class);
        service.revoke(result.refreshToken());
        verify(redis).delete(anyString());
    }
}
