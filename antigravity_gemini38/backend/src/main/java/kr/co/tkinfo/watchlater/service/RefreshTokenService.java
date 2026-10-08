package kr.co.tkinfo.watchlater.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;
    private final Map<String, String> inMemoryTokenStore = new ConcurrentHashMap<>();

    private static final String KEY_PREFIX = "RT:";

    public void saveRefreshToken(String username, String refreshToken, long validityInSeconds) {
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                redisTemplate.opsForValue().set(KEY_PREFIX + username, refreshToken, Duration.ofSeconds(validityInSeconds));
                log.info("[Redis] Refresh token saved for user: {}", username);
                return;
            }
        } catch (Exception e) {
            log.warn("[Redis Connection Failed] Falling back to In-Memory store for refresh token: {}", e.getMessage());
        }
        inMemoryTokenStore.put(username, refreshToken);
        log.info("[Memory] Refresh token saved for user: {}", username);
    }

    public String getRefreshToken(String username) {
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String token = redisTemplate.opsForValue().get(KEY_PREFIX + username);
                if (token != null) {
                    return token;
                }
            }
        } catch (Exception e) {
            log.warn("[Redis Connection Failed] Falling back to In-Memory store to get token: {}", e.getMessage());
        }
        return inMemoryTokenStore.get(username);
    }

    public void deleteRefreshToken(String username) {
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                redisTemplate.delete(KEY_PREFIX + username);
            }
        } catch (Exception e) {
            log.warn("[Redis Connection Failed] Falling back to In-Memory store to delete token: {}", e.getMessage());
        }
        inMemoryTokenStore.remove(username);
    }

    public boolean validateRefreshToken(String username, String refreshToken) {
        String savedToken = getRefreshToken(username);
        return savedToken != null && savedToken.equals(refreshToken);
    }
}
