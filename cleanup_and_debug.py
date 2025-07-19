#!/usr/bin/env python3
"""
BaddBeatz Project Cleanup and Debug Script
Comprehensive cleanup and optimization
"""

import os
import shutil
import glob
from pathlib import Path
import json

class ProjectCleaner:
    def __init__(self):
        self.cleanup_report = {
            'removed_files': [],
            'consolidated_files': [],
            'errors': [],
            'size_saved': 0
        }
    
    def create_archive_folder(self):
        """Create archive folder for old documentation"""
        archive_path = Path("archive/old_docs")
        archive_path.mkdir(parents=True, exist_ok=True)
        return archive_path
    
    def cleanup_documentation(self):
        """Remove redundant documentation files"""
        print("🗂️ Cleaning up documentation files...")
        
        # Files to remove (redundant documentation)
        redundant_docs = [
            "AGENTS.md",
            "AUTOMATED_AGENT_README.md", 
            "CODEQL_SECURITY_FIX_SUMMARY.md",
            "COMPREHENSIVE_SECURITY_REVIEW.md",
            "COMPREHENSIVE_TESTING_COMPLETE.md",
            "COMPREHENSIVE_TESTING_RESULTS.md",
            "CONTACT_AND_TRACKS_UPDATE_SUMMARY.md",
            "DEPLOYMENT_BUILD_FIX.md",
            "DEPLOYMENT_FINAL_FIX.md",
            "DEPLOYMENT_FIX_SUMMARY.md",
            "DEPLOYMENT_GITHUB.md",
            "DEPLOYMENT.md",
            "ENV_API_KEYS_GUIDE.md",
            "ENV_SECURITY_SUMMARY.md",
            "ENVIRONMENT_SETUP.md",
            "FINAL_DEPLOYMENT_STATUS.md",
            "FRONTEND_FIXES_SUMMARY.md",
            "GITHUB_ACTIONS_FIX_REPORT.md",
            "GITHUB_ACTIONS_VERIFICATION.md",
            "IMPLEMENTATION_GUIDE.md",
            "INTRO_VIDEO_IMPLEMENTATION.md",
            "NEW_MUSIC_TRACKS_ADDED.md",
            "OAUTH2_CONFIGURATION_UPDATE.md",
            "PRODUCTION_DEPLOYMENT_GUIDE.md",
            "PRODUCTION_TEST_RESULTS.md",
            "SECURITY_GUIDE.md",
            "SECURITY_IMPLEMENTATION_COMPLETE.md",
            "SECURITY_IMPLEMENTATION_GUIDE.md",
            "TESTING_REPORT.md",
            "TROUBLESHOOTING.md",
            "WRANGLER_OPTIMIZATION_SUMMARY.md",
            "YOUTUBE_API_KEY_UPDATE.md",
            "YOUTUBE_CHANNEL_INTEGRATION_COMPLETE.md"
        ]
        
        archive_path = self.create_archive_folder()
        
        for doc in redundant_docs:
            if os.path.exists(doc):
                try:
                    # Move to archive instead of deleting
                    shutil.move(doc, archive_path / doc)
                    self.cleanup_report['removed_files'].append(doc)
                    print(f"  ✅ Archived: {doc}")
                except Exception as e:
                    self.cleanup_report['errors'].append(f"Error archiving {doc}: {str(e)}")
                    print(f"  ❌ Error archiving {doc}: {str(e)}")
    
    def cleanup_temp_files(self):
        """Remove temporary files and directories"""
        print("🗑️ Cleaning up temporary files...")
        
        temp_items = [
            "temp_venv/",
            "__pycache__/",
            ".coverage",
            "coverage.xml",
            "*.pyc",
            "*.pyo",
            "*.log"
        ]
        
        for item in temp_items:
            if item.endswith('/'):
                # Directory
                if os.path.exists(item):
                    try:
                        shutil.rmtree(item)
                        self.cleanup_report['removed_files'].append(item)
                        print(f"  ✅ Removed directory: {item}")
                    except Exception as e:
                        self.cleanup_report['errors'].append(f"Error removing {item}: {str(e)}")
            else:
                # File pattern
                files = glob.glob(item, recursive=True)
                for file in files:
                    try:
                        os.remove(file)
                        self.cleanup_report['removed_files'].append(file)
                        print(f"  ✅ Removed file: {file}")
                    except Exception as e:
                        self.cleanup_report['errors'].append(f"Error removing {file}: {str(e)}")
    
    def consolidate_server_files(self):
        """Consolidate server implementations"""
        print("🔧 Consolidating server files...")
        
        if os.path.exists("server.py") and os.path.exists("server_improved.py"):
            # Keep the improved version, archive the old one
            archive_path = self.create_archive_folder()
            try:
                shutil.move("server.py", archive_path / "server_old.py")
                self.cleanup_report['consolidated_files'].append("server.py -> server_improved.py")
                print("  ✅ Archived old server.py, keeping server_improved.py")
            except Exception as e:
                self.cleanup_report['errors'].append(f"Error consolidating server files: {str(e)}")
    
    def consolidate_requirements(self):
        """Consolidate requirements files"""
        print("📦 Consolidating requirements files...")
        
        # Keep main requirements.txt and requirements-dev.txt
        # Archive others
        req_files = glob.glob("requirements*.txt")
        keep_files = ["requirements.txt", "requirements-dev.txt"]
        
        archive_path = self.create_archive_folder()
        
        for req_file in req_files:
            if req_file not in keep_files:
                try:
                    shutil.move(req_file, archive_path / req_file)
                    self.cleanup_report['consolidated_files'].append(f"Archived: {req_file}")
                    print(f"  ✅ Archived: {req_file}")
                except Exception as e:
                    self.cleanup_report['errors'].append(f"Error archiving {req_file}: {str(e)}")
    
    def optimize_assets(self):
        """Optimize asset organization"""
        print("🎨 Optimizing assets...")
        
        # Check audio file sizes
        audio_files = glob.glob("assets/audio/*.mp3", recursive=True)
        total_size = 0
        large_files = []
        
        for audio_file in audio_files:
            if os.path.exists(audio_file):
                size = os.path.getsize(audio_file)
                total_size += size
                if size > 10 * 1024 * 1024:  # Files larger than 10MB
                    large_files.append((audio_file, size))
        
        print(f"  📊 Total audio files: {len(audio_files)}")
        print(f"  📊 Total audio size: {total_size / (1024*1024):.1f} MB")
        
        if large_files:
            print(f"  ⚠️ Large audio files found ({len(large_files)} files):")
            for file, size in large_files[:5]:  # Show first 5
                print(f"    - {file}: {size / (1024*1024):.1f} MB")
    
    def create_clean_readme(self):
        """Create a clean, comprehensive README"""
        print("📝 Creating clean README...")
        
        readme_content = """# 🎵 BaddBeatz - DJ Portfolio Website

A modern, cyberpunk-themed DJ portfolio website featuring music streaming, booking management, and interactive elements.

## 🚀 Features

- **Music Streaming**: High-quality audio playback with custom player
- **Booking System**: Professional booking management
- **Gallery**: Visual showcase of DJ performances
- **Contact Integration**: Direct communication channels
- **Mobile Responsive**: Optimized for all devices
- **Cyberpunk Theme**: Modern, futuristic design

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Python Flask
- **Deployment**: Cloudflare Workers
- **Audio**: Custom HTML5 audio player
- **Styling**: Custom CSS with cyberpunk aesthetics

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/CrzyHAX91/baddbeatz.git
   cd baddbeatz
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   npm install
   ```

3. **Run locally**
   ```bash
   python server_improved.py
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
baddbeatz/
├── assets/           # Static assets (CSS, JS, images)
├── workers-site/     # Cloudflare Workers configuration
├── tests/           # Test files
├── scripts/         # Build and utility scripts
├── *.html          # Main HTML pages
├── server_improved.py # Main server file
└── requirements.txt # Python dependencies
```

## 🔧 Configuration

1. Copy `.env.example` to `.env`
2. Configure your API keys and settings
3. Update `wrangler.toml` for Cloudflare deployment

## 🚀 Deployment

The project is configured for deployment on Cloudflare Workers:

```bash
wrangler deploy
```

## 🧪 Testing

Run the test suite:

```bash
pytest tests/
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📞 Contact

For bookings and inquiries, visit the [contact page](contact.html) or reach out directly.

---

**BaddBeatz** - Where music meets technology 🎧
"""
        
        try:
            with open("README.md", "w", encoding="utf-8") as f:
                f.write(readme_content)
            print("  ✅ Created clean README.md")
        except Exception as e:
            self.cleanup_report['errors'].append(f"Error creating README: {str(e)}")
    
    def generate_report(self):
        """Generate cleanup report"""
        print("\n📊 Cleanup Report")
        print("=" * 50)
        print(f"Files archived: {len(self.cleanup_report['removed_files'])}")
        print(f"Files consolidated: {len(self.cleanup_report['consolidated_files'])}")
        print(f"Errors encountered: {len(self.cleanup_report['errors'])}")
        
        if self.cleanup_report['errors']:
            print("\n❌ Errors:")
            for error in self.cleanup_report['errors']:
                print(f"  - {error}")
        
        # Save report
        with open("CLEANUP_REPORT.json", "w") as f:
            json.dump(self.cleanup_report, f, indent=2)
        
        print("\n✅ Cleanup completed! Report saved to CLEANUP_REPORT.json")
    
    def run_cleanup(self):
        """Run the complete cleanup process"""
        print("🧹 Starting BaddBeatz Project Cleanup")
        print("=" * 50)
        
        self.cleanup_documentation()
        self.cleanup_temp_files()
        self.consolidate_server_files()
        self.consolidate_requirements()
        self.optimize_assets()
        self.create_clean_readme()
        self.generate_report()

if __name__ == "__main__":
    cleaner = ProjectCleaner()
    cleaner.run_cleanup()
