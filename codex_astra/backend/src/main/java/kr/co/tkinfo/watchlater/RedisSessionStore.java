package kr.co.tkinfo.watchlater;

import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import java.time.Duration;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;

@Service
public class RedisSessionStore implements SessionStore {
    private final StringRedisTemplate redis;
    public RedisSessionStore(StringRedisTemplate redis) { this.redis = redis; }
    private String key(String token) {
        try { return "watchlater:refresh:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    public void save(String token, String username) { redis.opsForValue().set(key(token), username, Duration.ofDays(7)); }
    public String consume(String token) { return redis.opsForValue().getAndDelete(key(token)); }
    public boolean allowLogin(String client) {
        var script = new DefaultRedisScript<Long>("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n", Long.class);
        Long attempts = redis.execute(script, List.of("watchlater:login:" + client));
        return attempts != null && attempts <= 20;
    }
}
