# Test the context manager functionality
import sys
import os

# Add current directory to Python path
sys.path.insert(0, '.')

# Test basic imports and functionality
try:
    # Import the module directly
    import importlib.util
    spec = importlib.util.spec_from_file_location("litellm_context_manager", "litellm-context-manager.py")
    litellm_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(litellm_module)
    
    ContextWindowManager = litellm_module.ContextWindowManager
    print("✓ Context manager imported successfully")
    
    # Initialize manager
    manager = ContextWindowManager()
    print("✓ Context manager initialized")
    
    # Test token counting
    test_text = "This is a test message for token counting functionality."
    token_count = manager.count_tokens(test_text, "gpt-4o-mini")
    print(f"✓ Token counting works: '{test_text}' = {token_count} tokens")
    
    # Test context optimization
    test_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you today?"},
        {"role": "assistant", "content": "I'm doing well, thank you for asking!"},
        {"role": "user", "content": "Can you help me with a programming question?"}
    ]
    
    result = manager.optimize_conversation(test_messages, "gpt-4o-mini")
    print(f"✓ Context optimization: {len(result['messages'])} messages, {result['token_count']} tokens")
    
    # Test fallback model selection
    fallback = manager.get_fallback_model("gpt-4o-mini")
    if fallback:
        print(f"✓ Fallback model for gpt-4o-mini: {fallback}")
    else:
        print("⚠ No fallback model configured for gpt-4o-mini")
    
    # Test context exceeded handling
    long_messages = test_messages + [
        {"role": "user", "content": "This is a very long message. " * 1000}
    ]
    
    handled = manager.handle_context_exceeded(long_messages, "gpt-4o-mini")
    print(f"✓ Context exceeded handling: {len(handled['messages'])} messages, fallback: {handled['fallback_used']}")
    
    print("\n✅ All context manager tests passed!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure litellm_context_manager.py is in the current directory")
except Exception as e:
    print(f"❌ Context manager test failed: {e}")
