import os
import sqlite3
import secrets
import logging
from flask import Flask, request, jsonify, send_from_directory
from youtube_logic import get_latest_videos
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from file_manager import (
    upload_music_file, get_music_files, download_music_file, 
    delete_music_file, get_storage_info
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


@app.route('/api/ask', methods=['POST'])
def ask_dj():
    """AI chat endpoint for asking questions about TheBadGuy."""
    data = request.get_json(silent=True) or {}
    question = data.get('question')
    
    if not question:
        return jsonify({'error': 'Question is required'}), 400
    
    try:
        # Try to use available AI logic modules
        try:
            from worker_logic import ask as ai_ask
            response = ai_ask(question)
            if isinstance(response, dict) and 'text' in response:
                response_text = response['text']
            else:
                response_text = str(response)
        except ImportError:
            try:
                from gemini_logic import ask as gemini_ask
                response = gemini_ask(question)
                if isinstance(response, dict) and 'text' in response:
                    response_text = response['text']
                else:
                    response_text = str(response)
            except ImportError:
                try:
                    from huggingface_logic import ask as hf_ask
                    response = hf_ask(question)
                    if isinstance(response, dict) and 'text' in response:
                        response_text = response['text']
                    else:
                        response_text = str(response)
                except ImportError:
                    # Fallback response if no AI modules are available
                    response_text = f"Thanks for asking about '{question}'! I'm TheBadGuyHimself, a DJ specializing in underground techno and hardstyle. For specific questions about bookings, equipment, or performances, please contact me directly through the contact page."
        
        return jsonify({
            'choices': [{
                'message': {
                    'content': response_text
                }
            }]
        })
        
    except Exception as exc:
        app.logger.error("Error processing AI question: %s", exc, exc_info=True)
        return jsonify({'error': 'An internal error occurred while processing your question.'}), 500


@app.route('/api/trigger-agent', methods=['POST'])
def trigger_agent():
    """Manually trigger the automated agent tasks."""
    # Check for authorization
    if not get_user_id_from_token():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 401
    
    data = request.get_json(silent=True) or {}
    task_type = data.get('task_type', 'all')
    
    try:
        from automated_agent import trigger_manual_update
        result = trigger_manual_update(task_type)
        logger.info(f"Manual agent trigger completed: {task_type}")
        return jsonify(result)
    except Exception as exc:
        logger.error(f"Error triggering automated agent: {exc}", exc_info=True)
        return jsonify({'error': 'Failed to trigger automated agent'}), 500


@app.route('/api/agent-status', methods=['GET'])
def agent_status():
    """Get the current status of the automated agent."""
    try:
        from automated_agent import get_agent_status
        status = get_agent_status()
        return jsonify(status)
    except Exception as exc:
        logger.error(f"Error getting agent status: {exc}", exc_info=True)
        return jsonify({'error': 'Failed to get agent status'}), 500


# File Management Endpoints
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload a music file."""
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized - Login required'}), 401
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    result = upload_music_file(file, user_id)
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400


@app.route('/api/files', methods=['GET'])
def list_files():
    """Get list of uploaded music files."""
    files = get_music_files()
    storage_info = get_storage_info()
    
    return jsonify({
        'files': files,
        'storage_info': storage_info
    })


@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download a music file."""
    result = download_music_file(filename)
    
    if isinstance(result, dict) and not result.get('success'):
        return jsonify(result), 404
    
    return result


@app.route('/api/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete a music file."""
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized - Login required'}), 401
    
    result = delete_music_file(filename, user_id)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 400


@app.route('/api/storage', methods=['GET'])
def storage_info():
    """Get storage information."""
    info = get_storage_info()
    return jsonify(info)


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_files(path: str):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', '8000'))
    app.run(host='0.0.0.0', port=port)
