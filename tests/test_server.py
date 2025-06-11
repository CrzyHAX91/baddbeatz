import os
import socket
import subprocess
import time
import requests


def get_free_port():
    sock = socket.socket()
    sock.bind(("", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def test_server_serves_index():
    port = get_free_port()
    env = os.environ.copy()
    env["PORT"] = str(port)
    proc = subprocess.Popen(["python3", "server.py"], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        time.sleep(2)  # give the server time to start
        response = requests.get(f"http://localhost:{port}/index.html")
        assert response.status_code == 200
    finally:
        proc.terminate()
        proc.wait(timeout=5)
