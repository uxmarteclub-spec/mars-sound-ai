export type ShareChannel = "whatsapp" | "telegram" | "x" | "instagram";

export function buildShareText(title: string, url: string): string {
  const t = title.trim();
  return t ? `${t}\n${url}` : url;
}

export function shareUrlForChannel(
  channel: ShareChannel,
  url: string,
  text: string
): string {
  const encUrl = encodeURIComponent(url);
  const encText = encodeURIComponent(text);
  switch (channel) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    case "telegram":
      return `https://t.me/share/url?url=${encUrl}&text=${encText}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`;
    case "instagram":
      return url;
    default:
      return url;
  }
}

export function openShareChannel(
  channel: ShareChannel,
  url: string,
  text: string
): void {
  if (channel === "instagram") {
    void navigator.clipboard.writeText(url).catch(() => {});
    return;
  }
  const href = shareUrlForChannel(channel, url, text);
  window.open(href, "_blank", "noopener,noreferrer");
}
