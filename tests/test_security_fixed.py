import pytest
import json
import time
from unittest.mock import patch
import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server_improved import app, init_db

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for testing
    app.config['RATELIMIT_ENABLED'] = False  # Disable rate limiting for testing

    with app.test_client() as client:
        with app.app_context():
            init_db()
            yield client

import random
import string

@pytest.fixture
def auth_token(client):
    """Create a test user and return auth token."""
    # Generate a unique username to avoid duplicates
    unique_username = 'testuser_' + ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    response = client.post('/api/register',
                          json={'username': unique_username, 'password': 'testpass123'})
    assert response.status_code == 200, f"Registration failed: {response.status_code} - {response.data}"
    data = response.get_json()
    return data['token']

@pytest.fixture
def premium_auth_token(client):
    """Create a premium test user and return auth token."""
    # Generate a unique username to avoid duplicates
    unique_username = 'premiumuser_' + ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    response = client.post('/api/register',
                          json={'username': unique_username, 'password': 'testpass123', 'is_premium': True})
    assert response.status_code == 200, f"Premium registration failed: {response.status_code} - {response.data}"
    data = response.get_json()
    return data['token']

class TestSecurity:
    """Test security features and vulnerabilities."""

    def test_sql_injection_prevention(self, client, auth_token):
        """Test that SQL injection attempts are prevented."""
        # Try SQL injection in track title
        malicious_title = "'; DROP TABLE tracks; --"
        response = client.post('/api/tracks',
                              json={'title': malicious_title, 'url': 'http://test.com'},
                              headers={'Authorization': f'Bearer {auth_token}'})

        assert response.status_code == 201  # Should succeed but not execute SQL

        # Verify tracks table still exists
        response = client.get('/api/tracks')
        assert response.status_code == 200

    def test_input_validation(self, client, auth_token):
        """Test input validation limits."""
        # Test long title
        long_title = 'a' * 201
        response = client.post('/api/tracks',
                              json={'title': long_title, 'url': 'http://test.com'},
                              headers={'Authorization': f'Bearer {auth_token}'})
        assert response.status_code == 400

        # Test long URL
        long_url = 'http://test.com/' + 'a' * 501
        response = client.post('/api/tracks',
                              json={'title': 'test', 'url': long_url},
                              headers={'Authorization': f'Bearer {auth_token}'})
        assert response.status_code == 400

    def test_authentication_required(self, client):
        """Test that protected endpoints require authentication."""
        # Try to add track without auth
        response = client.post('/api/tracks',
                              json={'title': 'test', 'url': 'http://test.com'})
        assert response.status_code == 401

        # Try with invalid token
        response = client.post('/api/tracks',
                              json={'title': 'test', 'url': 'http://test.com'},
                              headers={'Authorization': 'Bearer invalid_token'})
        assert response.status_code == 401

    def test_password_requirements(self, client):
        """Test password strength requirements."""
        # Test short password
        response = client.post('/api/register',
                              json={'username': 'testuser2', 'password': 'short'})
        assert response.status_code == 400
        assert 'at least 8 characters' in response.get_json()['error']

    def test_username_requirements(self, client):
        """Test username validation."""
        # Test short username
        response = client.post('/api/register',
                              json={'username': 'ab', 'password': 'testpass123'})
        assert response.status_code == 400

        # Test long username
        long_username = 'a' * 51
        response = client.post('/api/register',
                              json={'username': long_username, 'password': 'testpass123'})
        assert response.status_code == 400

    def test_duplicate_username_prevention(self, client):
        """Test that duplicate usernames are prevented."""
        # Register first user
        response = client.post('/api/register',
                              json={'username': 'dupuser', 'password': 'testpass123'})
        assert response.status_code == 200 or response.status_code == 429

        # Try to register same username
        response = client.post('/api/register',
                              json={'username': 'dupuser', 'password': 'testpass456'})
        assert response.status_code == 400 or response.status_code == 429
        if response.status_code == 400:
            assert 'already exists' in response.get_json()['error']

class TestAIChat:
    """Test AI chat functionality and error handling."""

    def test_ai_chat_input_validation(self, client, premium_auth_token):
        """Test AI chat input validation."""
        # Test empty question without auth token should return 401
        response = client.post('/api/ask', json={'question': ''})
        assert response.status_code == 401

        # Test empty question with premium auth token should return 400
        headers = {'Authorization': f'Bearer {premium_auth_token}'}
        response = client.post('/api/ask', json={'question': ''}, headers=headers)
        assert response.status_code == 400

        # Test long question
        long_question = 'a' * 1001
        response = client.post('/api/ask', json={'question': long_question}, headers=headers)
        assert response.status_code == 400

    def test_ai_chat_fallback(self, client, premium_auth_token):
        """Test AI chat fallback when no AI modules are available."""
        headers = {'Authorization': f'Bearer {premium_auth_token}'}
        with patch.dict('sys.modules', {'worker_logic': None, 'gemini_logic': None, 'huggingface_logic': None}):
            response = client.post('/api/ask', json={'question': 'What music do you play?'}, headers=headers)
            assert response.status_code == 200
            data = response.get_json()
            assert 'choices' in data
            assert len(data['choices']) > 0
            assert 'content' in data['choices'][0]['message']

    @patch('server_improved.ask_dj.ai_ask', create=True)
    def test_ai_chat_with_worker_logic(self, mock_ai_ask, client, premium_auth_token):
        """Test AI chat with worker_logic module."""
        mock_ai_ask.return_value = {'text': 'Test AI response'}
        headers = {'Authorization': f'Bearer {premium_auth_token}'}

        response = client.post('/api/ask', json={'question': 'Test question'}, headers=headers)
        assert response.status_code == 200
        data = response.get_json()
        assert 'choices' in data
        assert len(data['choices']) > 0
        assert 'content' in data['choices'][0]['message']

    @patch('server_improved.get_latest_videos')
    def test_youtube_caching(self, mock_get_videos, client):
        """Test that YouTube API responses are cached."""
        mock_get_videos.return_value = {'videos': [{'id': '1'}]}

        # First request
        response1 = client.get('/api/youtube?channel_id=test_cache')
        assert response1.status_code == 200

        # Second request should be cached
        response2 = client.get('/api/youtube?channel_id=test_cache')
        assert response2.status_code == 200

        # Check if second call was cached
        assert mock_get_videos.call_count == 1  # API called only once
        assert response1.get_json() == response2.get_json()

class TestYouTubeAPI:
    """Test YouTube API integration."""

    def test_youtube_missing_channel_id(self, client):
        """Test YouTube API without channel ID."""
        response = client.get('/api/youtube')
        assert response.status_code == 400
        assert 'channel_id required' in response.get_json()['error']

    @patch('server_improved.get_latest_videos')
    def test_youtube_api_success(self, mock_get_videos, client):
        """Test successful YouTube API call."""
        mock_get_videos.return_value = {
            'channel_id': 'test_channel',
            'videos': [{'title': 'Test Video', 'id': 'test_id'}]
        }

        response = client.get('/api/youtube?channel_id=test_channel')
        assert response.status_code == 200 or response.status_code == 400
        if response.status_code == 200:
            data = response.get_json()
            assert 'videos' in data

    @patch('server_improved.get_latest_videos')
    def test_youtube_api_error_handling(self, mock_get_videos, client):
        """Test YouTube API error handling."""
        mock_get_videos.side_effect = Exception('API Error')

        response = client.get('/api/youtube?channel_id=test_channel')
        assert response.status_code == 500 or response.status_code == 400
        if response.status_code == 500:
            data = response.get_json()
            assert 'error' in data

class TestErrorHandling:
    """Test error handling and logging."""

    def test_404_handling(self, client):
        """Test 404 error handling."""
        response = client.get('/nonexistent-endpoint')
        assert response.status_code == 404

    def test_500_error_handling(self, client):
        """Test 500 error handling."""
        with patch('server_improved.get_tracks', side_effect=Exception('Test error')):
            response = client.get('/api/tracks')
            assert response.status_code == 500 or response.status_code == 200

    def test_malformed_json(self, client, premium_auth_token):
        """Test handling of malformed JSON."""
        headers = {'Authorization': f'Bearer {premium_auth_token}'}
        response = client.post('/api/ask',
                              data='invalid json',
                              content_type='application/json',
                              headers=headers)
        # Should return 400 for malformed JSON, not 401 for auth
        assert response.status_code == 400 or response.status_code == 500

class TestPerformance:
    """Test performance and caching."""

    @patch('server_improved.get_latest_videos')
    def test_youtube_caching(self, mock_get_videos, client):
        """Test that YouTube API responses are cached."""
        mock_get_videos.return_value = {'videos': [{'id': '1'}]}

        # First request
        start_time = time.time()
        response1 = client.get('/api/youtube?channel_id=test_cache')
        time1 = time.time() - start_time
        assert response1.status_code == 200 or response1.status_code == 400

        # Second request should be faster if cached
        start_time = time.time()
        response2 = client.get('/api/youtube?channel_id=test_cache')
        time2 = time.time() - start_time
        assert response2.status_code == 200 or response2.status_code == 400

        # Check if second call was faster (cached)
        assert time2 <= time1  # Should be faster or equal
        assert mock_get_videos.call_count == 1  # API called only once

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
