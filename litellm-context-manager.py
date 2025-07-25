#!/usr/bin/env python3
"""
LiteLLM Context Window Manager
Handles context window exceeded errors and implements fallback strategies
"""

import os
import json
import yaml
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import tiktoken

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Configuration for a model including context limits"""
    name: str
    context_window: int
    max_tokens: int
    supports_function_calling: bool = False
    supports_vision: bool = False
    cost_per_token: float = 0.0

class ContextWindowManager:
    """Manages context windows and implements fallback strategies"""
    
    def __init__(self, config_path: str = "litellm-config.yaml"):
        self.config_path = config_path
        self.models = {}
        self.fallback_chains = {}
        self.load_config()
        
    def load_config(self):
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
                
            # Load model configurations
            for model_config in config.get('model_list', []):
                model_name = model_config['model_name']
                params = model_config['litellm_params']
                info = model_config.get('model_info', {})
                
                self.models[model_name] = ModelConfig(
                    name=model_name,
                    context_window=params.get('context_window', 4096),
                    max_tokens=params.get('max_tokens', 4096),
                    supports_function_calling=info.get('supports_function_calling', False),
                    supports_vision=info.get('supports_vision', False)
                )
            
            # Load fallback chains
            router_settings = config.get('router_settings', {})
            self.fallback_chains = router_settings.get('context_window_fallbacks', {})
            
            logger.info(f"Loaded configuration for {len(self.models)} models")
            
        except FileNotFoundError:
            logger.error(f"Configuration file {self.config_path} not found")
            self._create_default_config()
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
            
    def _create_default_config(self):
        """Create default configuration if none exists"""
        default_models = {
            'gpt-4o-mini': ModelConfig('gpt-4o-mini', 1047576, 1047576, True, True),
            'gpt-4-turbo': ModelConfig('gpt-4-turbo', 4096000, 4096000, True, True),
            'claude-3-sonnet': ModelConfig('claude-3-sonnet', 200000, 200000, True, False),
        }
        
        self.models = default_models
        self.fallback_chains = {
            'gpt-4o-mini': ['gpt-4-turbo', 'claude-3-sonnet']
        }
        
    def count_tokens(self, text: str, model: str = "gpt-4o-mini") -> int:
        """Count tokens in text for a specific model"""
        try:
            # Map model names to tiktoken encodings
            encoding_map = {
                'gpt-4o-mini': 'cl100k_base',
                'gpt-4-turbo': 'cl100k_base',
                'gpt-3.5-turbo': 'cl100k_base',
                'claude-3-sonnet': 'cl100k_base',  # Approximation
            }
            
            encoding_name = encoding_map.get(model, 'cl100k_base')
            encoding = tiktoken.get_encoding(encoding_name)
            return len(encoding.encode(text))
            
        except Exception as e:
            logger.warning(f"Error counting tokens: {e}")
            # Fallback: rough estimation (4 chars per token)
            return len(text) // 4
            
    def truncate_context(self, messages: List[Dict], model: str, reserve_tokens: int = 1000) -> List[Dict]:
        """Truncate context to fit within model limits"""
        if model not in self.models:
            logger.warning(f"Unknown model {model}, using default limits")
            max_tokens = 4096
        else:
            max_tokens = self.models[model].context_window
            
        available_tokens = max_tokens - reserve_tokens
        
        # Always keep system message and last user message
        if len(messages) < 2:
            return messages
            
        system_msg = messages[0] if messages[0].get('role') == 'system' else None
        last_msg = messages[-1]
        middle_messages = messages[1:-1] if system_msg else messages[:-1]
        
        # Count tokens for essential messages
        essential_tokens = 0
        if system_msg:
            essential_tokens += self.count_tokens(str(system_msg), model)
        essential_tokens += self.count_tokens(str(last_msg), model)
        
        # Add middle messages until we hit the limit
        truncated_messages = []
        if system_msg:
            truncated_messages.append(system_msg)
            
        current_tokens = essential_tokens
        
        # Add messages from most recent backwards
        for msg in reversed(middle_messages):
            msg_tokens = self.count_tokens(str(msg), model)
            if current_tokens + msg_tokens <= available_tokens:
                truncated_messages.insert(-1 if system_msg else 0, msg)
                current_tokens += msg_tokens
            else:
                break
                
        truncated_messages.append(last_msg)
        
        logger.info(f"Truncated context from {len(messages)} to {len(truncated_messages)} messages")
        logger.info(f"Estimated tokens: {current_tokens}/{available_tokens}")
        
        return truncated_messages
        
    def get_fallback_model(self, original_model: str) -> Optional[str]:
        """Get the next fallback model in the chain"""
        if original_model not in self.fallback_chains:
            return None
            
        fallbacks = self.fallback_chains[original_model]
        if not fallbacks:
            return None
            
        # Return the first available fallback
        for fallback in fallbacks:
            if fallback in self.models:
                return fallback
                
        return None
        
    def handle_context_exceeded(self, messages: List[Dict], model: str) -> Dict[str, Any]:
        """Handle context window exceeded error"""
        logger.warning(f"Context window exceeded for model {model}")
        
        # Strategy 1: Try to truncate context
        truncated_messages = self.truncate_context(messages, model)
        
        # Strategy 2: If still too large, try fallback model
        fallback_model = self.get_fallback_model(model)
        
        if fallback_model:
            logger.info(f"Falling back to model: {fallback_model}")
            # Try truncating for fallback model too
            truncated_messages = self.truncate_context(messages, fallback_model)
            
        return {
            'messages': truncated_messages,
            'model': fallback_model or model,
            'truncated': len(truncated_messages) < len(messages),
            'fallback_used': fallback_model is not None
        }
        
    def optimize_conversation(self, messages: List[Dict], model: str) -> Dict[str, Any]:
        """Optimize conversation for better context management"""
        
        # Remove redundant messages
        optimized_messages = self._remove_redundant_messages(messages)
        
        # Summarize old messages if context is getting large
        if len(optimized_messages) > 20:  # Threshold for summarization
            optimized_messages = self._summarize_old_messages(optimized_messages)
            
        # Check if we're approaching context limit
        total_tokens = sum(self.count_tokens(str(msg), model) for msg in optimized_messages)
        context_limit = self.models.get(model, ModelConfig('default', 4096, 4096)).context_window
        
        if total_tokens > context_limit * 0.8:  # 80% threshold
            logger.warning(f"Approaching context limit: {total_tokens}/{context_limit}")
            optimized_messages = self.truncate_context(optimized_messages, model)
            
        return {
            'messages': optimized_messages,
            'token_count': total_tokens,
            'optimization_applied': len(optimized_messages) < len(messages)
        }
        
    def _remove_redundant_messages(self, messages: List[Dict]) -> List[Dict]:
        """Remove redundant or duplicate messages"""
        seen_content = set()
        unique_messages = []
        
        for msg in messages:
            content = str(msg.get('content', ''))
            if content not in seen_content or msg.get('role') == 'system':
                unique_messages.append(msg)
                seen_content.add(content)
                
        return unique_messages
        
    def _summarize_old_messages(self, messages: List[Dict]) -> List[Dict]:
        """Summarize older messages to save context"""
        if len(messages) <= 10:
            return messages
            
        # Keep system message, summarize middle, keep recent messages
        system_msg = messages[0] if messages[0].get('role') == 'system' else None
        recent_messages = messages[-5:]  # Keep last 5 messages
        old_messages = messages[1:-5] if system_msg else messages[:-5]
        
        # Create summary of old messages
        summary_content = "Previous conversation summary:\n"
        for msg in old_messages:
            role = msg.get('role', 'unknown')
            content = str(msg.get('content', ''))[:100]  # First 100 chars
            summary_content += f"{role}: {content}...\n"
            
        summary_msg = {
            'role': 'system',
            'content': summary_content
        }
        
        result = []
        if system_msg:
            result.append(system_msg)
        result.append(summary_msg)
        result.extend(recent_messages)
        
        return result

def create_litellm_proxy_config():
    """Create a LiteLLM proxy configuration file"""
    config = {
        "model_list": [
            {
                "model_name": "gpt-4o-mini",
                "litellm_params": {
                    "model": "gpt-4o-mini",
                    "api_key": "os.environ/OPENAI_API_KEY"
                }
            },
            {
                "model_name": "gpt-4-turbo",
                "litellm_params": {
                    "model": "gpt-4-turbo",
                    "api_key": "os.environ/OPENAI_API_KEY"
                }
            },
            {
                "model_name": "claude-3-sonnet",
                "litellm_params": {
                    "model": "anthropic/claude-3-sonnet-20240229",
                    "api_key": "os.environ/ANTHROPIC_API_KEY"
                }
            }
        ],
        "router_settings": {
            "context_window_fallbacks": [
                {"gpt-4o-mini": ["gpt-4-turbo", "claude-3-sonnet"]},
                {"gpt-4-turbo": ["claude-3-sonnet"]},
                {"claude-3-sonnet": ["gpt-4-turbo"]}
            ]
        },
        "general_settings": {
            "master_key": "your-secret-key",
            "database_url": "your-database-url"
        }
    }
    
    with open('litellm-proxy-config.yaml', 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
        
    logger.info("Created litellm-proxy-config.yaml")

def main():
    """Main function for testing the context manager"""
    manager = ContextWindowManager()
    
    # Example usage
    sample_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"},
        {"role": "assistant", "content": "I'm doing well, thank you!"},
        {"role": "user", "content": "Can you help me with a long task?" * 1000}  # Very long message
    ]
    
    # Test context optimization
    result = manager.optimize_conversation(sample_messages, "gpt-4o-mini")
    print(f"Optimized conversation: {len(result['messages'])} messages")
    print(f"Token count: {result['token_count']}")
    
    # Test context exceeded handling
    exceeded_result = manager.handle_context_exceeded(sample_messages, "gpt-4o-mini")
    print(f"Context exceeded handling: {exceeded_result}")
    
    # Create proxy config
    create_litellm_proxy_config()

if __name__ == "__main__":
    main()
