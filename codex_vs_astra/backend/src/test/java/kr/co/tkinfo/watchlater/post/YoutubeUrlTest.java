package kr.co.tkinfo.watchlater.post;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.assertj.core.api.Assertions.*;

class YoutubeUrlTest {
    @ParameterizedTest
    @ValueSource(strings = {"https://youtu.be/dQw4w9WgXcQ?si=test", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30", "https://m.youtube.com/shorts/dQw4w9WgXcQ", "https://youtube.com/live/dQw4w9WgXcQ"})
    void normalizesValidVideo(String value) { assertThat(YoutubeUrl.normalize(value)).isEqualTo("https://www.youtube.com/watch?v=dQw4w9WgXcQ"); }
    @ParameterizedTest
    @ValueSource(strings = {"javascript:alert(1)", "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ", "https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ", "http://youtu.be/dQw4w9WgXcQ", "https://youtu.be/short", "https://youtube.com/playlist?list=x", "https://youtu.be/dQw4w9WgXcQ/extra"})
    void rejectsInvalidVideo(String value) { assertThatIllegalArgumentException().isThrownBy(() -> YoutubeUrl.normalize(value)); }
}
