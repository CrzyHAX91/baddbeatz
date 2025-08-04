# 🎵 BaddBeatz - DJ Portfolio Website

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
   pip install -r requirements.txt      # Core dependencies
   pip install -r requirements-dev.txt  # Dev & test tools
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
├── requirements.txt     # Core Python dependencies
└── requirements-dev.txt # Development & test dependencies
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

Install dev dependencies and run the test suite:

```bash
pip install -r requirements-dev.txt
pytest tests/
pnpm test
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
