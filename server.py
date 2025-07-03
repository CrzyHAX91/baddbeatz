import os
import sqlite3
import secrets
from flask import Flask, request, jsonify, send_from_directory
from youtube_logic import get_latest_videos
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

# Serve files from the `docs` directory if it exists, else from the repo root
static_dir = 'docs' if os.path.isdir(os.path.join(os.path.dirname(__file__), 'docs')) else ''
app = Flask(__name__, static_folder=static_dir or '.', static_url_path='')

DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), 'data', 'app.db'))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

tokens: dict[str, int] = {}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute(
            'CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT)'
        )
        conn.execute(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password_hash TEXT)'
        )
        conn.execute(
            'CREATE TABLE IF NOT EXISTS tokens (token TEXT PRIMARY KEY, user_id INTEGER)'
        )



def load_tokens():
    with get_db() as conn:
        rows = conn.execute('SELECT token, user_id FROM tokens').fetchall()
    tokens.clear()
    tokens.update({row['token']: row['user_id'] for row in rows})


init_db()
load_tokens()


def get_user_id_from_token() -> int | None:
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        token = auth.split(' ', 1)[1]
        user_id = tokens.get(token)
        if user_id is not None:
            return user_id
        with get_db() as conn:
            row = conn.execute('SELECT user_id FROM tokens WHERE token=?', (token,)).fetchone()
            if row:
                tokens[token] = row['user_id']
                return row['user_id']
    return None


@app.route('/api/tracks', methods=['GET'])
def get_tracks():
    with get_db() as conn:
        rows = conn.execute('SELECT id, title, url FROM tracks').fetchall()
    return jsonify({'tracks': [dict(row) for row in rows]})


@app.route('/api/tracks', methods=['POST'])
def add_track():
    if not get_user_id_from_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json(silent=True) or {}
    title = data.get('title')
    url = data.get('url')
    if not title or not url:
        return jsonify({'error': 'Missing fields'}), 400
    with get_db() as conn:
        cur = conn.execute('INSERT INTO tracks (title, url) VALUES (?, ?)', (title, url))
        conn.commit()
        track = {'id': cur.lastrowid, 'title': title, 'url': url}
    return jsonify(track), 201


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Missing fields'}), 400
    pw_hash = generate_password_hash(password)
    try:
        with get_db() as conn:
            cur = conn.execute(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                (username, pw_hash),
            )
            conn.commit()
            user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({'error': 'User exists'}), 400
    token = secrets.token_hex(16)
    with get_db() as conn:
        conn.execute('INSERT INTO tokens (token, user_id) VALUES (?, ?)', (token, user_id))
        conn.commit()
    tokens[token] = user_id
    return jsonify({'token': token})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Missing fields'}), 400
    with get_db() as conn:
        row = conn.execute(
            'SELECT id, password_hash FROM users WHERE username=?', (username,)
        ).fetchone()
    if not row or not check_password_hash(row['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = secrets.token_hex(16)
    with get_db() as conn:
        conn.execute('INSERT INTO tokens (token, user_id) VALUES (?, ?)', (token, row['id']))
        conn.commit()
    tokens[token] = row['id']
    return jsonify({'token': token})


@app.route('/api/youtube')
def youtube_videos():
    """Return recent YouTube videos for a given channel."""
    channel_id = request.args.get('channel_id') or request.args.get('channelId')
    if not channel_id:
        return jsonify({'error': 'channel_id required'}), 400
    try:
        data = get_latest_videos(channel_id)
    except Exception as exc:
        app.logger.error('Error fetching YouTube videos: %s', exc, exc_info=True)
        return jsonify({'error': 'An internal error occurred. Please try again later.'}), 500
    return jsonify(data)


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path: str):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', '8000'))
    app.run(host='0.0.0.0', port=port)
