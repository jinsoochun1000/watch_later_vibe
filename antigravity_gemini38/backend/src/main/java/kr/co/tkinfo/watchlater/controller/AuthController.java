package kr.co.tkinfo.watchlater.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import kr.co.tkinfo.watchlater.dto.ApiResponse;
import kr.co.tkinfo.watchlater.dto.LoginRequest;
import kr.co.tkinfo.watchlater.dto.LoginResponse;
import kr.co.tkinfo.watchlater.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Authentication", description = "사용자 인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인", description = "아이디와 비밀번호로 로그인하여 Access Token을 발급받습니다.")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginResponse loginResponse = authService.login(request, response);
        return ApiResponse.success("로그인에 성공하였습니다.", loginResponse);
    }

    @Operation(summary = "토큰 갱신", description = "HttpOnly 쿠키의 Refresh Token으로 새로운 Access Token을 발급받습니다.")
    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        LoginResponse loginResponse = authService.refresh(request, response);
        return ApiResponse.success("토큰이 갱신되었습니다.", loginResponse);
    }

    @Operation(summary = "로그아웃", description = "로그아웃하고 Refresh Token을 만료시킵니다.")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletResponse response
    ) {
        if (userDetails != null) {
            authService.logout(userDetails.getUsername(), response);
        }
        return ApiResponse.success("로그아웃되었습니다.", null);
    }

    @Operation(summary = "현재 사용자 정보 조회", description = "로그인된 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ApiResponse.error("인증되지 않은 사용자입니다.");
        }
        return ApiResponse.success(authService.getCurrentUser(userDetails.getUsername()));
    }
}
