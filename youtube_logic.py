import os
import requests
import logging
import time
from typing import Dict, List, Optional

# Configure logging
logger = logging.getLogger(__name__)

def get_latest_videos(channel_id: str, api_key: str | None = None, max_results: int = 5) -> Dict:
    """
    Return a list of the latest videos from a YouTube channel with enhanced error handling.
    
    Args:
        channel_id: YouTube channel ID
        api_key: YouTube API key (optional, will use env var if not provided)
        max_results: Maximum number of videos to fetch
        
    Returns:
        Dict containing videos list and metadata
        
    Raises:
        ValueError: If API key is not provided
        requests.RequestException: If API request fails
    """
    api_key = api_key or os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        logger.error("YouTube API key not found")
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
    
    try:
        logger.info(f"Fetching latest videos for channel: {channel_id}")
        resp = requests.get(url, params=params, timeout=15)
        
        # Enhanced error handling for different HTTP status codes
        if resp.status_code == 403:
            logger.error("YouTube API quota exceeded or invalid API key")
            raise requests.RequestException("YouTube API quota exceeded or access forbidden")
        elif resp.status_code == 404:
            logger.error(f"YouTube channel not found: {channel_id}")
            raise requests.RequestException(f"YouTube channel not found: {channel_id}")
        elif resp.status_code != 200:
            logger.error(f"YouTube API returned status code: {resp.status_code}")
            resp.raise_for_status()
            
        data = resp.json()
        
        # Check for API errors in response
        if "error" in data:
            error_msg = data["error"].get("message", "Unknown YouTube API error")
            logger.error(f"YouTube API error: {error_msg}")
            raise requests.RequestException(f"YouTube API error: {error_msg}")
            
        items = data.get("items", [])
        
        # Enhanced video data extraction with error handling
        videos = []
        for item in items:
            try:
                video_id = item.get("id", {}).get("videoId")
                snippet = item.get("snippet", {})
                
                if video_id and snippet:
                    video_data = {
                        "id": video_id,
                        "title": snippet.get("title", "Untitled"),
                        "description": snippet.get("description", "")[:200],  # Truncate description
                        "publishedAt": snippet.get("publishedAt"),
                        "thumbnails": snippet.get("thumbnails", {}),
                        "url": f"https://www.youtube.com/watch?v={video_id}"
                    }
                    videos.append(video_data)
                    
            except Exception as e:
                logger.warning(f"Error processing video item: {str(e)}")
                continue
                
        logger.info(f"Successfully fetched {len(videos)} videos from YouTube")
        
        return {
            "videos": videos,
            "total_results": len(videos),
            "channel_id": channel_id,
            "fetched_at": time.time()
        }
        
    except requests.Timeout:
        logger.error("YouTube API request timed out")
        raise requests.RequestException("YouTube API request timed out")
    except requests.ConnectionError:
        logger.error("Failed to connect to YouTube API")
        raise requests.RequestException("Failed to connect to YouTube API")
    except Exception as e:
        logger.error(f"Unexpected error fetching YouTube videos: {str(e)}")
        raise

def get_video_details(video_id: str, api_key: str | None = None) -> Optional[Dict]:
    """
    Get detailed information about a specific YouTube video.
    
    Args:
        video_id: YouTube video ID
        api_key: YouTube API key (optional)
        
    Returns:
        Dict containing video details or None if not found
    """
    api_key = api_key or os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        logger.error("YouTube API key not found")
        return None
    
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "key": api_key,
        "id": video_id,
        "part": "snippet,statistics",
    }
    
    try:
        logger.info(f"Fetching details for video: {video_id}")
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        
        data = resp.json()
        items = data.get("items", [])
        
        if items:
            item = items[0]
            snippet = item.get("snippet", {})
            statistics = item.get("statistics", {})
            
            return {
                "id": video_id,
                "title": snippet.get("title"),
                "description": snippet.get("description"),
                "publishedAt": snippet.get("publishedAt"),
                "viewCount": statistics.get("viewCount"),
                "likeCount": statistics.get("likeCount"),
                "thumbnails": snippet.get("thumbnails", {})
            }
        else:
            logger.warning(f"Video not found: {video_id}")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching video details: {str(e)}")
        return None

def validate_youtube_api_key(api_key: str | None = None) -> bool:
    """
    Validate if the YouTube API key is working.
    
    Args:
        api_key: YouTube API key to validate
        
    Returns:
        bool: True if API key is valid, False otherwise
    """
    api_key = api_key or os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return False
    
    try:
        # Test with a simple API call
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "key": api_key,
            "q": "test",
            "part": "snippet",
            "maxResults": 1,
        }
        
        resp = requests.get(url, params=params, timeout=10)
        return resp.status_code == 200
        
    except Exception:
        return False
