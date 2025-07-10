async function getLatestVideos(channelId, apiKey = process.env.YOUTUBE_API_KEY, maxResults = 5) {
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }
  const url = 'https://www.googleapis.com/youtube/v3/search';
  const params = new URLSearchParams({
    key: apiKey,
    channelId,
    part: 'snippet',
    order: 'date',
    type: 'video',
    maxResults: String(maxResults)
  });
  const res = await fetch(`${url}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`YouTube API error ${res.status}`);
  }
  const data = await res.json();
  const videos = (data.items || [])
    .filter(it => it.id && it.id.videoId)
    .map(it => ({ id: it.id.videoId, title: it.snippet?.title }));
  return { videos };
}

module.exports = { getLatestVideos };
