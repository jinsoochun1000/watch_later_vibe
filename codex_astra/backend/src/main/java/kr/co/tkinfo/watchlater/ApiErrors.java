package kr.co.tkinfo.watchlater;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.data.redis.RedisConnectionFailureException;
import java.util.Map;

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> status(ResponseStatusException e) { return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason() == null ? "요청을 처리할 수 없습니다." : e.getReason())); }
    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    ResponseEntity<?> invalid(Exception e) { return ResponseEntity.badRequest().body(Map.of("message", e instanceof IllegalArgumentException ? e.getMessage() : "입력 항목과 글자 수를 확인해 주세요.")); }
    @ExceptionHandler(OptimisticLockingFailureException.class)
    ResponseEntity<?> conflict() { return ResponseEntity.status(409).body(Map.of("message", "다른 사용자가 수정했습니다. 목록을 새로고침해 주세요.")); }
    @ExceptionHandler(RedisConnectionFailureException.class)
    ResponseEntity<?> unavailable() { return ResponseEntity.status(503).body(Map.of("message", "인증 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.")); }
}
