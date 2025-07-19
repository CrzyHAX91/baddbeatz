#!/usr/bin/env python3
"""
BaddBeatz Project Cleanup Script
Identifies and categorizes files for cleanup
"""

import os
import glob
from pathlib import Path

def analyze_project():
    """Analyze project structure and identify cleanup targets"""
    
    # Documentation files to review
    doc_patterns = [
        "*SUMMARY*.md", "*GUIDE*.md", "*REPORT*.md", 
        "*COMPLETE*.md", "*FIX*.md", "*IMPLEMENTATION*.md"
    ]
    
    # Temporary/build files
    temp_patterns = [
        "temp_venv/", "__pycache__/", "*.pyc", "*.pyo",
        ".coverage", "coverage.xml", "*.log"
    ]
    
    # Duplicate/redundant files
    duplicate_patterns = [
        "server*.py", "requirements*.txt", "test*.py"
    ]
    
    print("🔍 BaddBeatz Project Analysis")
    print("=" * 50)
    
    # Find documentation files
    print("\n📚 Documentation Files Found:")
    doc_files = []
    for pattern in doc_patterns:
        files = glob.glob(pattern, recursive=True)
        doc_files.extend(files)
    
    for file in sorted(doc_files):
        size = os.path.getsize(file) if os.path.exists(file) else 0
        print(f"  - {file} ({size} bytes)")
    
    print(f"\nTotal documentation files: {len(doc_files)}")
    
    # Find temporary files
    print("\n🗑️ Temporary/Build Files:")
    temp_files = []
    for pattern in temp_patterns:
        if pattern.endswith('/'):
            # Directory
            if os.path.exists(pattern):
                temp_files.append(pattern)
                print(f"  - {pattern} (directory)")
        else:
            # File pattern
            files = glob.glob(pattern, recursive=True)
            temp_files.extend(files)
            for file in files:
                print(f"  - {file}")
    
    # Find potential duplicates
    print("\n🔄 Potential Duplicate Files:")
    for pattern in duplicate_patterns:
        files = glob.glob(pattern)
        if len(files) > 1:
            print(f"  Pattern '{pattern}':")
            for file in files:
                size = os.path.getsize(file) if os.path.exists(file) else 0
                print(f"    - {file} ({size} bytes)")
    
    # Audio files analysis
    print("\n🎵 Audio Files Analysis:")
    audio_files = glob.glob("assets/audio/*.mp3", recursive=True)
    total_audio_size = sum(os.path.getsize(f) for f in audio_files if os.path.exists(f))
    print(f"  - Total audio files: {len(audio_files)}")
    print(f"  - Total audio size: {total_audio_size / (1024*1024):.1f} MB")
    
    # Generate cleanup recommendations
    print("\n💡 Cleanup Recommendations:")
    print("  1. Archive/remove redundant documentation files")
    print("  2. Clean up temporary directories and build artifacts")
    print("  3. Consolidate duplicate server and requirements files")
    print("  4. Consider moving large audio files to external storage")
    print("  5. Optimize remaining assets and dependencies")
    
    return {
        'doc_files': doc_files,
        'temp_files': temp_files,
        'audio_size_mb': total_audio_size / (1024*1024)
    }

if __name__ == "__main__":
    results = analyze_project()
