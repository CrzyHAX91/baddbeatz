import os
import socket
import subprocess
import time
import requests


def get_free_port():
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def test_app_serves_index(tmp_path):
    port = get_free_port()
    env = os.environ.copy()
    env["PORT"] = str(port)
    env["DB_PATH"] = str(tmp_path / "test.db")
    proc = subprocess.Popen(["python", "server.py"], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        time.sleep(2)
        response = requests.get(f"http://localhost:{port}/index.html")
        assert response.status_code == 200
    finally:
        proc.terminate()
        proc.wait(timeout=5)


def test_app_tracks_endpoint(tmp_path):
    port = get_free_port()
    env = os.environ.copy()
    env["PORT"] = str(port)
    env["DB_PATH"] = str(tmp_path / "test.db")
    proc = subprocess.Popen(["python", "server.py"], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        time.sleep(2)
        # Register a user
        register_res = requests.post(f"http://localhost:{port}/api/register", json={"username": "testuser", "password": "testpass"})
        assert register_res.status_code == 200
        token = register_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        payload = {"title": "Song", "url": "http://example.com"}
        res = requests.post(f"http://localhost:{port}/api/tracks", json=payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "Song"
        list_res = requests.get(f"http://localhost:{port}/api/tracks", headers=headers)
        assert list_res.status_code == 200
        tracks = list_res.json()["tracks"]
        assert len(tracks) == 1
        assert tracks[0]["title"] == "Song"
    finally:
        proc.terminate()
        proc.wait(timeout=5)
