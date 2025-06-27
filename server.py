import http.server
import socketserver
import os
import json

# Allow overriding the port via the PORT environment variable
PORT = int(os.getenv("PORT", "8000"))
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "tracks.json")


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/tracks":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            try:
                with open(DATA_FILE) as f:
                    data = json.load(f)
            except FileNotFoundError:
                data = {"tracks": []}
            self.wfile.write(json.dumps(data).encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/tracks":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                track = json.loads(body)
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                return
            os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
            try:
                with open(DATA_FILE) as f:
                    data = json.load(f)
            except FileNotFoundError:
                data = {"tracks": []}
            data["tracks"].append(track)
            with open(DATA_FILE, "w") as f:
                json.dump(data, f)
            self.send_response(201)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(track).encode())
        else:
            self.send_response(404)
            self.end_headers()


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    print(f"Open http://localhost:{PORT} in your browser")
    httpd.serve_forever()
