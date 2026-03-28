export async function fetchLinkPreview(url) {
  try {
    const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    if (!res.ok) return { title: '', thumbnail_url: '' };

    const data = await res.json();
    return {
      title: data.title || data.description || '',
      thumbnail_url: data.image ?? '',
    };
  } catch {
    return { title: '', thumbnail_url: '' };
  }
}
