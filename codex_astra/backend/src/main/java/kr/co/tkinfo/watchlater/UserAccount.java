package kr.co.tkinfo.watchlater;

import jakarta.persistence.*;

@Entity
@Table(name = "WL_ASTRA_USERS")
public class UserAccount {
    @Id @Column(length = 50) String username;
    @Column(name = "PASSWORD_HASH", nullable = false, length = 100) String passwordHash;
    protected UserAccount() {}
    UserAccount(String username, String passwordHash) { this.username = username; this.passwordHash = passwordHash; }
}
