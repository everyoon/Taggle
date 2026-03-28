export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });

  try {
    const response = await fetch(
      `https://api.linkpreview.net/?key=${process.env.LINK_PREVIEW_API_KEY}&q=${encodeURIComponent(url)}`,
    );
    const data = await response.json();

    if (!response.ok) {
      console.error('LinkPreview API Error:', data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'failed' });
  }
}
