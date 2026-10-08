package kr.co.tkinfo.watchlater.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class SeedUser implements CommandLineRunner {
    private final UserMapper users;
    private final PasswordEncoder encoder;
    private final String username;
    private final String password;
    public SeedUser(UserMapper users, PasswordEncoder encoder,
                    @Value("${app.seed.username}") String username, @Value("${app.seed.password}") String password) {
        this.users = users; this.encoder = encoder; this.username = username; this.password = password;
    }
    @Override public void run(String... args) {
        if (users.find(username) == null) {
            try { users.insert(username, encoder.encode(password)); }
            catch (DuplicateKeyException ignored) { /* Another instance seeded the same user. */ }
        }
    }
}
