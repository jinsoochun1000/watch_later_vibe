package kr.co.tkinfo.watchlater;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean SecretKeySpec jwtKey(@Value("${app.jwt-secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalArgumentException("JWT_SECRET은 32바이트 이상이어야 합니다.");
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
    @Bean JwtEncoder jwtEncoder(SecretKeySpec key) { return new NimbusJwtEncoder(new ImmutableSecret<>(key)); }
    @Bean JwtDecoder jwtDecoder(SecretKeySpec key) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("watchlater")); return decoder;
    }
    @Bean SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http.csrf(c -> c.disable()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a.requestMatchers(HttpMethod.GET,"/api/posts", "/api/posts/stats", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/api/auth/**", "/error").permitAll().anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(j -> {}).authenticationEntryPoint((req,res,e) -> jsonError(res,401,"로그인이 필요합니다.")))
            .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex) -> jsonError(res,401,"로그인이 필요합니다.")))
            .addFilterBefore(new OncePerRequestFilter() {
                protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
                    // Custom header requires a CORS preflight; cross-origin requests are not allowed.
                    if (req.getRequestURI().startsWith("/api/auth/") && !"GET".equals(req.getMethod()) && !"XMLHttpRequest".equals(req.getHeader("X-Requested-With"))) {
                        jsonError(res,403,"허용되지 않은 요청입니다."); return;
                    }
                    chain.doFilter(req,res);
                }
            }, UsernamePasswordAuthenticationFilter.class).build();
    }
    static void jsonError(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status); res.setContentType("application/json;charset=UTF-8"); res.getWriter().write("{\"message\":\"" + message + "\"}");
    }
    @Bean ApplicationRunner seed(UserRepository users, PasswordEncoder encoder, @Value("${app.seed-username}") String username, @Value("${app.seed-password}") String password) {
        return args -> { if (!users.existsById(username)) users.save(new UserAccount(username, encoder.encode(password))); };
    }
}
