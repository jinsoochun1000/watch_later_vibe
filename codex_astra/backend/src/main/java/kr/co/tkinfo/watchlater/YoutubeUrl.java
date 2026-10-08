package kr.co.tkinfo.watchlater;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;

public final class YoutubeUrl {
    private YoutubeUrl() {}
    public static String videoId(String value) {
        try {
            URI uri = URI.create(value.trim());
            if (!Set.of("https", "http").contains(uri.getScheme()) || uri.getUserInfo() != null || uri.getPort() != -1)
                throw new IllegalArgumentException();
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            String path = uri.getPath();
            String id = null;
            if (host.equals("youtu.be")) id = path.substring(1);
            else if (Set.of("youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com").contains(host)) {
                if (path.equals("/watch") && uri.getRawQuery() != null) {
                    for (String pair : uri.getRawQuery().split("&")) {
                        String[] parts = pair.split("=", 2);
                        if (parts.length == 2 && parts[0].equals("v")) id = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
                    }
                } else if (path.matches("/(shorts|embed|live)/[^/]+/?")) id = path.split("/")[2];
            }
            if (id == null || !id.matches("[A-Za-z0-9_-]{11}")) throw new IllegalArgumentException();
            return id;
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("올바른 YouTube 영상 URL을 입력해 주세요.");
        }
    }
}
