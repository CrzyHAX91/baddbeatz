/**
 * Security Utilities for BaddBeatz
 * Provides safe DOM manipulation methods
 */

class SecurityUtils {
  /**
   * Safely set text content
   * @param {HTMLElement} element - The element to update
   * @param {string} text - The text content
   */
  static setTextContent(element, text) {
    if (element && typeof text === 'string') {
      element.textContent = text;
    }
  }

  /**
   * Safely create and append element
   * @param {HTMLElement} parent - Parent element
   * @param {string} tag - HTML tag name
   * @param {Object} options - Element options
   */
  static createElement(parent, tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
      element.className = options.className;
    }
    
    if (options.textContent) {
      element.textContent = options.textContent;
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (options.children) {
      options.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
    
    if (parent) {
      parent.appendChild(element);
    }
    
    return element;
  }

  /**
   * Sanitize HTML string (requires DOMPurify)
   * @param {string} html - HTML string to sanitize
   * @returns {string} Sanitized HTML
   */
  static sanitizeHTML(html) {
    // Check if DOMPurify is available
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'div', 'span', 'ul', 'li', 'ol'],
        ALLOWED_ATTR: ['href', 'class', 'id', 'target', 'rel']
      });
    }
    
    // Fallback: escape HTML
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Safe template literal handler
   * @param {Array} strings - Template literal strings
   * @param {...any} values - Template literal values
   * @returns {string} Safe HTML string
   */
  static safeHTML(strings, ...values) {
    let result = strings[0];
    
    for (let i = 0; i < values.length; i++) {
      result += this.escapeHTML(String(values[i])) + strings[i + 1];
    }
    
    return result;
  }

  /**
   * Create element from safe HTML template
   * @param {string} html - HTML string
   * @returns {DocumentFragment} Document fragment
   */
  static createFragment(html) {
    const template = document.createElement('template');
    template.innerHTML = this.sanitizeHTML(html);
    return template.content;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityUtils;
} else {
  window.SecurityUtils = SecurityUtils;
}
