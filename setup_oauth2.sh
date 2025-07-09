#!/bin/bash

# OAuth2 Setup Script for BaddBeatz
# This script helps set up the OAuth2 authentication system

echo "🎵 BaddBeatz OAuth2 Setup Script"
echo "================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists"
fi

# Check if required dependencies are installed
echo ""
echo "🔍 Checking dependencies..."

python3 -c "import psycopg2" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ psycopg2-binary is installed"
else
    echo "❌ psycopg2-binary not found. Installing..."
    pip install psycopg2-binary==2.9.9
fi

python3 -c "import authlib" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ authlib is installed"
else
    echo "❌ authlib not found. Installing..."
    pip install authlib requests-oauthlib
fi

# Initialize database
echo ""
echo "🗄️  Setting up database..."
if [ ! -d "data" ]; then
    mkdir -p data
fi

python3 scripts/init_db.py
echo "✅ Database initialized"

# Generate a secure Flask secret key
echo ""
echo "🔐 Generating secure Flask secret key..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
sed -i "s/your_super_secret_key_change_this_in_production/$SECRET_KEY/" .env
echo "✅ Flask secret key generated"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Edit the .env file with your OAuth2 credentials:"
echo "   - Google: https://console.cloud.google.com/"
echo "   - GitHub: https://github.com/settings/developers"
echo "   - Discord: https://discord.com/developers/applications"
echo ""
echo "2. See OAUTH2_SETUP.md for detailed setup instructions"
echo ""
echo "3. Start the server:"
echo "   python3 server.py"
echo ""
echo "4. Visit http://localhost:8000/login.html to test OAuth2 login"
echo ""
echo "🚀 Setup complete! Happy coding!"
