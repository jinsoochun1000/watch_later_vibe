package kr.co.tkinfo.watchlater;
public interface SessionStore {
    void save(String token, String username);
    String consume(String token);
    boolean allowLogin(String client);
}
