import yaml

try:
    with open('litellm-config.yaml', 'r') as f:
        config = yaml.safe_load(f)
    
    print('✓ Configuration loaded successfully')
    print(f'Models configured: {len(config["model_list"])}')
    print(f'Fallbacks configured: {"context_window_fallbacks" in config["router_settings"]}')
    
    # Test specific fallback for gpt-4o-mini
    fallbacks = config["router_settings"]["context_window_fallbacks"]
    gpt4o_fallbacks = None
    for fallback_config in fallbacks:
        if "gpt-4o-mini" in fallback_config:
            gpt4o_fallbacks = fallback_config["gpt-4o-mini"]
            break
    
    if gpt4o_fallbacks:
        print(f'✓ gpt-4o-mini fallbacks: {gpt4o_fallbacks}')
    else:
        print('❌ No fallbacks found for gpt-4o-mini')
        
except Exception as e:
    print(f'❌ Configuration test failed: {e}')
