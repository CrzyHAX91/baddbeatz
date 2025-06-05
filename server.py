import http.server
import socketserver
import os

# Allow overriding the port via the PORT environment variable
PORT = int(os.getenv("PORT", "8000"))

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    print(f"Open http://localhost:{PORT} in your browser")
    httpd.serve_forever()
