import requests

response = requests.get('http://127.0.0.1:8000/api/youtube?channel_id=UCqHpI2_Z48G9CuDFYQpsc2Q')
print(f'GET /api/youtube - Status: {response.status_code}')
data = response.json()
print(f'Videos count: {len(data.get("videos", []))}')
if data.get('videos'):
    print(f'First video: {data["videos"][0].get("title", "N/A")}')
