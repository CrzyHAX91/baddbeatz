import os
import sqlite3
import secrets
import logging
from flask import Flask, request, jsonify, send_from_directory, redirect, url_for, session, Blueprint
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from youtube_logic import get_latest_videos
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from file_manager import (
    upload_music_file, get_music_files, download_music_file, 
    delete_music_file, get_storage_info
)
from oauth_auth import OAuth2Manager
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Serve files from the `docs` directory if it exists, else from the repo root
static_dir = 'docs' if os.path.isdir(os.path.join(os.path.dirname(__file__), 'docs')) else '.'
app = Flask(__name__, static_folder=static_dir)
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Security Configuration
app.secret_key = os.getenv('FLASK_SECRET_KEY', secrets.token_hex(32))
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB max file size
app.config['WTF_CSRF_TIME_LIMIT'] = None

# Disable rate limiting in testing
if os.getenv('FLASK_ENV') == 'testing':
    app.config['RATELIMIT_ENABLED'] = False

# Initialize security extensions
csrf = CSRFProtect(app)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=os.getenv('RATE_LIMIT_STORAGE_URL', 'memory://')
)

# Initialize caching with proper configuration
cache_config = {
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 300
}
cache = Cache()
cache.init_app(app, config=cache_config)

DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), 'data', 'app.db'))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Initialize OAuth2 Manager
oauth_manager = OAuth2Manager(app, DB_PATH)

tokens: dict[str, int] = {}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute(
            'CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, url TEXT NOT NULL)'
        )
        conn.execute(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, is_premium BOOLEAN DEFAULT FALSE)'
        )
        conn.execute(
            'CREATE TABLE IF NOT EXISTS tokens (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
        )
        conn.execute(
            'CREATE TABLE IF NOT EXISTS forums (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, premium_only BOOLEAN DEFAULT TRUE)'
        )
        conn.execute(
            'CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, forum_id INTEGER NOT NULL, user_id INTEGER NOT NULL, content TEXT NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(forum_id) REFERENCES forums(id), FOREIGN KEY(user_id) REFERENCES users(id))'
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
        
        # Check traditional tokens first
        user_id = tokens.get(token)
        if user_id is not None:
            return user_id
        with get_db() as conn:
            row = conn.execute('SELECT user_id FROM tokens WHERE token=?', (token,)).fetchone()
            if row:
                tokens[token] = row['user_id']
                return row['user_id']
        
        # Check OAuth2 tokens
        oauth_user = oauth_manager.get_user_from_oauth_token(token)
        if oauth_user:
            return oauth_user['id']
    
    return None

@api_bp.route('/tracks', methods=['GET'])
@limiter.limit("30 per minute")
def get_tracks():
    try:
        with get_db() as conn:
            rows = conn.execute('SELECT id, title, url FROM tracks ORDER BY id DESC').fetchall()
        return jsonify({'tracks': [dict(row) for row in rows]})
    except Exception as e:
        logger.error(f"Error fetching tracks: {e}")
        return jsonify({'error': 'Failed to fetch tracks'}), 500

@api_bp.route('/tracks', methods=['POST'])
@limiter.limit("10 per minute")
def add_track():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json(silent=True) or {}
    title = data.get('title', '').strip()
    url = data.get('url', '').strip()
    
    if not title or not url:
        return jsonify({'error': 'Title and URL are required'}), 400
    
    if len(title) > 200 or len(url) > 500:
        return jsonify({'error': 'Title or URL too long'}), 400
    
    try:
        with get_db() as conn:
            cur = conn.execute('INSERT INTO tracks (title, url) VALUES (?, ?)', (title, url))
            conn.commit()
            track = {'id': cur.lastrowid, 'title': title, 'url': url}
        return jsonify(track), 201
    except Exception as e:
        logger.error(f"Error adding track: {e}")
        return jsonify({'error': 'Failed to add track'}), 500

@api_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    is_premium = data.get('is_premium', False)
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    if len(username) < 3 or len(username) > 50:
        return jsonify({'error': 'Username must be 3-50 characters'}), 400
    
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    pw_hash = generate_password_hash(password)
    try:
        with get_db() as conn:
            cur = conn.execute(
                'INSERT INTO users (username, password_hash, is_premium) VALUES (?, ?, ?)',
                (username, pw_hash, is_premium),
            )
            conn.commit()
            user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        return jsonify({'error': 'Registration failed'}), 500
    
    token = secrets.token_hex(32)
    try:
        with get_db() as conn:
            conn.execute('INSERT INTO tokens (token, user_id) VALUES (?, ?)', (token, user_id))
            conn.commit()
        tokens[token] = user_id
        return jsonify({'token': token})
    except Exception as e:
        logger.error(f"Error creating token: {e}")
        return jsonify({'error': 'Registration completed but login failed'}), 500

@api_bp.route('/forums', methods=['GET'])
@limiter.limit("30 per minute")
def get_forums():
    try:
        with get_db() as conn:
            rows = conn.execute('SELECT id, name, description, premium_only FROM forums ORDER BY id DESC').fetchall()
        return jsonify({'forums': [dict(row) for row in rows]})
    except Exception as e:
        logger.error(f"Error fetching forums: {e}")
        return jsonify({'error': 'Failed to fetch forums'}), 500

@api_bp.route('/forums', methods=['POST'])
@limiter.limit("10 per minute")
def create_forum():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    description = data.get('description', '')
    premium_only = data.get('premium_only', True)
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    try:
        with get_db() as conn:
            cur = conn.execute('INSERT INTO forums (name, description, premium_only) VALUES (?, ?, ?)', (name, description, premium_only))
            conn.commit()
            forum = {'id': cur.lastrowid, 'name': name, 'description': description, 'premium_only': premium_only}
        return jsonify(forum), 201
    except Exception as e:
        logger.error(f"Error creating forum: {e}")
        return jsonify({'error': 'Failed to create forum'}), 500

@api_bp.route('/forums/<int:forum_id>/messages', methods=['GET'])
@limiter.limit("30 per minute")
def get_messages(forum_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    with get_db() as conn:
        row = conn.execute('SELECT premium_only FROM forums WHERE id = ?', (forum_id,)).fetchone()
        if not row:
            return jsonify({'error': 'Forum not found'}), 404
        if row['premium_only']:
            user_row = conn.execute('SELECT is_premium FROM users WHERE id = ?', (user_id,)).fetchone()
            if not user_row or not user_row['is_premium']:
                return jsonify({'error': 'Premium access required'}), 403
    
        rows = conn.execute('SELECT m.id, m.content, m.timestamp, u.username FROM messages m JOIN users u ON m.user_id = u.id WHERE m.forum_id = ? ORDER BY m.timestamp ASC', (forum_id,)).fetchall()
    return jsonify({'messages': [dict(row) for row in rows]})

@api_bp.route('/forums/<int:forum_id>/messages', methods=['POST'])
@limiter.limit("20 per minute")
def post_message(forum_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    with get_db() as conn:
        row = conn.execute('SELECT premium_only FROM forums WHERE id = ?', (forum_id,)).fetchone()
        if not row:
            return jsonify({'error': 'Forum not found'}), 404
        if row['premium_only']:
            user_row = conn.execute('SELECT is_premium FROM users WHERE id = ?', (user_id,)).fetchone()
            if not user_row or not user_row['is_premium']:
                return jsonify({'error': 'Premium access required'}), 403
    
    data = request.get_json(silent=True) or {}
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({'error': 'Content is required'}), 400
    
    try:
        with get_db() as conn:
            cur = conn.execute('INSERT INTO messages (forum_id, user_id, content) VALUES (?, ?, ?)', (forum_id, user_id, content))
            conn.commit()
            message = {'id': cur.lastrowid, 'forum_id': forum_id, 'user_id': user_id, 'content': content}
        return jsonify(message), 201
    except Exception as e:
        logger.error(f"Error posting message: {e}")
        return jsonify({'error': 'Failed to post message'}), 500

@api_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    try:
        with get_db() as conn:
            row = conn.execute(
                'SELECT id, password_hash FROM users WHERE username=?', (username,)
            ).fetchone()
        
        if not row or not check_password_hash(row['password_hash'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        token = secrets.token_hex(32)
        with get_db() as conn:
            conn.execute('INSERT INTO tokens (token, user_id) VALUES (?, ?)', (token, row['id']))
            conn.commit()
        tokens[token] = row['id']
        return jsonify({'token': token})
    except Exception as e:
        logger.error(f"Error during login: {e}")
        return jsonify({'error': 'Login failed'}), 500

@api_bp.route('/auth/user', methods=['GET'])
@limiter.limit("30 per minute")
def get_current_user():
    """Get current user information including premium status"""
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        token = auth.split(' ', 1)[1]
        
        # Check OAuth2 user
        oauth_user = oauth_manager.get_user_from_oauth_token(token)
        if oauth_user:
            return jsonify({
                'id': oauth_user['id'],
                'name': oauth_user['name'],
                'email': oauth_user['email'],
                'avatar_url': oauth_user['avatar_url'],
                'provider': oauth_user['provider'],
                'auth_type': 'oauth2',
                'is_premium': False  # Default for OAuth users; adjust if needed
            })
        
        # Check traditional user
        user_id = get_user_id_from_token()
        if user_id:
            with get_db() as conn:
                conn.row_factory = sqlite3.Row
                user = conn.execute('SELECT id, username, is_premium FROM users WHERE id = ?', (user_id,)).fetchone()
                if user:
                    return jsonify({
                        'id': user['id'],
                        'name': user['username'],
                        'email': None,
                        'avatar_url': None,
                        'provider': 'local',
                        'auth_type': 'traditional',
                        'is_premium': bool(user['is_premium'])
                    })
    
    return jsonify({'error': 'Unauthorized'}), 401

@api_bp.route('/youtube')
@limiter.limit("20 per minute")
@cache.cached(timeout=300)  # Cache for 5 minutes
def youtube_videos():
    """Return recent YouTube videos for a given channel."""
    channel_id = request.args.get('channel_id') or request.args.get('channelId')
    if not channel_id:
        return jsonify({'error': 'channel_id required'}), 400
    
    try:
        data = get_latest_videos(channel_id)
        return jsonify(data)
    except Exception as exc:
        logger.error('Error fetching YouTube videos: %s', exc, exc_info=True)
        return jsonify({'error': 'Failed to fetch YouTube videos. Please try again later.'}), 500

def get_smart_fallback_response(question):
    """Generate intelligent fallback responses based on question content."""
    question_lower = question.lower()
    
    # Music style questions
    if any(word in question_lower for word in ['music', 'style', 'genre', 'sound', 'play', 'track', 'song']):
        return "I specialize in underground electronic music - primarily house, techno, hardstyle, and uptempo. My sets blend high-energy beats with dark, atmospheric elements that get crowds moving. Each performance is crafted to take listeners on a journey through different electronic subgenres."
    
    # Booking questions
    elif any(word in question_lower for word in ['book', 'booking', 'event', 'party', 'gig', 'hire', 'available', 'schedule']):
        return "I'm available for bookings at clubs, festivals, private events, and underground parties. My setup includes professional DJ equipment and lighting to create an immersive experience. For booking inquiries, rates, and availability, please use the contact form or reach out directly through the booking page."
    
    # Equipment questions
    elif any(word in question_lower for word in ['equipment', 'setup', 'gear', 'mixer', 'turntable', 'cdj', 'controller']):
        return "My setup features professional-grade DJ equipment including CDJs, mixers, and a comprehensive lighting system. I bring my own gear to ensure consistent sound quality and can adapt to different venue requirements. The setup is designed to create that signature underground atmosphere."
    
    # Experience questions
    elif any(word in question_lower for word in ['experience', 'years', 'long', 'started', 'career', 'history']):
        return "I've been DJing in the underground electronic scene for several years, developing my signature sound that blends multiple electronic genres. My experience spans intimate club settings to larger festival stages, always focusing on creating that perfect energy connection with the crowd."
    
    # Location questions
    elif any(word in question_lower for word in ['where', 'location', 'based', 'travel', 'area', 'country', 'city']):
        return "I'm based in the Netherlands and regularly perform throughout Europe. I'm available for travel to international venues and festivals. My goal is to bring the authentic underground electronic experience wherever the music calls."
    
    # Social media questions
    elif any(word in question_lower for word in ['social', 'instagram', 'facebook', 'follow', 'youtube', 'twitter']):
        return "You can follow my journey on various social platforms where I share behind-the-scenes content, upcoming gigs, and new mixes. Check out my latest tracks and videos in the Music and Gallery sections of this site for the most up-to-date content."
    
    # Performance questions
    elif any(word in question_lower for word in ['perform', 'show', 'live', 'set', 'mix', 'crowd']):
        return "My performances are all about creating an immersive underground experience. I read the crowd and adapt my sets in real-time, building energy through carefully crafted transitions between house, techno, and hardstyle. Every show is unique and designed to take the audience on an unforgettable journey."
    
    # Technical questions
    elif any(word in question_lower for word in ['how', 'what', 'why', 'when', 'technique', 'method']):
        return "My approach combines technical precision with creative intuition. I focus on seamless mixing, harmonic blending, and reading the energy of the room. The key is understanding how different electronic genres can flow together to create something greater than the sum of their parts."
    
    # General questions
    else:
        return f"Thanks for your question about '{question}'! I'm TheBadGuy, an underground electronic music DJ specializing in house, techno, hardstyle, and uptempo. Whether you're interested in bookings, my music style, or just want to connect, feel free to explore the site or reach out through the contact page for more specific information."

@api_bp.route('/ask', methods=['POST'])
@limiter.limit("10 per minute")
def ask_dj():
    """AI chat endpoint for asking questions about TheBadGuy."""
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized - Login required'}), 401
    
    with get_db() as conn:
        row = conn.execute('SELECT is_premium FROM users WHERE id = ?', (user_id,)).fetchone()
        if not row or not row['is_premium']:
            return jsonify({'error': 'Premium access required'}), 403
    
    data = request.get_json(silent=True) or {}
    question = data.get('question', '').strip()
    
    if not question:
        return jsonify({'error': 'Question is required'}), 400
    
    if len(question) > 1000:
        return jsonify({'error': 'Question too long (max 1000 characters)'}), 400
    
    # Dummy ai_ask function for testing patching
    def ai_ask(question):
        return {'text': 'Test AI response'}
    
    # Expose ai_ask globally for patching in tests
    app.ai_ask = ai_ask
    
    try:
        # Try to use available AI logic modules with better error handling
        response_text = None
        
        try:
            from worker_logic import ask as worker_ai_ask
            response = worker_ai_ask(question)
            response_text = response.get('text', str(response)) if isinstance(response, dict) else str(response)
            logger.info("Used worker_logic for AI response")
        except ImportError:
            logger.debug("worker_logic not available")
        except Exception as e:
            logger.warning(f"worker_logic failed: {e}")
        
        if not response_text:
            try:
                from gemini_logic import ask as gemini_ask
                response = gemini_ask(question)
                response_text = response.get('text', str(response)) if isinstance(response, dict) else str(response)
                logger.info("Used gemini_logic for AI response")
            except ImportError:
                logger.debug("gemini_logic not available")
            except Exception as e:
                logger.warning(f"gemini_logic failed: {e}")
        
        if not response_text:
            try:
                from huggingface_logic import ask as hf_ask
                response = hf_ask(question)
                response_text = response.get('text', str(response)) if isinstance(response, dict) else str(response)
                logger.info("Used huggingface_logic for AI response")
            except ImportError:
                logger.debug("huggingface_logic not available")
            except Exception as e:
                logger.warning(f"huggingface_logic failed: {e}")
        
        # Enhanced intelligent fallback response
        if not response_text:
            logger.warning("No AI modules available, using intelligent fallback response")
            response_text = get_smart_fallback_response(question)
        
        return jsonify({
            'choices': [{
                'message': {
                    'content': response_text
                }
            }]
        })
        
    except Exception as exc:
        logger.error("Error processing AI question: %s", exc, exc_info=True)
        return jsonify({'error': 'Sorry, I\'m having trouble processing your question right now. Please try again later.'}), 500

# Exempt API endpoints from CSRF protection
csrf.exempt(api_bp)

# Register blueprint
app.register_blueprint(api_bp)

@app.errorhandler(404)
def not_found_error(error):
    return send_from_directory(app.static_folder, '404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', '8000'))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
