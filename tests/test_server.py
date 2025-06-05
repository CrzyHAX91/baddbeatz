import os
import subprocess
import time
import requests


def test_server_serves_index():
    env = os.environ.copy()
    env["PORT"] = "8001"
    proc = subprocess.Popen(["python3", "server.py"], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        time.sleep(2)  # give the server time to start
        response = requests.get("http://localhost:8001/index.html")
        assert response.status_code == 200
    finally:
        proc.terminate()
        proc.wait(timeout=5)
