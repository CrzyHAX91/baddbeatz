#!/usr/bin/env python3
"""
LiteLLM Context Window Fix Setup Script
Automates the installation and configuration of LiteLLM with proper fallback handling
"""

import os
import sys
import subprocess
import json
import yaml
from pathlib import Path

def run_command(command, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, check=check)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error: {e.stderr}")
        if check:
            sys.exit(1)
        return None

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_dependencies():
    """Install required Python packages"""
    print("\n📦 Installing dependencies...")
    
    dependencies = [
        "litellm>=1.0.0",
        "tiktoken>=0.5.0",
        "pyyaml>=6.0",
        "openai>=1.0.0",
        "python-dotenv>=1.0.0"
    ]
    
    for dep in dependencies:
        print(f"Installing {dep}...")
        run_command(f"pip install {dep}")
    
    print("✓ All dependencies installed successfully")

def create_env_template():
    """Create environment template file"""
    print("\n🔧 Creating environment template...")
    
    env_content = """# LiteLLM Environment Configuration
# Copy this file to .env and fill in your actual API keys

# OpenAI API Key (required for gpt-4o-mini, gpt-4-turbo)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (required for Claude models)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google API Key (optional, for Gemini models)
GOOGLE_API_KEY=your_google_api_key_here

# Cohere API Key (optional, for Cohere models)
COHERE_API_KEY=your_cohere_api_key_here

# LiteLLM Master Key (generate a secure key)
LITELLM_MASTER_KEY=your_secure_master_key_here

# Database URL (optional, for logging and analytics)
DATABASE_URL=your_database_url_here

# LiteLLM Settings
LITELLM_LOG=INFO
LITELLM_PORT=4000
"""
    
    with open('.env.template', 'w') as f:
        f.write(env_content)
    
    print("✓ Created .env.template file")
    print("  Please copy this to .env and fill in your API keys")

def validate_config_files():
    """Validate that configuration files exist and are valid"""
    print("\n✅ Validating configuration files...")
    
    # Check if config files exist
    config_files = [
        'litellm-config.yaml',
        'litellm-context-manager.py',
        'LITELLM_CONTEXT_WINDOW_FIX_GUIDE.md'
    ]
    
    for file in config_files:
        if not os.path.exists(file):
            print(f"❌ Missing file: {file}")
            return False
        print(f"✓ Found {file}")
    
    # Validate YAML configuration
    try:
        with open('litellm-config.yaml', 'r') as f:
            config = yaml.safe_load(f)
        
        # Check required sections
        required_sections = ['model_list', 'router_settings', 'general_settings']
        for section in required_sections:
            if section not in config:
                print(f"❌ Missing section in config: {section}")
                return False
        
        print("✓ Configuration file is valid")
        return True
        
    except Exception as e:
        print(f"❌ Error validating configuration: {e}")
        return False

def test_context_manager():
    """Test the context manager functionality"""
    print("\n🧪 Testing context manager...")
    
    try:
        # Import and test the context manager
        sys.path.append('.')
        from litellm_context_manager import ContextWindowManager
        
        manager = ContextWindowManager()
        
        # Test token counting
        test_text = "This is a test message for token counting."
        token_count = manager.count_tokens(test_text, "gpt-4o-mini")
        print(f"✓ Token counting works: {token_count} tokens for test message")
        
        # Test context optimization
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello!"},
            {"role": "assistant", "content": "Hi there!"},
            {"role": "user", "content": "How are you?"}
        ]
        
        result = manager.optimize_conversation(test_messages, "gpt-4o-mini")
        print(f"✓ Context optimization works: {len(result['messages'])} messages, {result['token_count']} tokens")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing context manager: {e}")
        return False

def create_startup_script():
    """Create a startup script for LiteLLM proxy"""
    print("\n📝 Creating startup script...")
    
    startup_script = """#!/bin/bash
# LiteLLM Proxy Startup Script

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if configuration file exists
if [ ! -f "litellm-config.yaml" ]; then
    echo "Error: litellm-config.yaml not found"
    exit 1
fi

# Start LiteLLM proxy
echo "Starting LiteLLM proxy..."
echo "Configuration: litellm-config.yaml"
echo "Port: ${LITELLM_PORT:-4000}"
echo "Log Level: ${LITELLM_LOG:-INFO}"

litellm --config litellm-config.yaml \\
        --port ${LITELLM_PORT:-4000} \\
        --num_workers 4 \\
        --host 0.0.0.0 \\
        --debug
"""
    
    with open('start-litellm.sh', 'w') as f:
        f.write(startup_script)
    
    # Make script executable
    os.chmod('start-litellm.sh', 0o755)
    
    # Create Windows batch file
    windows_script = """@echo off
REM LiteLLM Proxy Startup Script for Windows

REM Load environment variables from .env file
if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" set %%a=%%b
    )
)

REM Check if configuration file exists
if not exist "litellm-config.yaml" (
    echo Error: litellm-config.yaml not found
    exit /b 1
)

REM Start LiteLLM proxy
echo Starting LiteLLM proxy...
echo Configuration: litellm-config.yaml
echo Port: %LITELLM_PORT%
echo Log Level: %LITELLM_LOG%

litellm --config litellm-config.yaml --port %LITELLM_PORT% --num_workers 4 --host 0.0.0.0 --debug
"""
    
    with open('start-litellm.bat', 'w') as f:
        f.write(windows_script)
    
    print("✓ Created startup scripts:")
    print("  - start-litellm.sh (Linux/Mac)")
    print("  - start-litellm.bat (Windows)")

def create_test_script():
    """Create a test script to verify the setup"""
    print("\n🔬 Creating test script...")
    
    test_script = """#!/usr/bin/env python3
\"\"\"
Test script for LiteLLM context window fix
\"\"\"

import os
import sys
import requests
import json
from litellm_context_manager import ContextWindowManager

def test_proxy_health():
    \"\"\"Test if LiteLLM proxy is running\"\"\"
    try:
        response = requests.get("http://localhost:4000/health", timeout=5)
        if response.status_code == 200:
            print("✓ LiteLLM proxy is running and healthy")
            return True
        else:
            print(f"❌ LiteLLM proxy health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to LiteLLM proxy: {e}")
        print("  Make sure to start the proxy with: ./start-litellm.sh")
        return False

def test_models():
    \"\"\"Test available models\"\"\"
    try:
        response = requests.get("http://localhost:4000/models", timeout=5)
        if response.status_code == 200:
            models = response.json()
            print(f"✓ Available models: {len(models.get('data', []))} models")
            for model in models.get('data', [])[:3]:  # Show first 3 models
                print(f"  - {model.get('id', 'unknown')}")
            return True
        else:
            print(f"❌ Failed to get models: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error getting models: {e}")
        return False

def test_context_manager():
    \"\"\"Test context manager functionality\"\"\"
    try:
        manager = ContextWindowManager()
        
        # Test token counting
        test_text = "This is a test message for the context window manager."
        tokens = manager.count_tokens(test_text, "gpt-4o-mini")
        print(f"✓ Token counting: '{test_text[:30]}...' = {tokens} tokens")
        
        # Test context optimization
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, how are you today?"},
            {"role": "assistant", "content": "I'm doing well, thank you for asking!"},
            {"role": "user", "content": "Can you help me with a programming question?"}
        ]
        
        result = manager.optimize_conversation(messages, "gpt-4o-mini")
        print(f"✓ Context optimization: {len(result['messages'])} messages, {result['token_count']} tokens")
        
        # Test fallback handling
        fallback = manager.get_fallback_model("gpt-4o-mini")
        if fallback:
            print(f"✓ Fallback model for gpt-4o-mini: {fallback}")
        else:
            print("⚠ No fallback model configured for gpt-4o-mini")
        
        return True
        
    except Exception as e:
        print(f"❌ Context manager test failed: {e}")
        return False

def test_api_call():
    \"\"\"Test actual API call through proxy\"\"\"
    try:
        import openai
        
        client = openai.OpenAI(
            base_url="http://localhost:4000",
            api_key=os.getenv("LITELLM_MASTER_KEY", "test-key")
        )
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": "Say 'Hello, LiteLLM is working!'"}
            ],
            max_tokens=50
        )
        
        message = response.choices[0].message.content
        print(f"✓ API call successful: {message}")
        return True
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        print("  Make sure your API keys are set in .env file")
        return False

def main():
    print("🧪 Testing LiteLLM Context Window Fix Setup\\n")
    
    tests = [
        ("Context Manager", test_context_manager),
        ("Proxy Health", test_proxy_health),
        ("Available Models", test_models),
        ("API Call", test_api_call)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\\n--- Testing {test_name} ---")
        result = test_func()
        results.append((test_name, result))
    
    print("\\n" + "="*50)
    print("TEST RESULTS SUMMARY")
    print("="*50)
    
    passed = 0
    for test_name, result in results:
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} {status}")
        if result:
            passed += 1
    
    print(f"\\nPassed: {passed}/{len(tests)} tests")
    
    if passed == len(tests):
        print("\\n🎉 All tests passed! Your LiteLLM setup is working correctly.")
    else:
        print("\\n⚠ Some tests failed. Please check the configuration and try again.")
        print("\\nTroubleshooting tips:")
        print("1. Make sure LiteLLM proxy is running: ./start-litellm.sh")
        print("2. Check your .env file has correct API keys")
        print("3. Verify litellm-config.yaml is valid")

if __name__ == "__main__":
    main()
"""
    
    with open('test-litellm-setup.py', 'w') as f:
        f.write(test_script)
    
    os.chmod('test-litellm-setup.py', 0o755)
    print("✓ Created test-litellm-setup.py")

def main():
    """Main setup function"""
    print("🚀 LiteLLM Context Window Fix Setup")
    print("="*50)
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    install_dependencies()
    
    # Create environment template
    create_env_template()
    
    # Validate configuration files
    if not validate_config_files():
        print("\n❌ Configuration validation failed")
        sys.exit(1)
    
    # Test context manager
    if not test_context_manager():
        print("\n❌ Context manager test failed")
        sys.exit(1)
    
    # Create startup scripts
    create_startup_script()
    
    # Create test script
    create_test_script()
    
    print("\n" + "="*50)
    print("✅ SETUP COMPLETE!")
    print("="*50)
    
    print("\nNext steps:")
    print("1. Copy .env.template to .env and fill in your API keys")
    print("2. Start LiteLLM proxy: ./start-litellm.sh (or start-litellm.bat on Windows)")
    print("3. Test the setup: python test-litellm-setup.py")
    print("4. Read the guide: LITELLM_CONTEXT_WINDOW_FIX_GUIDE.md")
    
    print("\nFiles created:")
    print("- litellm-config.yaml (LiteLLM configuration)")
    print("- litellm-context-manager.py (Context management utility)")
    print("- .env.template (Environment variables template)")
    print("- start-litellm.sh/.bat (Startup scripts)")
    print("- test-litellm-setup.py (Test script)")
    print("- LITELLM_CONTEXT_WINDOW_FIX_GUIDE.md (Complete guide)")
    
    print("\n🎯 Your LiteLLM context window fix is ready to use!")

if __name__ == "__main__":
    main()
