/**
 * BaddBeatz UI Utilities
 * Common utility functions for enhanced user experience
 */

class BaddBeatzUI {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupFormEnhancements();
        this.setupLoadingStates();
        this.setupErrorHandling();
        this.setupAccessibility();
    }

    // Mobile Menu Fix
    setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, .hamburger');
        const mobileMenu = document.querySelector('.mobile-menu, .nav-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle menu visibility
                mobileMenu.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
                
                // Update ARIA attributes
                const isExpanded = mobileMenu.classList.contains('active');
                mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = isExpanded ? 'hidden' : '';
                
                console.log('Mobile menu toggled:', isExpanded);
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                    mobileMenuToggle.focus();
                }
            });
        }
    }

    // Form Enhancements
    setupFormEnhancements() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add loading states to form submissions
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Loading...';
                    submitBtn.classList.add('loading');
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    // Clear error state on input
                    input.classList.remove('error');
                    const errorMsg = input.parentNode.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                });
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Required field validation
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Password strength (basic)
        if (field.type === 'password' && value && value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters';
        }

        // Update UI based on validation
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field, errorMessage);
        } else {
            field.classList.remove('error');
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    // Loading States
    setupLoadingStates() {
        // Show loading for slow-loading content
        const loadingElements = document.querySelectorAll('[data-loading]');
        
        loadingElements.forEach(element => {
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading-spinner';
            loadingSpinner.innerHTML = '<div class="spinner"></div>';
            element.appendChild(loadingSpinner);

            // Hide spinner when content loads
            element.addEventListener('load', () => {
                loadingSpinner.remove();
            });
        });

        // Add loading states to buttons
        const buttons = document.querySelectorAll('button[data-async]');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('loading');
                button.disabled = true;
                
                // Re-enable after 3 seconds (fallback)
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.disabled = false;
                }, 3000);
            });
        });
    }

    // Error Handling
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            this.showNotification('An error occurred. Please refresh the page.', 'error');
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            this.showNotification('Something went wrong. Please try again.', 'error');
        });

        // Network errors
        window.addEventListener('offline', () => {
            this.showNotification('You are offline. Some features may not work.', 'warning');
        });

        window.addEventListener('online', () => {
            this.showNotification('Connection restored!', 'success');
        });
    }

    // Accessibility Enhancements
    setupAccessibility() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Focus management for modals
        const modals = document.querySelectorAll('.modal, .popup');
        modals.forEach(modal => {
            modal.addEventListener('show', () => {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            });
        });

        // Keyboard navigation for custom elements
        const customButtons = document.querySelectorAll('[role="button"]');
        customButtons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    // Notification System
    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
    }

    // Smooth Scrolling
    enableSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Lazy Loading Images
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    // Performance Monitoring Integration
    trackUserInteraction(element, action) {
        if (window.baddbeatzMonitor) {
            window.baddbeatzMonitor.reportEvent('user_interaction', {
                element: element.tagName.toLowerCase(),
                action: action,
                timestamp: Date.now(),
                page: window.location.pathname
            });
        }
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Safe DOM Manipulation (DOMPurify fallback)
    safeHTML(html) {
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(html);
        } else {
            // Basic sanitization fallback
            const div = document.createElement('div');
            div.textContent = html;
            return div.innerHTML;
        }
    }

    // Device Detection
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Local Storage Helpers
    setStorage(key, value) {
        try {
            localStorage.setItem(`baddbeatz_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    }

    getStorage(key) {
        try {
            const item = localStorage.getItem(`baddbeatz_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('LocalStorage read error:', e);
            return null;
        }
    }
}

// Initialize UI utilities when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.baddbeatzUI = new BaddBeatzUI();
    
    // Enable additional features
    window.baddbeatzUI.enableSmoothScrolling();
    window.baddbeatzUI.setupLazyLoading();
    
    console.log('🎵 BaddBeatz UI utilities initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaddBeatzUI;
}
