package kr.co.tkinfo.watchlater.config;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> status(ResponseStatusException ex) { return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", ex.getReason() == null ? "요청을 처리할 수 없습니다." : ex.getReason())); }
    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    ResponseEntity<?> invalid(Exception ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex instanceof IllegalArgumentException ? ex.getMessage() : "입력값과 글자 수 제한을 확인해 주세요."));
    }
    @ExceptionHandler(OptimisticLockingFailureException.class)
    ResponseEntity<?> conflict() { return ResponseEntity.status(409).body(Map.of("message", "게시물이 변경되었습니다. 목록을 새로고침해 주세요.")); }
    @ExceptionHandler(RedisConnectionFailureException.class)
    ResponseEntity<?> redis() { return ResponseEntity.status(503).body(Map.of("message", "로그인 저장소에 연결할 수 없습니다. Redis 실행 상태를 확인해 주세요.")); }
}
