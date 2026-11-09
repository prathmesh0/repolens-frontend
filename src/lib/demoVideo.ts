// The demo video. Set NEXT_PUBLIC_DEMO_VIDEO_URL to change it without a code
// change; supports a Google Drive share link, a YouTube link or a direct
// .mp4/.webm URL.
const DEFAULT_URL =
  'https://drive.google.com/file/d/1XD_FnJA_ftceO0w2dPZ-utOosIdIDcLL/view?usp=sharing';

export type DemoVideoSource =
  | { kind: 'iframe'; embedUrl: string; watchUrl: string }
  | { kind: 'file'; src: string; watchUrl: string };

export function parseVideoUrl(raw: string): DemoVideoSource | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const watchUrl = url.toString();

  if (url.hostname === 'drive.google.com') {
    const id =
      url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ?? url.searchParams.get('id');
    if (!id) return null;
    return {
      kind: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      watchUrl,
    };
  }

  if (/(^|\.)youtube\.com$/.test(url.hostname) || url.hostname === 'youtu.be') {
    const id =
      url.hostname === 'youtu.be'
        ? url.pathname.slice(1)
        : (url.searchParams.get('v') ??
          url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]);
    if (!id) return null;
    return {
      kind: 'iframe',
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      watchUrl,
    };
  }

  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
    return { kind: 'file', src: watchUrl, watchUrl };
  }
  return null;
}

export const DEMO_VIDEO = parseVideoUrl(
  process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || DEFAULT_URL
);
