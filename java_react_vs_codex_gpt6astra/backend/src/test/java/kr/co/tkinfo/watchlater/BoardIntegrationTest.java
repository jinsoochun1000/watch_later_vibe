package kr.co.tkinfo.watchlater;

import kr.co.tkinfo.watchlater.auth.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.config.import=", "spring.datasource.url=jdbc:h2:mem:watchlater;MODE=Oracle;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa", "spring.datasource.password=", "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=none",
    "app.jwt-secret=test-secret-with-at-least-thirty-two-bytes-for-hmac", "app.seed.enabled=true"
})
@AutoConfigureMockMvc
class BoardIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @MockitoBean TokenService tokens;

    @Test void completeCrudAndSecurityFlow() throws Exception {
        mvc.perform(get("/api/posts")).andExpect(status().isOk()).andExpect(content().json("[]"));
        String input = """
            {"title":"한글 영상 제목","videoUrl":"https://youtu.be/dQw4w9WgXcQ","content":"공유 내용","status":"NEW"}
            """;
        mvc.perform(post("/api/posts").contentType("application/json").content(input)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/posts").with(jwt().jwt(j -> j.subject("stk1"))).contentType("application/json").content(input))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.title").value("한글 영상 제목"));
        Long id = jdbc.queryForObject("SELECT ID FROM WLC_POSTS", Long.class);
        mvc.perform(get("/api/posts")).andExpect(status().isOk()).andExpect(jsonPath("$[0].videoUrl").value("https://www.youtube.com/watch?v=dQw4w9WgXcQ"));
        String update = """
            {"title":"수정한 제목","videoUrl":"https://youtu.be/dQw4w9WgXcQ","content":"수정 내용","status":"DONE","version":0}
            """;
        mvc.perform(put("/api/posts/" + id).with(jwt()).contentType("application/json").content(update))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DONE")).andExpect(jsonPath("$.version").value(1));
        mvc.perform(put("/api/posts/" + id).with(jwt()).contentType("application/json").content(update)).andExpect(status().isConflict());
        mvc.perform(delete("/api/posts/" + id)).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/posts/" + id).with(jwt())).andExpect(status().isNoContent());
        mvc.perform(delete("/api/posts/" + id).with(jwt())).andExpect(status().isNotFound());
    }
    @Test void validatesInputAndLogin() throws Exception {
        mvc.perform(post("/api/posts").with(jwt()).contentType("application/json").content("""
            {"title":"  ","videoUrl":"https://evil.test","status":"NEW"}
            """)).andExpect(status().isBadRequest());
        mvc.perform(post("/api/posts").with(jwt()).contentType("application/json").content("""
            {"title":"제목","videoUrl":"https://evil.test/watch?v=dQw4w9WgXcQ","status":"NEW"}
            """)).andExpect(status().isBadRequest());
        String login = "{\"username\":\"stk1\",\"password\":\"stk1\"}";
        mvc.perform(post("/api/auth/login").contentType("application/json").content(login)).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/login").header("X-Watchlater-Client", "1").header("Origin", "https://evil.test").contentType("application/json").content(login)).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/login").header("X-Watchlater-Client", "1").contentType("application/json").content("{\"username\":\"stk1\",\"password\":\"wrong\"}"))
            .andExpect(status().isUnauthorized());
        when(tokens.issue("stk1")).thenReturn(new TokenService.Tokens("access", "refresh", "stk1"));
        mvc.perform(post("/api/auth/login").header("X-Watchlater-Client", "1").contentType("application/json").content(login))
            .andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").value("access"))
            .andExpect(cookie().httpOnly("wl_refresh", true));
        assertThat(jdbc.queryForObject("SELECT PASSWORD_HASH FROM WLC_USERS WHERE USERNAME='stk1'", String.class)).startsWith("$2");
    }
}
