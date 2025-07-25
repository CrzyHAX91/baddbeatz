# LiteLLM Context Window Error - Quick Fix Reference

## 🚨 Immediate Solution

Your error: `ContextWindowExceededError: This model's maximum context length is 1047576 tokens. However, your messages resulted in 1129124 tokens.`

### Quick Fix Commands

```bash
# 1. Run the setup script
python setup-litellm-fix.py

# 2. Copy and configure environment
cp .env.template .env
# Edit .env with your API keys

# 3. Start LiteLLM proxy
./start-litellm.sh

# 4. Test the setup
python test-litellm-setup.py
```

## 🔧 Manual Configuration

If you need to configure manually:

### 1. Install Dependencies
```bash
pip install litellm tiktoken pyyaml openai python-dotenv
```

### 2. Key Configuration Changes

Add to your LiteLLM config:

```yaml
router_settings:
  context_window_fallbacks:
    - gpt-4o-mini:
        - gpt-4-turbo
        - claude-3-sonnet
        - qwen-72b
```

### 3. Environment Variables
```bash
export OPENAI_API_KEY="your_key_here"
export ANTHROPIC_API_KEY="your_key_here"
export LITELLM_MASTER_KEY="your_secure_key"
```

## 🐍 Python Code Fix

```python
from litellm_context_manager import ContextWindowManager
import openai

# Initialize context manager
manager = ContextWindowManager()

# Configure client for LiteLLM proxy
client = openai.OpenAI(
    base_url="http://localhost:4000",
    api_key="your-master-key"
)

def safe_chat(messages, model="gpt-4o-mini"):
    try:
        # Optimize context before sending
        optimized = manager.optimize_conversation(messages, model)
        
        response = client.chat.completions.create(
            model=model,
            messages=optimized['messages']
        )
        return response
        
    except Exception as e:
        if "context_window_exceeded" in str(e).lower():
            # Handle fallback
            handled = manager.handle_context_exceeded(messages, model)
            response = client.chat.completions.create(
                model=handled['model'],
                messages=handled['messages']
            )
            return response
        raise e
```

## 📊 Token Management

```python
# Check token count before sending
token_count = manager.count_tokens(your_text, "gpt-4o-mini")
print(f"Tokens: {token_count}/1047576")

# Truncate if needed
if token_count > 1000000:  # Leave buffer
    truncated = manager.truncate_context(messages, "gpt-4o-mini")
```

## 🔄 Fallback Chain

Your configured fallback order:
1. **gpt-4o-mini** (1M tokens) → 
2. **gpt-4-turbo** (4M tokens) → 
3. **claude-3-sonnet** (200K tokens) → 
4. **qwen-72b** (32K tokens)

## ⚡ Emergency Commands

```bash
# Check if proxy is running
curl http://localhost:4000/health

# View available models
curl http://localhost:4000/models

# Stop and restart proxy
pkill -f litellm
./start-litellm.sh

# Check logs
tail -f litellm.log
```

## 🛠️ Troubleshooting

| Error | Solution |
|-------|----------|
| `No fallback model group found` | Add `context_window_fallbacks` to config |
| `API key not found` | Set environment variables in `.env` |
| `Connection refused` | Start LiteLLM proxy with `./start-litellm.sh` |
| `Model not available` | Check API quotas and model access |

## 📁 Files Created

- `litellm-config.yaml` - Main configuration
- `litellm-context-manager.py` - Context management utility
- `setup-litellm-fix.py` - Automated setup script
- `start-litellm.sh/.bat` - Proxy startup scripts
- `test-litellm-setup.py` - Test and validation
- `.env.template` - Environment variables template

## 🎯 Success Indicators

✅ Proxy starts without errors  
✅ Health check returns 200  
✅ Models endpoint shows available models  
✅ Test API call succeeds  
✅ Context truncation works  
✅ Fallback models activate when needed  

## 📞 Need Help?

1. Read the full guide: `LITELLM_CONTEXT_WINDOW_FIX_GUIDE.md`
2. Run diagnostics: `python test-litellm-setup.py`
3. Check proxy logs for detailed error messages
4. Verify API keys and quotas

---

**Remember**: The key fix is adding proper `context_window_fallbacks` configuration to handle when gpt-4o-mini exceeds its 1,047,576 token limit.
