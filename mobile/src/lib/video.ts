export function getYouTubeId(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function getYouTubeEmbedUrl(url: string) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`;
}

export function isYouTubeUrl(url: string) {
  return Boolean(getYouTubeId(url));
}
