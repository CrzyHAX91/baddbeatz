import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from youtube_logic import get_latest_videos
from dotenv import load_dotenv

load_dotenv()

# Serve files from `docs` if present; otherwise serve from repo root
static_dir = 'docs' if os.path.isdir(os.path.join(os.path.dirname(__file__), 'docs')) else ''
app = Flask(__name__, static_folder=static_dir or '.', static_url_path='')
DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), 'data', 'app.db'))


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        'CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT)'
    )
    conn.commit()
    conn.close()


@app.route('/api/tracks', methods=['GET', 'POST'])
def tracks():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        title = data.get('title')
        url = data.get('url')
        if not title or not url:
            conn.close()
            return jsonify({'error': 'title and url required'}), 400
        cur = conn.execute('INSERT INTO tracks (title, url) VALUES (?, ?)', (title, url))
        conn.commit()
        track_id = cur.lastrowid
        conn.close()
        return jsonify({'id': track_id, 'title': title, 'url': url}), 201
    else:
        rows = conn.execute('SELECT id, title, url FROM tracks').fetchall()
        conn.close()
        return jsonify({'tracks': [dict(row) for row in rows]})


@app.route('/api/youtube')
def youtube_videos():
    channel_id = request.args.get('channel_id') or request.args.get('channelId')
    if not channel_id:
        return jsonify({'error': 'channel_id required'}), 400
    try:
        data = get_latest_videos(channel_id)
    except Exception as exc:
        app.logger.error("Error fetching YouTube videos: %s", exc, exc_info=True)
        return jsonify({'error': 'An internal error has occurred. Please try again later.'}), 500
    return jsonify(data)


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', '8000'))
    app.run(host='0.0.0.0', port=port)
