#!/usr/bin/env python3
"""
BaddBeatz Project Debug Tests
Comprehensive testing after cleanup
"""

import os
import json
import subprocess
import sys
from pathlib import Path

class ProjectDebugger:
    def __init__(self):
        self.test_results = {
            'file_structure': {},
            'dependencies': {},
            'functionality': {},
            'errors': [],
            'warnings': []
        }
    
    def test_file_structure(self):
        """Test essential file structure"""
        print("🏗️ Testing file structure...")
        
        essential_files = [
            'index.html',
            'server_improved.py',
            'requirements.txt',
            'package.json',
            'wrangler.toml',
            'README.md'
        ]
        
        essential_dirs = [
            'assets/',
            'workers-site/',
            'tests/',
            'scripts/'
        ]
        
        for file in essential_files:
            exists = os.path.exists(file)
            self.test_results['file_structure'][file] = exists
            status = "✅" if exists else "❌"
            print(f"  {status} {file}")
            if not exists:
                self.test_results['errors'].append(f"Missing essential file: {file}")
        
        for dir_path in essential_dirs:
            exists = os.path.exists(dir_path)
            self.test_results['file_structure'][dir_path] = exists
            status = "✅" if exists else "❌"
            print(f"  {status} {dir_path}")
            if not exists:
                self.test_results['errors'].append(f"Missing essential directory: {dir_path}")
    
    def test_python_dependencies(self):
        """Test Python dependencies"""
        print("🐍 Testing Python dependencies...")
        
        try:
            # Test requirements.txt syntax
            with open('requirements.txt', 'r') as f:
                lines = f.readlines()
            
            print(f"  ✅ requirements.txt readable ({len(lines)} lines)")
            self.test_results['dependencies']['requirements_readable'] = True
            
            # Test if we can import key modules
            key_modules = ['flask', 'requests', 'python-dotenv']
            for module in key_modules:
                try:
                    if module == 'python-dotenv':
                        import dotenv
                    else:
                        __import__(module)
                    print(f"  ✅ {module} importable")
                    self.test_results['dependencies'][f'{module}_available'] = True
                except ImportError:
                    print(f"  ⚠️ {module} not available (may need installation)")
                    self.test_results['warnings'].append(f"{module} not installed")
                    self.test_results['dependencies'][f'{module}_available'] = False
        
        except Exception as e:
            print(f"  ❌ Error testing Python dependencies: {str(e)}")
            self.test_results['errors'].append(f"Python dependencies error: {str(e)}")
    
    def test_node_dependencies(self):
        """Test Node.js dependencies"""
        print("📦 Testing Node.js dependencies...")
        
        try:
            with open('package.json', 'r') as f:
                package_data = json.load(f)
            
            print(f"  ✅ package.json readable")
            print(f"  📊 Dependencies: {len(package_data.get('dependencies', {}))}")
            print(f"  📊 DevDependencies: {len(package_data.get('devDependencies', {}))}")
            
            self.test_results['dependencies']['package_json_valid'] = True
            
            # Check if node_modules exists
            if os.path.exists('node_modules'):
                print(f"  ✅ node_modules directory exists")
                self.test_results['dependencies']['node_modules_exists'] = True
            else:
                print(f"  ⚠️ node_modules directory missing (run npm install)")
                self.test_results['warnings'].append("node_modules missing")
                self.test_results['dependencies']['node_modules_exists'] = False
        
        except Exception as e:
            print(f"  ❌ Error testing Node.js dependencies: {str(e)}")
            self.test_results['errors'].append(f"Node.js dependencies error: {str(e)}")
    
    def test_html_files(self):
        """Test HTML files for basic validity"""
        print("🌐 Testing HTML files...")
        
        html_files = [f for f in os.listdir('.') if f.endswith('.html')]
        
        for html_file in html_files:
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Basic HTML structure checks
                has_doctype = '<!DOCTYPE' in content
                has_html_tag = '<html' in content
                has_head = '<head>' in content or '<head ' in content
                has_body = '<body>' in content or '<body ' in content
                
                all_good = has_doctype and has_html_tag and has_head and has_body
                status = "✅" if all_good else "⚠️"
                print(f"  {status} {html_file}")
                
                self.test_results['functionality'][f'{html_file}_valid'] = all_good
                
                if not all_good:
                    issues = []
                    if not has_doctype: issues.append("missing DOCTYPE")
                    if not has_html_tag: issues.append("missing <html>")
                    if not has_head: issues.append("missing <head>")
                    if not has_body: issues.append("missing <body>")
                    self.test_results['warnings'].append(f"{html_file}: {', '.join(issues)}")
            
            except Exception as e:
                print(f"  ❌ Error reading {html_file}: {str(e)}")
                self.test_results['errors'].append(f"HTML file error {html_file}: {str(e)}")
    
    def test_assets(self):
        """Test assets structure"""
        print("🎨 Testing assets...")
        
        asset_dirs = ['assets/css', 'assets/js', 'assets/images', 'assets/audio']
        
        for asset_dir in asset_dirs:
            if os.path.exists(asset_dir):
                files = os.listdir(asset_dir)
                print(f"  ✅ {asset_dir} ({len(files)} files)")
                self.test_results['functionality'][f'{asset_dir}_exists'] = True
            else:
                print(f"  ⚠️ {asset_dir} missing")
                self.test_results['warnings'].append(f"Missing {asset_dir}")
                self.test_results['functionality'][f'{asset_dir}_exists'] = False
        
        # Check for large files
        if os.path.exists('assets/audio'):
            audio_files = [f for f in os.listdir('assets/audio') if f.endswith('.mp3')]
            total_size = 0
            for audio_file in audio_files:
                file_path = os.path.join('assets/audio', audio_file)
                if os.path.exists(file_path):
                    total_size += os.path.getsize(file_path)
            
            total_mb = total_size / (1024 * 1024)
            print(f"  📊 Audio files: {len(audio_files)} files, {total_mb:.1f} MB")
            
            if total_mb > 100:
                self.test_results['warnings'].append(f"Large audio files: {total_mb:.1f} MB")
    
    def test_configuration_files(self):
        """Test configuration files"""
        print("⚙️ Testing configuration files...")
        
        config_files = {
            'wrangler.toml': 'Cloudflare Workers config',
            '.env.example': 'Environment template',
            '.gitignore': 'Git ignore rules'
        }
        
        for config_file, description in config_files.items():
            if os.path.exists(config_file):
                try:
                    with open(config_file, 'r') as f:
                        content = f.read()
                    print(f"  ✅ {config_file} ({description})")
                    self.test_results['functionality'][f'{config_file}_valid'] = True
                except Exception as e:
                    print(f"  ❌ Error reading {config_file}: {str(e)}")
                    self.test_results['errors'].append(f"Config file error {config_file}: {str(e)}")
            else:
                print(f"  ⚠️ {config_file} missing ({description})")
                self.test_results['warnings'].append(f"Missing {config_file}")
    
    def generate_debug_report(self):
        """Generate comprehensive debug report"""
        print("\n📊 Debug Report Summary")
        print("=" * 50)
        
        total_tests = sum(len(category) for category in self.test_results.values() if isinstance(category, dict))
        errors = len(self.test_results['errors'])
        warnings = len(self.test_results['warnings'])
        
        print(f"Total tests run: {total_tests}")
        print(f"Errors: {errors}")
        print(f"Warnings: {warnings}")
        
        if errors == 0:
            print("🎉 No critical errors found!")
        else:
            print("\n❌ Critical Errors:")
            for error in self.test_results['errors']:
                print(f"  - {error}")
        
        if warnings > 0:
            print("\n⚠️ Warnings:")
            for warning in self.test_results['warnings']:
                print(f"  - {warning}")
        
        # Save detailed report
        with open('DEBUG_REPORT.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\n✅ Debug report saved to DEBUG_REPORT.json")
        
        # Overall health score
        health_score = max(0, 100 - (errors * 10) - (warnings * 2))
        print(f"🏥 Project Health Score: {health_score}/100")
        
        return health_score
    
    def run_debug_tests(self):
        """Run all debug tests"""
        print("🔍 Starting BaddBeatz Project Debug Tests")
        print("=" * 50)
        
        self.test_file_structure()
        self.test_python_dependencies()
        self.test_node_dependencies()
        self.test_html_files()
        self.test_assets()
        self.test_configuration_files()
        
        return self.generate_debug_report()

if __name__ == "__main__":
    debugger = ProjectDebugger()
    health_score = debugger.run_debug_tests()
    
    if health_score >= 90:
        print("\n🎉 Excellent! Your project is in great shape!")
    elif health_score >= 70:
        print("\n👍 Good! Minor issues to address.")
    elif health_score >= 50:
        print("\n⚠️ Fair. Several issues need attention.")
    else:
        print("\n🚨 Poor. Critical issues require immediate attention.")
