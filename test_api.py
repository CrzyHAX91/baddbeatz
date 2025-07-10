import requests
import json

# Test AI chat endpoint
def test_ai_chat():
    url = "http://localhost:8000/api/ask"
    data = {"question": "What kind of music do you play?"}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print("AI Chat Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        print()
    except Exception as e:
        print(f"AI Chat Error: {e}")

# Test YouTube API endpoint
def test_youtube_api():
    url = "http://localhost:8000/api/youtube?channel_id=UC_x5XG1OV2P6uZZ5FSM9Ttw"
    
    try:
        response = requests.get(url)
        print("YouTube API Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        print()
    except Exception as e:
        print(f"YouTube API Error: {e}")

if __name__ == "__main__":
    test_ai_chat()
    test_youtube_api()
