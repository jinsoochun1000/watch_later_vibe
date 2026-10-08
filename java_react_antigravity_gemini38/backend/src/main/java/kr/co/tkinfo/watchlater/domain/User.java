package kr.co.tkinfo.watchlater.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_USER")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_TB_USER_GEN")
    @SequenceGenerator(name = "SEQ_TB_USER_GEN", sequenceName = "SEQ_TB_USER", allocationSize = 1)
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "LOGIN_ID", nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(name = "USER_NM", nullable = false, length = 50)
    private String userNm;

    @Column(name = "USER_PW", nullable = false, length = 256)
    private String userPw;

    @Column(name = "EMAIL", length = 100)
    private String email;

    @Column(name = "USE_YN", nullable = false, length = 1)
    private String useYn = "Y";

    @Column(name = "REG_DT", nullable = false)
    private LocalDateTime regDt;

    @Column(name = "UPT_DT", nullable = false)
    private LocalDateTime uptDt;

    public User() {
    }

    public User(Long userId, String loginId, String userNm, String userPw, String email, String useYn) {
        this.userId = userId;
        this.loginId = loginId;
        this.userNm = userNm;
        this.userPw = userPw;
        this.email = email;
        this.useYn = useYn != null ? useYn : "Y";
        this.regDt = LocalDateTime.now();
        this.uptDt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.regDt == null) {
            this.regDt = LocalDateTime.now();
        }
        if (this.uptDt == null) {
            this.uptDt = LocalDateTime.now();
        }
        if (this.useYn == null) {
            this.useYn = "Y";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.uptDt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public String getUserPw() {
        return userPw;
    }

    public void setUserPw(String userPw) {
        this.userPw = userPw;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUseYn() {
        return useYn;
    }

    public void setUseYn(String useYn) {
        this.useYn = useYn;
    }

    public LocalDateTime getRegDt() {
        return regDt;
    }

    public void setRegDt(LocalDateTime regDt) {
        this.regDt = regDt;
    }

    public LocalDateTime getUptDt() {
        return uptDt;
    }

    public void setUptDt(LocalDateTime uptDt) {
        this.uptDt = uptDt;
    }
}
