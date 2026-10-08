package kr.co.tkinfo.watchlater;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Import;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.JsonNode;
import java.net.URI;
import java.net.http.*;
import java.util.concurrent.ConcurrentHashMap;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.datasource.url=jdbc:h2:mem:watchlater;MODE=Oracle;DB_CLOSE_DELAY=-1", "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa", "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop", "spring.flyway.enabled=false", "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "app.jwt-secret=test-only-secret-with-at-least-32-characters", "app.cookie-secure=false" })
@Import(ApiIntegrationTest.Config.class)
class ApiIntegrationTest {
    @LocalServerPort int port;
    final HttpClient client = HttpClient.newHttpClient();
    final JsonMapper json = JsonMapper.builder().build();
    @TestConfiguration static class Config {
        @Bean @Primary SessionStore testSessions() {
            return new SessionStore() {
                final ConcurrentHashMap<String,String> tokens = new ConcurrentHashMap<>();
                public void save(String token, String user) { tokens.put(token,user); }
                public String consume(String token) { return tokens.remove(token); }
                public boolean allowLogin(String client) { return true; }
            };
        }
    }
    HttpResponse<String> request(String method, String path, String body, String token, String cookie, boolean header) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api" + path)).header("Content-Type","application/json");
        if (header) builder.header("X-Requested-With","XMLHttpRequest");
        if (token != null) builder.header("Authorization","Bearer " + token);
        if (cookie != null) builder.header("Cookie",cookie);
        return client.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }
    JsonNode body(HttpResponse<String> response) { return json.readTree(response.body()); }
    String cookie(HttpResponse<String> response) { return response.headers().firstValue("set-cookie").orElseThrow().split(";",2)[0]; }
    @Test void authenticationAndCrudLifecycle() throws Exception {
        assertThat(request("GET","/posts",null,null,null,true).statusCode()).isEqualTo(200);
        String create = "{\"title\":\"한글 영상 테스트\",\"videoUrl\":\"https://youtu.be/dQw4w9WgXcQ\",\"content\":\"UTF-8 내용\",\"status\":\"NEW\"}";
        assertThat(request("POST","/posts",create,null,null,true).statusCode()).isEqualTo(401);
        String credentials = "{\"username\":\"stk1\",\"password\":\"stk1\"}";
        assertThat(request("POST","/auth/login",credentials,null,null,false).statusCode()).isEqualTo(403);
        assertThat(request("POST","/auth/login","{\"username\":\"stk1\",\"password\":\"wrong\"}",null,null,true).statusCode()).isEqualTo(401);
        var login = request("POST","/auth/login",credentials,null,null,true);
        assertThat(login.statusCode()).isEqualTo(200);
        assertThat(login.headers().firstValue("set-cookie").orElseThrow()).contains("HttpOnly","SameSite=Strict","Path=/api/auth");
        String access = body(login).get("accessToken").asText();
        var created = request("POST","/posts",create,access,null,true);
        assertThat(created.statusCode()).isEqualTo(201);
        JsonNode post = body(created);
        assertThat(post.get("title").asText()).isEqualTo("한글 영상 테스트");
        assertThat(post.get("videoUrl").asText()).isEqualTo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        String path = "/posts/" + post.get("id").asLong();
        String update = "{\"title\":\"수정한 제목\",\"videoUrl\":\"https://youtube.com/shorts/dQw4w9WgXcQ\",\"content\":\"수정 내용\",\"status\":\"DONE\",\"version\":0}";
        assertThat(request("PUT",path,update,access,null,true).statusCode()).isEqualTo(200);
        assertThat(request("PUT",path,update,access,null,true).statusCode()).isEqualTo(409);
        assertThat(body(request("GET","/posts/stats",null,null,null,true)).get("doneCount").asLong()).isEqualTo(1);
        assertThat(request("POST","/posts",create.replace("https://youtu.be/dQw4w9WgXcQ","https://evil.example/watch?v=dQw4w9WgXcQ"),access,null,true).statusCode()).isEqualTo(400);
        assertThat(request("POST","/posts",create.replace("한글 영상 테스트"," "),access,null,true).statusCode()).isEqualTo(400);
        assertThat(request("DELETE",path+"?version=0",null,access,null,true).statusCode()).isEqualTo(409);
        assertThat(request("DELETE",path+"?version=1",null,access,null,true).statusCode()).isEqualTo(204);
        assertThat(request("DELETE",path+"?version=1",null,access,null,true).statusCode()).isEqualTo(404);
        var refreshed = request("POST","/auth/refresh",null,null,cookie(login),true);
        assertThat(refreshed.statusCode()).isEqualTo(200);
        assertThat(request("POST","/auth/refresh",null,null,cookie(login),true).statusCode()).isEqualTo(401);
        assertThat(request("POST","/auth/logout",null,null,cookie(refreshed),true).statusCode()).isEqualTo(204);
        assertThat(request("POST","/auth/refresh",null,null,cookie(refreshed),true).statusCode()).isEqualTo(401);
    }
}
