/**
 * Error Handler Utility
 * Centralized error handling with user feedback
 */

export class ErrorHandler {
  static toastContainer = null;
  
  static init() {
    // Create toast container if it doesn't exist
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  }
  
  /**
   * Handle error with user feedback
   * @param {Error} error - The error object
   * @param {string} userMessage - User-friendly message
   * @param {string} type - Error type: 'error', 'warning', 'info'
   */
  static handle(error, userMessage, type = 'error') {
    // Log to console for debugging
    console.error('[ErrorHandler]', error);
    
    // Show user-friendly message
    this.showToast(userMessage, type);
    
    // Optional: Send to analytics/monitoring service
    this.logError(error, userMessage);
  }
  
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type
   */
  static showToast(message, type = 'error') {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${this.getIcon(type)}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
    
    // Add animation
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 100);
  }
  
  /**
   * Get icon for toast type
   * @param {string} type - Toast type
   * @returns {string} Icon HTML
   */
  static getIcon(type) {
    const icons = {
      error: '⚠️',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || icons.error;
  }
  
  /**
   * Log error to monitoring service
   * @param {Error} error - The error object
   * @param {string} userMessage - User message
   */
  static logError(error, userMessage) {
    // In a real application, you would send this to a monitoring service
    // like Sentry, LogRocket, or your own analytics endpoint
    const errorData = {
      message: error.message,
      stack: error.stack,
      userMessage,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Example: Send to analytics endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // }).catch(() => {}); // Fail silently
    
    console.log('[ErrorHandler] Error logged:', errorData);
  }
  
  /**
   * Handle async function with error catching
   * @param {Function} asyncFn - Async function to execute
   * @param {string} errorMessage - Error message for user
   * @returns {Promise} Result or handled error
   */
  static async handleAsync(asyncFn, errorMessage = 'An error occurred') {
    try {
      return await asyncFn();
    } catch (error) {
      this.handle(error, errorMessage);
      throw error; // Re-throw for caller to handle if needed
    }
  }
  
  /**
   * Wrap function with error handling
   * @param {Function} fn - Function to wrap
   * @param {string} errorMessage - Error message for user
   * @returns {Function} Wrapped function
   */
  static wrap(fn, errorMessage = 'An error occurred') {
    return (...args) => {
      try {
        const result = fn.apply(this, args);
        
        // Handle async functions
        if (result && typeof result.catch === 'function') {
          return result.catch(error => {
            this.handle(error, errorMessage);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        this.handle(error, errorMessage);
        throw error;
      }
    };
  }
}

// Initialize error handler when module loads
ErrorHandler.init();

// Global error handlers
window.addEventListener('error', (event) => {
  ErrorHandler.handle(event.error, 'An unexpected error occurred');
});

window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, 'An unexpected error occurred');
  event.preventDefault(); // Prevent console error
});
