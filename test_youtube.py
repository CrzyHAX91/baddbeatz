import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('YOUTUBE_API_KEY')
print(f'Testing YouTube API with key: {api_key[:10]}...')

# Test with a simple search query first
url = 'https://www.googleapis.com/youtube/v3/search'
params = {
    'key': api_key,
    'q': 'music',
    'part': 'snippet',
    'maxResults': 1,
    'type': 'video'
}

try:
    response = requests.get(url, params=params)
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        print('YouTube API is working!')
        data = response.json()
        print(f'Found {len(data.get("items", []))} videos')
        
        # Now test with the specific channel
        print('\nTesting with specific channel...')
        channel_url = 'https://www.googleapis.com/youtube/v3/search'
        channel_params = {
            'key': api_key,
            'channelId': 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
            'part': 'snippet',
            'order': 'date',
            'type': 'video',
            'maxResults': 5,
        }
        
        channel_response = requests.get(channel_url, params=channel_params)
        print(f'Channel Status Code: {channel_response.status_code}')
        if channel_response.status_code == 200:
            channel_data = channel_response.json()
            print(f'Found {len(channel_data.get("items", []))} videos from channel')
        else:
            print(f'Channel Error: {channel_response.text}')
            
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Exception: {e}')
