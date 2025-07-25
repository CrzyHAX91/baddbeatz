# LiteLLM Context Window Exceeded Error - Complete Fix Guide

## Problem Analysis

The error you encountered indicates:
- **Model**: gpt-4o-mini has a maximum context length of 1,047,576 tokens
- **Current Usage**: Your messages resulted in 1,129,124 tokens (exceeding the limit)
- **Fallback Issue**: No proper fallback model group configured for gpt-4o-mini
- **Root Cause**: Missing `context_window_fallback` configuration

## Solution Overview

This guide provides a comprehensive solution to:
1. Configure proper context window fallbacks
2. Implement automatic context truncation
3. Set up model fallback chains
4. Monitor and optimize token usage

## Files Created

### 1. `litellm-config.yaml`
Complete LiteLLM configuration with:
- Model definitions with context limits
- Fallback chains for context window exceeded scenarios
- Router settings for automatic fallbacks
- Cost tracking and monitoring

### 2. `litellm-context-manager.py`
Python utility for:
- Token counting and context management
- Automatic message truncation
- Conversation optimization
- Fallback model selection

## Implementation Steps

### Step 1: Install Required Dependencies

```bash
# Install LiteLLM and dependencies
pip install litellm tiktoken pyyaml

# Or add to requirements.txt
echo "litellm>=1.0.0" >> requirements.txt
echo "tiktoken>=0.5.0" >> requirements.txt
echo "pyyaml>=6.0" >> requirements.txt
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create a `.env` file with your API keys:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (for Claude fallback)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Other API keys as needed
GOOGLE_API_KEY=your_google_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
```

### Step 3: Start LiteLLM Proxy with Configuration

```bash
# Start LiteLLM proxy with the configuration
litellm --config litellm-config.yaml --port 4000

# Or with specific settings
litellm --config litellm-config.yaml --port 4000 --num_workers 4 --debug
```

### Step 4: Update Your Application Code

#### Python Example:

```python
import openai
from litellm_context_manager import ContextWindowManager

# Initialize context manager
context_manager = ContextWindowManager()

# Configure OpenAI client to use LiteLLM proxy
client = openai.OpenAI(
    base_url="http://localhost:4000",  # LiteLLM proxy URL
    api_key="your-master-key"  # From litellm-config.yaml
)

def chat_with_fallback(messages, model="gpt-4o-mini"):
    try:
        # Optimize conversation before sending
        optimized = context_manager.optimize_conversation(messages, model)
        
        response = client.chat.completions.create(
            model=model,
            messages=optimized['messages'],
            max_tokens=4000
        )
        return response
        
    except Exception as e:
        if "context_window_exceeded" in str(e).lower():
            # Handle context window exceeded
            handled = context_manager.handle_context_exceeded(messages, model)
            
            response = client.chat.completions.create(
                model=handled['model'],
                messages=handled['messages'],
                max_tokens=4000
            )
            return response
        else:
            raise e
```

#### JavaScript/Node.js Example:

```javascript
const OpenAI = require('openai');

const client = new OpenAI({
    baseURL: 'http://localhost:4000',
    apiKey: 'your-master-key'
});

async function chatWithFallback(messages, model = 'gpt-4o-mini') {
    try {
        const response = await client.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: 4000
        });
        return response;
    } catch (error) {
        if (error.message.includes('context_window_exceeded')) {
            // LiteLLM will automatically handle fallback based on config
            console.log('Context window exceeded, fallback triggered');
            throw error; // Let LiteLLM handle the fallback
        }
        throw error;
    }
}
```

## Configuration Options

### Context Window Fallback Strategies

1. **Automatic Truncation**: Remove oldest messages
2. **Summarization**: Summarize old conversation parts
3. **Model Fallback**: Switch to models with larger context windows
4. **Hybrid Approach**: Combine truncation with model fallback

### Model Fallback Chain

```yaml
context_window_fallbacks:
  - gpt-4o-mini:
      - gpt-4-turbo        # 4M tokens
      - claude-3-sonnet    # 200K tokens
      - qwen-72b          # 32K tokens
      - deepseek-chat     # 32K tokens
```

### Cost Optimization

The configuration includes cost tracking to help you:
- Monitor token usage per model
- Optimize for cost-effective fallbacks
- Set budget limits

## Monitoring and Debugging

### Enable Verbose Logging

```yaml
general_settings:
  set_verbose: true
  json_logs: true
```

### Monitor Context Usage

```python
# Use the context manager to monitor usage
manager = ContextWindowManager()

# Check token count before sending
token_count = manager.count_tokens(conversation_text, "gpt-4o-mini")
print(f"Token count: {token_count}")

# Get model limits
model_config = manager.models.get("gpt-4o-mini")
print(f"Context limit: {model_config.context_window}")
```

### Health Checks

```bash
# Check LiteLLM proxy health
curl http://localhost:4000/health

# Check model availability
curl http://localhost:4000/models
```

## Troubleshooting

### Common Issues and Solutions

1. **"No fallback model group found"**
   - Ensure `context_window_fallbacks` is properly configured
   - Check that fallback models are defined in `model_list`

2. **"API key not found"**
   - Verify environment variables are set
   - Check API key permissions

3. **"Model not available"**
   - Ensure all models in fallback chain are accessible
   - Check API quotas and limits

4. **High latency with fallbacks**
   - Optimize context truncation settings
   - Use faster fallback models
   - Implement caching

### Debug Commands

```bash
# Test configuration
python litellm-context-manager.py

# Check token counting
python -c "
from litellm_context_manager import ContextWindowManager
manager = ContextWindowManager()
print(manager.count_tokens('Your test message here', 'gpt-4o-mini'))
"

# Validate YAML configuration
python -c "
import yaml
with open('litellm-config.yaml', 'r') as f:
    config = yaml.safe_load(f)
    print('Configuration valid!')
"
```

## Performance Optimization

### Context Management Best Practices

1. **Proactive Truncation**: Don't wait for errors
2. **Smart Summarization**: Keep important context
3. **Model Selection**: Choose appropriate models for tasks
4. **Caching**: Cache responses to reduce API calls

### Example Optimization

```python
def optimize_for_performance(messages, task_type):
    manager = ContextWindowManager()
    
    # Choose model based on task
    if task_type == "simple_qa":
        model = "gpt-4o-mini"
    elif task_type == "complex_reasoning":
        model = "gpt-4-turbo"
    else:
        model = "claude-3-sonnet"
    
    # Optimize conversation
    optimized = manager.optimize_conversation(messages, model)
    
    return optimized['messages'], model
```

## Production Deployment

### Docker Configuration

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY litellm-config.yaml .
COPY litellm-context-manager.py .

EXPOSE 4000

CMD ["litellm", "--config", "litellm-config.yaml", "--port", "4000", "--host", "0.0.0.0"]
```

### Environment-Specific Configs

Create separate configs for different environments:
- `litellm-config-dev.yaml`
- `litellm-config-staging.yaml`
- `litellm-config-prod.yaml`

## Security Considerations

1. **API Key Management**: Use environment variables
2. **Master Key**: Generate strong master key for proxy
3. **Network Security**: Restrict proxy access
4. **Logging**: Avoid logging sensitive data

## Next Steps

1. **Test the Configuration**: Run the provided scripts
2. **Monitor Usage**: Set up logging and monitoring
3. **Optimize Costs**: Adjust fallback chains based on usage
4. **Scale**: Deploy in production with proper infrastructure

## Support and Resources

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Context Window Fallbacks](https://docs.litellm.ai/docs/routing#fallbacks)
- [Token Counting Guide](https://platform.openai.com/docs/guides/text-generation/managing-tokens)

---

This comprehensive solution should resolve your context window exceeded errors and provide a robust foundation for managing AI model interactions at scale.
