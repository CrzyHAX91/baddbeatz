import os
import requests

def get_latest_videos(channel_id: str, api_key: str | None = None, max_results: int = 5):
    """Return a list of the latest videos from a YouTube channel."""
    api_key = api_key or os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY is not set")
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "key": api_key,
        "channelId": channel_id,
        "part": "snippet",
        "order": "date",
        "type": "video",
        "maxResults": max_results,
    }
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    items = resp.json().get("items", [])
    videos = [
        {
            "id": item.get("id", {}).get("videoId"),
            "title": item.get("snippet", {}).get("title"),
        }
        for item in items
        if "videoId" in item.get("id", {})
    ]
    return {"videos": videos}
