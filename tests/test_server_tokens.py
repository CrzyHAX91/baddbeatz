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


def start_server(port, db_path):
    env = os.environ.copy()
    env["PORT"] = str(port)
    env["DB_PATH"] = db_path
    return subprocess.Popen(["python3", "server.py"], env=env,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def test_token_persists_across_restarts(tmp_path):
    port = get_free_port()
    db_file = str(tmp_path / "test.db")
    proc = start_server(port, db_file)
    try:
        time.sleep(2)
        res = requests.post(f"http://localhost:{port}/api/register",
                            json={"username": "u", "password": "p"})
        assert res.status_code == 200
        token = res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        r1 = requests.post(
            f"http://localhost:{port}/api/tracks",
            json={"title": "t1", "url": "http://e.com/1"},
            headers=headers,
        )
        assert r1.status_code == 201
    finally:
        proc.terminate()
        proc.wait(timeout=5)

    proc2 = start_server(port, db_file)
    try:
        time.sleep(2)
        r2 = requests.post(
            f"http://localhost:{port}/api/tracks",
            json={"title": "t2", "url": "http://e.com/2"},
            headers=headers,
        )
        assert r2.status_code == 201
        list_res = requests.get(f"http://localhost:{port}/api/tracks")
        assert list_res.status_code == 200
        tracks = list_res.json()["tracks"]
        assert len(tracks) == 2
    finally:
        proc2.terminate()
        proc2.wait(timeout=5)
