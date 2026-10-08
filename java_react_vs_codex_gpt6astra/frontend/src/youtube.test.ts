import { describe, expect, it } from 'vitest';
import { videoId } from './youtube';

describe('YouTube video URLs', () => {
  it.each(['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10', 'https://youtu.be/dQw4w9WgXcQ?si=test', 'https://m.youtube.com/shorts/dQw4w9WgXcQ', 'https://youtube.com/live/dQw4w9WgXcQ'])('accepts %s', (url) => expect(videoId(url)).toBe('dQw4w9WgXcQ'));
  it.each(['javascript:alert(1)', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/playlist?list=x', 'http://youtu.be/dQw4w9WgXcQ', 'https://youtu.be/short', 'https://youtu.be/dQw4w9WgXcQ/extra'])('rejects %s', (url) => expect(videoId(url)).toBeNull());
});
