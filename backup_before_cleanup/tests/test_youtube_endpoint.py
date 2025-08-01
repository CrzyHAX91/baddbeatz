import os
import requests_mock


def test_youtube_endpoint(tmp_path):
    db_file = str(tmp_path / "test.db")
    os.environ["DB_PATH"] = db_file
    os.environ["YOUTUBE_API_KEY"] = "test-key"
    import server
    with requests_mock.Mocker() as m:
        m.get(
            "https://www.googleapis.com/youtube/v3/search",
            json={"items": [{"id": {"videoId": "abc"}, "snippet": {"title": "Test"}}]},
            status_code=200,
        )
        client = server.app.test_client()
        res = client.get("/api/youtube?channel_id=cid")
        assert res.status_code == 200
        data = res.get_json()
        assert data["videos"][0]["id"] == "abc"
