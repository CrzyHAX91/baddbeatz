// SECURITY: Consider using DOMPurify for sanitization
// import DOMPurify from 'dompurify';

// Enhanced AI Chat functionality with better error handling and UX
(function() {
  'use strict';

  let isProcessing = false;
  let retryCount = 0;
  const maxRetries = 3;

  // Initialize AI chat when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initAIChat();
  });

function initAIChat() {
  const chatForm = document.getElementById('aiChatForm');
  const userInput = document.getElementById('userInput');
  const askButton = document.getElementById('askButton');
  const responseBox = document.getElementById('aiResponse');
  const premiumMessage = document.getElementById('premiumMessage');

  if (!userInput || !askButton || !responseBox || !premiumMessage) {
    console.warn('AI chat elements not found on this page');
    return;
  }

  // Check premium status
  checkPremiumStatus();

  // Create form if it doesn't exist
  if (!chatForm) {
    const form = document.createElement('form');
    form.id = 'aiChatForm';
    form.addEventListener('submit', handleAskSubmit);
    userInput.parentNode.insertBefore(form, userInput);
    form.appendChild(userInput);
    form.appendChild(askButton);
  } else {
    chatForm.addEventListener('submit', handleAskSubmit);
  }

  // Add click handler for backward compatibility
  askButton.addEventListener('click', function(e) {
    e.preventDefault();
    handleAskSubmit(e);
  });

  // Add keyboard shortcuts
  userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAskSubmit(e);
    }
  });

  // Add input validation
  userInput.addEventListener('input', function() {
    const question = this.value.trim();
    askButton.disabled = !question || question.length > 1000 || isProcessing;
    
    // Show character count
    updateCharacterCount(question.length);
  });
}

async function checkPremiumStatus() {
  const authToken = localStorage.getItem('authToken');
  const userInput = document.getElementById('userInput');
  const askButton = document.getElementById('askButton');
  const premiumMessage = document.getElementById('premiumMessage');

  if (!authToken) {
    premiumMessage.style.display = 'block';
    userInput.disabled = true;
    askButton.disabled = true;
    return;
  }

  try {
    const response = await fetch('/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user status');
    }

    const userData = await response.json();
    
    if (!userData.is_premium) {
      premiumMessage.style.display = 'block';
      userInput.disabled = true;
      askButton.disabled = true;
    } else {
      premiumMessage.style.display = 'none';
      userInput.disabled = false;
      askButton.disabled = false;
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
    premiumMessage.textContent = 'Error checking premium status. Please try refreshing the page.';
    premiumMessage.style.display = 'block';
    userInput.disabled = true;
    askButton.disabled = true;
  }
}

  function updateCharacterCount(count) {
    let counter = document.getElementById('charCounter');
    if (!counter) {
      counter = document.createElement('div');
      counter.id = 'charCounter';
      counter.className = 'char-counter';
      document.getElementById('userInput').parentNode.appendChild(counter);
    }
    
    counter.textContent = `${count}/1000`;
    counter.className = `char-counter ${count > 1000 ? 'over-limit' : ''}`;
  }

  async function handleAskSubmit(e) {
    e.preventDefault();
    
    if (isProcessing) return;

    const userInput = document.getElementById('userInput');
    const askButton = document.getElementById('askButton');
    const responseBox = document.getElementById('aiResponse');
    
    const question = userInput.value.trim();
    
    if (!question) {
      showError('Please enter a question.');
      return;
    }

    if (question.length > 1000) {
      showError('Question is too long. Please keep it under 1000 characters.');
      return;
    }

    await askDJWithRetry(question);
  }

  async function askDJWithRetry(question, attempt = 1) {
    const userInput = document.getElementById('userInput');
    const askButton = document.getElementById('askButton');
    const responseBox = document.getElementById('aiResponse');

    try {
      isProcessing = true;
      askButton.disabled = true;
      
      // Show loading state
      showLoading();
      
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ question: question }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || data.error || 'No response received.';
      
      showResponse(aiResponse);
      retryCount = 0; // Reset retry count on success
      
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      if (attempt < maxRetries && !error.name === 'AbortError') {
        // Exponential backoff retry
        const delay = Math.pow(2, attempt) * 1000;
        showRetrying(attempt, delay);
        
        setTimeout(() => {
          askDJWithRetry(question, attempt + 1);
        }, delay);
      } else {
        showError(getErrorMessage(error));
      }
    } finally {
      if (attempt >= maxRetries || retryCount === 0) {
        isProcessing = false;
        askButton.disabled = false;
      }
    }
  }

  function showLoading() {
    const responseBox = document.getElementById('aiResponse');
    responseBox.className = 'ai-response loading';
    responseBox.innerHTML = '
      <div class=' /* SECURITY: Review this innerHTML usage */loading-spinner"></div>
      <div class="loading-text">TheBadGuy is thinking...</div>
    `;
  }

  function showRetrying(attempt, delay) {
    const responseBox = document.getElementById('aiResponse');
    responseBox.className = 'ai-response retrying';
    responseBox.innerHTML = '
      <div class=' /* SECURITY: Review this innerHTML usage */retry-spinner"></div>
      <div class="retry-text">Connection issue... retrying in ${delay/1000}s (attempt ${attempt}/${maxRetries})</div>
    `;
  }

  function showResponse(response) {
    const responseBox = document.getElementById('aiResponse');
    responseBox.className = 'ai-response success';
    responseBox.textContent = response;
    
    // Add copy button
    addCopyButton(responseBox, response);
  }

  function showError(message) {
    const responseBox = document.getElementById('aiResponse');
    responseBox.className = 'ai-response error';
    responseBox.innerHTML = '
      <div class=' /* SECURITY: Review this innerHTML usage */error-icon">⚠️</div>
      <div class="error-message">${message}</div>
      <div class="error-help">
        <p>Try:</p>
        <ul>
          <li>Refreshing the page</li>
          <li>Asking a shorter question</li>
          <li>Contacting me directly through the contact page</li>
        </ul>
      </div>
    `;
  }

  function addCopyButton(container, text) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.onclick = function() {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
        }, 2000);
      }).catch(() => {
        copyBtn.textContent = '❌ Failed';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
        }, 2000);
      });
    };
    container.appendChild(copyBtn);
  }

  function getErrorMessage(error) {
    if (error.name === 'AbortError') {
      return 'Request timed out. The AI service might be busy. Please try again.';
    }
    
    if (error.message.includes('Failed to fetch')) {
      return 'Connection failed. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('500')) {
      return 'The AI service is temporarily unavailable. Please try again in a few minutes.';
    }
    
    if (error.message.includes('429')) {
      return 'Too many requests. Please wait a moment before asking another question.';
    }
    
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  // Add enhanced CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .ai-response {
      min-height: 60px;
      padding: 1rem;
      border-radius: 12px;
      margin-top: 1rem;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .ai-response.loading {
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid rgba(0, 255, 255, 0.3);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .ai-response.success {
      background: rgba(0, 255, 0, 0.1);
      border: 1px solid rgba(0, 255, 0, 0.3);
      color: #fff;
    }
    
    .ai-response.error {
      background: rgba(255, 0, 51, 0.1);
      border: 1px solid rgba(255, 0, 51, 0.3);
      color: #ff6b6b;
    }
    
    .ai-response.retrying {
      background: rgba(255, 165, 0, 0.1);
      border: 1px solid rgba(255, 165, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .loading-spinner, .retry-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid #00ffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .retry-spinner {
      border-top-color: #ffa500;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .char-counter {
      font-size: 0.8rem;
      color: #999;
      text-align: right;
      margin-top: 0.5rem;
    }
    
    .char-counter.over-limit {
      color: #ff6b6b;
      font-weight: bold;
    }
    
    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 255, 255, 0.2);
      border: 1px solid rgba(0, 255, 255, 0.5);
      color: #00ffff;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .copy-btn:hover {
      background: rgba(0, 255, 255, 0.3);
    }
    
    .error-help {
      margin-top: 1rem;
      font-size: 0.9rem;
    }
    
    .error-help ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    .error-help li {
      margin: 0.25rem 0;
    }
    
    #userInput:focus {
      outline: none;
      border-color: #00ffff;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
    }
    
    #askButton:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Export for global access (backward compatibility)
  window.askDJ = function() {
    const event = new Event('submit');
    handleAskSubmit(event);
  };

})();
