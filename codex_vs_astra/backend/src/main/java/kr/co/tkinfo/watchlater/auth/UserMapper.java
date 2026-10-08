package kr.co.tkinfo.watchlater.auth;

import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {
    @Select("SELECT USERNAME, PASSWORD_HASH AS passwordHash FROM WLC_USERS WHERE USERNAME = #{username}")
    UserCredentials find(String username);
    @Insert("INSERT INTO WLC_USERS (USERNAME, PASSWORD_HASH) VALUES (#{username}, #{passwordHash})")
    void insert(@Param("username") String username, @Param("passwordHash") String passwordHash);
    record UserCredentials(String username, String passwordHash) {
        @Override public String toString() { return "UserCredentials[REDACTED]"; }
    }
}
