import os
import logging
from werkzeug.utils import secure_filename
from flask import request, jsonify, send_file
import mimetypes
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads/music'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'wma'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(file_path):
    """Get file size in bytes."""
    try:
        return os.path.getsize(file_path)
    except OSError:
        return 0

def format_file_size(size_bytes):
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0B"
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    return f"{size_bytes:.1f}{size_names[i]}"

def upload_music_file(file, user_id=None):
    """
    Upload a music file to the server.
    
    Args:
        file: File object from request
        user_id: ID of the user uploading (optional)
        
    Returns:
        dict: Result with success status and file info
    """
    try:
        if not file or file.filename == '':
            return {'success': False, 'error': 'No file selected'}
        
        if not allowed_file(file.filename):
            return {'success': False, 'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}
        
        # Secure the filename
        filename = secure_filename(file.filename)
        if not filename:
            return {'success': False, 'error': 'Invalid filename'}
        
        # Add timestamp to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{timestamp}{ext}"
        
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Check file size before saving
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            return {'success': False, 'error': f'File too large. Maximum size: {format_file_size(MAX_FILE_SIZE)}'}
        
        # Save the file
        file.save(file_path)
        
        # Get file info
        file_info = {
            'filename': unique_filename,
            'original_name': file.filename,
            'size': file_size,
            'size_formatted': format_file_size(file_size),
            'upload_date': datetime.now().isoformat(),
            'user_id': user_id,
            'file_path': file_path
        }
        
        logger.info(f"File uploaded successfully: {unique_filename} ({format_file_size(file_size)})")
        
        return {
            'success': True,
            'message': 'File uploaded successfully',
            'file_info': file_info
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return {'success': False, 'error': f'Upload failed: {str(e)}'}

def get_music_files():
    """
    Get list of all uploaded music files.
    
    Returns:
        list: List of file information dictionaries
    """
    try:
        files = []
        
        if not os.path.exists(UPLOAD_FOLDER):
            return files
        
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            
            if os.path.isfile(file_path) and allowed_file(filename):
                file_size = get_file_size(file_path)
                file_stat = os.stat(file_path)
                
                file_info = {
                    'filename': filename,
                    'size': file_size,
                    'size_formatted': format_file_size(file_size),
                    'upload_date': datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                    'download_url': f'/api/download/{filename}'
                }
                
                files.append(file_info)
        
        # Sort by upload date (newest first)
        files.sort(key=lambda x: x['upload_date'], reverse=True)
        
        return files
        
    except Exception as e:
        logger.error(f"Error getting music files: {str(e)}")
        return []

def download_music_file(filename):
    """
    Download a music file.
    
    Args:
        filename: Name of the file to download
        
    Returns:
        Flask response object or error dict
    """
    try:
        # Secure the filename
        filename = secure_filename(filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return {'success': False, 'error': 'File not found'}
        
        if not allowed_file(filename):
            return {'success': False, 'error': 'File type not allowed'}
        
        # Get MIME type
        mime_type = mimetypes.guess_type(file_path)[0]
        if not mime_type:
            mime_type = 'application/octet-stream'
        
        logger.info(f"File downloaded: {filename}")
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype=mime_type
        )
        
    except Exception as e:
        logger.error(f"Error downloading file {filename}: {str(e)}")
        return {'success': False, 'error': f'Download failed: {str(e)}'}

def delete_music_file(filename, user_id=None):
    """
    Delete a music file.
    
    Args:
        filename: Name of the file to delete
        user_id: ID of the user requesting deletion (optional)
        
    Returns:
        dict: Result with success status
    """
    try:
        # Secure the filename
        filename = secure_filename(filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return {'success': False, 'error': 'File not found'}
        
        # Delete the file
        os.remove(file_path)
        
        logger.info(f"File deleted: {filename} by user {user_id}")
        
        return {
            'success': True,
            'message': 'File deleted successfully'
        }
        
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {str(e)}")
        return {'success': False, 'error': f'Delete failed: {str(e)}'}

def get_storage_info():
    """
    Get storage information.
    
    Returns:
        dict: Storage statistics
    """
    try:
        total_files = 0
        total_size = 0
        
        if os.path.exists(UPLOAD_FOLDER):
            for filename in os.listdir(UPLOAD_FOLDER):
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.isfile(file_path) and allowed_file(filename):
                    total_files += 1
                    total_size += get_file_size(file_path)
        
        return {
            'total_files': total_files,
            'total_size': total_size,
            'total_size_formatted': format_file_size(total_size),
            'max_file_size': MAX_FILE_SIZE,
            'max_file_size_formatted': format_file_size(MAX_FILE_SIZE),
            'allowed_extensions': list(ALLOWED_EXTENSIONS)
        }
        
    except Exception as e:
        logger.error(f"Error getting storage info: {str(e)}")
        return {
            'total_files': 0,
            'total_size': 0,
            'total_size_formatted': '0B',
            'max_file_size': MAX_FILE_SIZE,
            'max_file_size_formatted': format_file_size(MAX_FILE_SIZE),
            'allowed_extensions': list(ALLOWED_EXTENSIONS)
        }
