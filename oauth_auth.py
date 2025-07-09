import os
import secrets
import sqlite3
from typing import Optional, Dict, Any
from authlib.integrations.flask_client import OAuth
from flask import Flask, session, request, jsonify, redirect, url_for
import requests
from dotenv import load_dotenv

load_dotenv()

class OAuth2Manager:
    def __init__(self, app: Flask, db_path: str):
        self.app = app
        self.db_path = db_path
        self.oauth = OAuth(app)
        self.setup_oauth_providers()
        self.init_oauth_db()
    
    def setup_oauth_providers(self):
        """Setup OAuth2 providers (Google, GitHub, Discord)"""
        
        # Google OAuth2
        self.google = self.oauth.register(
            name='google',
            client_id=os.getenv('GOOGLE_CLIENT_ID'),
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
            access_token_url='https://oauth2.googleapis.com/token',
            authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
            api_base_url='https://www.googleapis.com/oauth2/v2/',
            client_kwargs={
                'scope': 'openid email profile'
            }
        )
        
        # GitHub OAuth2
        self.github = self.oauth.register(
            name='github',
            client_id=os.getenv('GITHUB_CLIENT_ID'),
            client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
            access_token_url='https://github.com/login/oauth/access_token',
            authorize_url='https://github.com/login/oauth/authorize',
            api_base_url='https://api.github.com/',
            client_kwargs={'scope': 'user:email'},
        )
        
        # Discord OAuth2
        self.discord = self.oauth.register(
            name='discord',
            client_id=os.getenv('DISCORD_CLIENT_ID'),
            client_secret=os.getenv('DISCORD_CLIENT_SECRET'),
            access_token_url='https://discord.com/api/oauth2/token',
            authorize_url='https://discord.com/api/oauth2/authorize',
            api_base_url='https://discord.com/api/',
            client_kwargs={'scope': 'identify email'},
        )
    
    def init_oauth_db(self):
        """Initialize OAuth2 database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS oauth_users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    provider TEXT NOT NULL,
                    provider_id TEXT NOT NULL,
                    email TEXT,
                    name TEXT,
                    avatar_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(provider, provider_id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS oauth_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    token TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES oauth_users (id)
                )
            ''')
            
            conn.commit()
    
    def get_or_create_oauth_user(self, provider: str, user_info: Dict[str, Any]) -> int:
        """Get or create OAuth user in database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            # Try to find existing user
            user = conn.execute(
                'SELECT id FROM oauth_users WHERE provider = ? AND provider_id = ?',
                (provider, str(user_info['id']))
            ).fetchone()
            
            if user:
                return user['id']
            
            # Create new user
            cursor = conn.execute('''
                INSERT INTO oauth_users (provider, provider_id, email, name, avatar_url)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                provider,
                str(user_info['id']),
                user_info.get('email'),
                user_info.get('name'),
                user_info.get('avatar_url')
            ))
            
            conn.commit()
            return cursor.lastrowid
    
    def create_oauth_token(self, user_id: int) -> str:
        """Create OAuth token for user"""
        token = secrets.token_hex(32)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                'INSERT INTO oauth_tokens (user_id, token) VALUES (?, ?)',
                (user_id, token)
            )
            conn.commit()
        
        return token
    
    def get_user_from_oauth_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Get user info from OAuth token"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            result = conn.execute('''
                SELECT ou.*, ot.token 
                FROM oauth_users ou
                JOIN oauth_tokens ot ON ou.id = ot.user_id
                WHERE ot.token = ?
            ''', (token,)).fetchone()
            
            if result:
                return dict(result)
            return None
    
    def handle_google_callback(self, code: str) -> Dict[str, Any]:
        """Handle Google OAuth2 callback"""
        try:
            token = self.google.authorize_access_token()
            user_info = token.get('userinfo')
            
            if user_info:
                user_data = {
                    'id': user_info['sub'],
                    'email': user_info.get('email'),
                    'name': user_info.get('name'),
                    'avatar_url': user_info.get('picture')
                }
                
                user_id = self.get_or_create_oauth_user('google', user_data)
                auth_token = self.create_oauth_token(user_id)
                
                return {
                    'success': True,
                    'token': auth_token,
                    'user': user_data
                }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def handle_github_callback(self, code: str) -> Dict[str, Any]:
        """Handle GitHub OAuth2 callback"""
        try:
            token = self.github.authorize_access_token()
            
            # Get user info
            resp = self.github.get('user', token=token)
            user_info = resp.json()
            
            # Get user email (might be private)
            email_resp = self.github.get('user/emails', token=token)
            emails = email_resp.json()
            primary_email = next((email['email'] for email in emails if email['primary']), None)
            
            user_data = {
                'id': user_info['id'],
                'email': primary_email or user_info.get('email'),
                'name': user_info.get('name') or user_info.get('login'),
                'avatar_url': user_info.get('avatar_url')
            }
            
            user_id = self.get_or_create_oauth_user('github', user_data)
            auth_token = self.create_oauth_token(user_id)
            
            return {
                'success': True,
                'token': auth_token,
                'user': user_data
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def handle_discord_callback(self, code: str) -> Dict[str, Any]:
        """Handle Discord OAuth2 callback"""
        try:
            token = self.discord.authorize_access_token()
            
            # Get user info
            resp = self.discord.get('users/@me', token=token)
            user_info = resp.json()
            
            user_data = {
                'id': user_info['id'],
                'email': user_info.get('email'),
                'name': f"{user_info.get('username')}#{user_info.get('discriminator')}",
                'avatar_url': f"https://cdn.discordapp.com/avatars/{user_info['id']}/{user_info.get('avatar')}.png" if user_info.get('avatar') else None
            }
            
            user_id = self.get_or_create_oauth_user('discord', user_data)
            auth_token = self.create_oauth_token(user_id)
            
            return {
                'success': True,
                'token': auth_token,
                'user': user_data
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def revoke_oauth_token(self, token: str) -> bool:
        """Revoke OAuth token"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('DELETE FROM oauth_tokens WHERE token = ?', (token,))
            conn.commit()
            return cursor.rowcount > 0
