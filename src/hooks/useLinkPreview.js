export async function fetchLinkPreview(url) {
  try {
    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const { data } = await res.json();
    return {
      title: data.title ?? '',
      thumbnail_url: data.image?.url ?? '',
    };
  } catch {
    return { title: '', thumbnail_url: '' };
  }
}
