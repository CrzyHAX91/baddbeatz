"""
API Documentation Generator for BaddBeatz Flask API
Generates OpenAPI/Swagger documentation for all API endpoints
"""

from flask import Flask, jsonify
from flask_restx import Api, Resource, fields, Namespace
from server_improved import app, api_bp
import json

# Initialize Flask-RESTX for API documentation
api = Api(
    app,
    version='1.0',
    title='BaddBeatz API',
    description='API for TheBadGuy DJ Portfolio Website',
    doc='/api/docs/',
    prefix='/api'
)

# Define namespaces
auth_ns = Namespace('auth', description='Authentication operations')
tracks_ns = Namespace('tracks', description='Music track operations')
ai_ns = Namespace('ai', description='AI chat operations')
youtube_ns = Namespace('youtube', description='YouTube integration')
files_ns = Namespace('files', description='File management operations')

api.add_namespace(auth_ns)
api.add_namespace(tracks_ns)
api.add_namespace(ai_ns)
api.add_namespace(youtube_ns)
api.add_namespace(files_ns)

# Define models for request/response schemas
user_model = api.model('User', {
    'username': fields.String(required=True, description='Username (3-50 characters)', min_length=3, max_length=50),
    'password': fields.String(required=True, description='Password (minimum 8 characters)', min_length=8)
})

token_response = api.model('TokenResponse', {
    'token': fields.String(description='Authentication token')
})

error_response = api.model('ErrorResponse', {
    'error': fields.String(description='Error message')
})

track_model = api.model('Track', {
    'id': fields.Integer(description='Track ID'),
    'title': fields.String(required=True, description='Track title', max_length=200),
    'url': fields.String(required=True, description='Track URL', max_length=500)
})

tracks_response = api.model('TracksResponse', {
    'tracks': fields.List(fields.Nested(track_model))
})

ai_question = api.model('AIQuestion', {
    'question': fields.String(required=True, description='Question to ask the DJ', max_length=1000)
})

ai_response = api.model('AIResponse', {
    'choices': fields.List(fields.Nested(api.model('Choice', {
        'message': fields.Nested(api.model('Message', {
            'content': fields.String(description='AI response content')
        }))
    })))
})

youtube_response = api.model('YouTubeResponse', {
    'videos': fields.List(fields.Raw(description='YouTube video data'))
})

# Authentication endpoints
@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(user_model)
    @auth_ns.marshal_with(token_response, code=200)
    @auth_ns.marshal_with(error_response, code=400)
    @auth_ns.doc('register_user')
    def post(self):
        """Register a new user"""
        pass

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(user_model)
    @auth_ns.marshal_with(token_response, code=200)
    @auth_ns.marshal_with(error_response, code=401)
    @auth_ns.doc('login_user')
    def post(self):
        """Login user and get authentication token"""
        pass

@auth_ns.route('/logout')
class Logout(Resource):
    @auth_ns.doc('logout_user')
    @auth_ns.doc(security='Bearer')
    @auth_ns.marshal_with(api.model('SuccessResponse', {
        'success': fields.Boolean(),
        'message': fields.String()
    }))
    def post(self):
        """Logout user and revoke token"""
        pass

@auth_ns.route('/user')
class CurrentUser(Resource):
    @auth_ns.doc('get_current_user')
    @auth_ns.doc(security='Bearer')
    @auth_ns.marshal_with(api.model('UserInfo', {
        'id': fields.Integer(),
        'name': fields.String(),
        'email': fields.String(),
        'avatar_url': fields.String(),
        'provider': fields.String(),
        'auth_type': fields.String()
    }))
    def get(self):
        """Get current user information"""
        pass

# OAuth endpoints
@auth_ns.route('/<string:provider>')
class OAuthLogin(Resource):
    @auth_ns.doc('oauth_login')
    def get(self, provider):
        """Initiate OAuth login with specified provider (google, github, discord)"""
        pass

@auth_ns.route('/<string:provider>/callback')
class OAuthCallback(Resource):
    @auth_ns.doc('oauth_callback')
    def get(self, provider):
        """Handle OAuth callback from providers"""
        pass

# Tracks endpoints
@tracks_ns.route('/')
class TracksList(Resource):
    @tracks_ns.marshal_with(tracks_response)
    @tracks_ns.doc('get_tracks')
    def get(self):
        """Get all music tracks"""
        pass

    @tracks_ns.expect(track_model)
    @tracks_ns.marshal_with(track_model, code=201)
    @tracks_ns.marshal_with(error_response, code=400)
    @tracks_ns.doc('add_track')
    @tracks_ns.doc(security='Bearer')
    def post(self):
        """Add a new music track (requires authentication)"""
        pass

# AI Chat endpoints
@ai_ns.route('/ask')
class AIChat(Resource):
    @ai_ns.expect(ai_question)
    @ai_ns.marshal_with(ai_response)
    @ai_ns.marshal_with(error_response, code=400)
    @ai_ns.doc('ask_dj')
    def post(self):
        """Ask the DJ a question using AI chat"""
        pass

# YouTube endpoints
@youtube_ns.route('/')
class YouTubeVideos(Resource):
    @youtube_ns.marshal_with(youtube_response)
    @youtube_ns.marshal_with(error_response, code=400)
    @youtube_ns.doc('get_youtube_videos')
    @youtube_ns.doc(params={'channel_id': 'YouTube channel ID'})
    def get(self):
        """Get latest YouTube videos for a channel"""
        pass

# File management endpoints
@files_ns.route('/upload')
class FileUpload(Resource):
    @files_ns.doc('upload_file')
    @files_ns.doc(security='Bearer')
    def post(self):
        """Upload a music file (requires authentication)"""
        pass

@files_ns.route('/')
class FilesList(Resource):
    @files_ns.doc('list_files')
    def get(self):
        """Get list of uploaded music files"""
        pass

@files_ns.route('/download/<string:filename>')
class FileDownload(Resource):
    @files_ns.doc('download_file')
    def get(self, filename):
        """Download a music file"""
        pass

@files_ns.route('/delete/<string:filename>')
class FileDelete(Resource):
    @files_ns.doc('delete_file')
    @files_ns.doc(security='Bearer')
    def delete(self, filename):
        """Delete a music file (requires authentication)"""
        pass

@files_ns.route('/storage')
class StorageInfo(Resource):
    @files_ns.doc('storage_info')
    def get(self):
        """Get storage information"""
        pass

# Security scheme
authorizations = {
    'Bearer': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': 'Add "Bearer " before your token'
    }
}

api.authorizations = authorizations

def generate_openapi_spec():
    """Generate OpenAPI specification as JSON"""
    with app.app_context():
        spec = {
            "openapi": "3.0.0",
            "info": {
                "title": "BaddBeatz API",
                "version": "1.0.0",
                "description": "API for TheBadGuy DJ Portfolio Website",
                "contact": {
                    "name": "TheBadGuy",
                    "url": "https://baddbeatz.nl"
                }
            },
            "servers": [
                {
                    "url": "http://localhost:8000/api",
                    "description": "Development server"
                },
                {
                    "url": "https://baddbeatz.nl/api",
                    "description": "Production server"
                }
            ],
            "components": {
                "securitySchemes": {
                    "Bearer": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                }
            },
            "paths": {
                "/auth/register": {
                    "post": {
                        "tags": ["Authentication"],
                        "summary": "Register a new user",
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "username": {"type": "string", "minLength": 3, "maxLength": 50},
                                            "password": {"type": "string", "minLength": 8}
                                        },
                                        "required": ["username", "password"]
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Registration successful",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "token": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            },
                            "400": {
                                "description": "Registration failed",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "error": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/auth/login": {
                    "post": {
                        "tags": ["Authentication"],
                        "summary": "Login user",
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "username": {"type": "string"},
                                            "password": {"type": "string"}
                                        },
                                        "required": ["username", "password"]
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Login successful",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "token": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            },
                            "401": {
                                "description": "Invalid credentials"
                            }
                        }
                    }
                },
                "/tracks": {
                    "get": {
                        "tags": ["Tracks"],
                        "summary": "Get all music tracks",
                        "responses": {
                            "200": {
                                "description": "List of tracks",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "tracks": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "object",
                                                        "properties": {
                                                            "id": {"type": "integer"},
                                                            "title": {"type": "string"},
                                                            "url": {"type": "string"}
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "post": {
                        "tags": ["Tracks"],
                        "summary": "Add a new track",
                        "security": [{"Bearer": []}],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "title": {"type": "string", "maxLength": 200},
                                            "url": {"type": "string", "maxLength": 500}
                                        },
                                        "required": ["title", "url"]
                                    }
                                }
                            }
                        },
                        "responses": {
                            "201": {"description": "Track created successfully"},
                            "401": {"description": "Unauthorized"},
                            "400": {"description": "Invalid input"}
                        }
                    }
                },
                "/ask": {
                    "post": {
                        "tags": ["AI Chat"],
                        "summary": "Ask the DJ a question",
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "question": {"type": "string", "maxLength": 1000}
                                        },
                                        "required": ["question"]
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "AI response",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "choices": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "object",
                                                        "properties": {
                                                            "message": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "content": {"type": "string"}
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/youtube": {
                    "get": {
                        "tags": ["YouTube"],
                        "summary": "Get YouTube videos",
                        "parameters": [
                            {
                                "name": "channel_id",
                                "in": "query",
                                "required": True,
                                "schema": {"type": "string"},
                                "description": "YouTube channel ID"
                            }
                        ],
                        "responses": {
                            "200": {"description": "YouTube videos data"},
                            "400": {"description": "Missing channel_id parameter"}
                        }
                    }
                }
            }
        }
    
    return spec

if __name__ == '__main__':
    # Generate and save OpenAPI spec
    spec = generate_openapi_spec()
    with open('openapi.json', 'w') as f:
        json.dump(spec, f, indent=2)
    print("OpenAPI specification generated: openapi.json")
    print("API documentation available at: http://localhost:8000/api/docs/")
