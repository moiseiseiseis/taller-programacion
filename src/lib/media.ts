export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'ogg'];

export type UrlKind = 'image' | 'video' | 'youtube' | 'unknown';

export function urlKind(url: string): UrlKind {
  if (!url) return 'unknown';
  if (getYouTubeEmbedUrl(url)) return 'youtube';

  const withoutQuery = url.split('?')[0].split('#')[0];
  const ext = withoutQuery.split('.').pop()?.toLowerCase() ?? '';

  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'unknown';
}
