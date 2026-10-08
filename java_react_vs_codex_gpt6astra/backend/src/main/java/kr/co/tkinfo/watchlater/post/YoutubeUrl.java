package kr.co.tkinfo.watchlater.post;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;

public final class YoutubeUrl {
    private YoutubeUrl() {}
    public static String normalize(String value) {
        try {
            URI uri = URI.create(value.strip());
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getUserInfo() != null || uri.getPort() != -1)
                throw new IllegalArgumentException();
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(java.util.Locale.ROOT);
            String id = null;
            if (host.equals("youtu.be")) id = uri.getPath().substring(1);
            else if (Set.of("youtube.com", "www.youtube.com", "m.youtube.com").contains(host)) {
                if ("/watch".equals(uri.getPath()) && uri.getRawQuery() != null) {
                    for (String part : uri.getRawQuery().split("&")) {
                        String[] pair = part.split("=", 2);
                        if (pair.length == 2 && pair[0].equals("v")) id = URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
                    }
                } else if (uri.getPath().matches("/(shorts|embed|live)/[A-Za-z0-9_-]{11}/?")) {
                    id = uri.getPath().split("/")[2];
                }
            }
            if (id == null || !id.matches("[A-Za-z0-9_-]{11}")) throw new IllegalArgumentException();
            return "https://www.youtube.com/watch?v=" + id;
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("유효한 HTTPS YouTube 영상 URL을 입력해 주세요.");
        }
    }
}
