package kr.co.tkinfo.watchlater.dto;

import kr.co.tkinfo.watchlater.domain.User;

public class UserDto {
    private Long userId;
    private String loginId;
    private String userNm;
    private String email;

    public UserDto() {}

    public UserDto(Long userId, String loginId, String userNm, String email) {
        this.userId = userId;
        this.loginId = loginId;
        this.userNm = userNm;
        this.email = email;
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(user.getUserId(), user.getLoginId(), user.getUserNm(), user.getEmail());
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getLoginId() {
        return loginId;
    }

    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }

    public String getUserNm() {
        return userNm;
    }

    public void setUserNm(String userNm) {
        this.userNm = userNm;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
