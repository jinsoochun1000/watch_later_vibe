package kr.co.tkinfo.watchlater;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.assertj.core.api.Assertions.*;

class YoutubeUrlTest {
    @ParameterizedTest @ValueSource(strings = {
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30", "https://youtu.be/dQw4w9WgXcQ?si=test",
        "https://youtube.com/shorts/dQw4w9WgXcQ", "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/embed/dQw4w9WgXcQ", "https://youtube.com/live/dQw4w9WgXcQ" })
    void acceptsVideoLinks(String url) { assertThat(YoutubeUrl.videoId(url)).isEqualTo("dQw4w9WgXcQ"); }
    @ParameterizedTest @ValueSource(strings = {
        "javascript:alert(1)", "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ", "https://evil.example/dQw4w9WgXcQ",
        "https://youtube.com/playlist?list=123", "https://youtu.be/short", "https://attacker@youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtube.com:444/watch?v=dQw4w9WgXcQ", "not a url" })
    void rejectsInvalidOrSpoofedLinks(String url) { assertThatThrownBy(() -> YoutubeUrl.videoId(url)).isInstanceOf(IllegalArgumentException.class); }
}
