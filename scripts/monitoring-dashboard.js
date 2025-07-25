/**
 * BaddBeatz Performance Monitoring Dashboard
 * Tracks optimization progress and performance metrics
 */
const crypto = require('crypto');

class BaddBeatzMonitor {
    constructor() {
        this.metrics = {
            performance: {},
            userEngagement: {},
            businessMetrics: {},
            technicalHealth: {}
        };
        this.init();
    }

    init() {
        this.setupPerformanceObserver();
        this.trackUserEngagement();
        this.monitorTechnicalHealth();
        this.startReporting();
    }

    // Core Web Vitals Monitoring
    setupPerformanceObserver() {
        // First Contentful Paint (FCP)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.performance.fcp = entry.startTime;
                    this.reportMetric('FCP', entry.startTime);
                }
            }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.performance.lcp = lastEntry.startTime;
            this.reportMetric('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.performance.fid = entry.processingStart - entry.startTime;
                this.reportMetric('FID', this.metrics.performance.fid);
            }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.metrics.performance.cls = clsValue;
            this.reportMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    // User Engagement Tracking
    trackUserEngagement() {
        let startTime = Date.now();
        let scrollDepth = 0;
        let maxScrollDepth = 0;

        // Time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - startTime;
            this.metrics.userEngagement.timeOnPage = timeOnPage;
            this.reportMetric('TimeOnPage', timeOnPage);
        });

        // Scroll depth tracking
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollDepth = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.metrics.userEngagement.scrollDepth = maxScrollDepth;
            }
        });

        // Click tracking for key elements
        this.trackClicks();
        
        // Music player engagement
        this.trackMusicEngagement();
    }

    trackClicks() {
        const keyElements = [
            '.book-now-btn',
            '.login-btn',
            '.join-community-btn',
            '.mobile-menu-toggle',
            '.social-links a',
            '.music-player-controls'
        ];

        keyElements.forEach(selector => {
            document.addEventListener('click', (e) => {
                if (e.target.matches(selector)) {
                    this.reportEvent('click', {
                        element: selector,
                        timestamp: Date.now(),
                        page: window.location.pathname
                    });
                }
            });
        });
    }

    trackMusicEngagement() {
        // SoundCloud player tracking
        const soundcloudPlayers = document.querySelectorAll('iframe[src*="soundcloud"]');
        soundcloudPlayers.forEach((player, index) => {
            // Track when players are in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.reportEvent('music_player_view', {
                            player: `soundcloud_${index}`,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            observer.observe(player);
        });

        // YouTube player tracking
        const youtubePlayers = document.querySelectorAll('iframe[src*="youtube"]');
        youtubePlayers.forEach((player, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.reportEvent('video_player_view', {
                            player: `youtube_${index}`,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            observer.observe(player);
        });
    }

    // Technical Health Monitoring
    monitorTechnicalHealth() {
        // JavaScript errors
        window.addEventListener('error', (e) => {
            this.reportError('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error ? e.error.stack : null
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.reportError('promise_rejection', {
                reason: e.reason,
                stack: e.reason ? e.reason.stack : null
            });
        });

        // Resource loading errors
        document.addEventListener('error', (e) => {
            if (e.target !== window) {
                this.reportError('resource_error', {
                    element: e.target.tagName,
                    source: e.target.src || e.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);

        // Network status
        window.addEventListener('online', () => {
            this.reportEvent('network_status', { status: 'online' });
        });

        window.addEventListener('offline', () => {
            this.reportEvent('network_status', { status: 'offline' });
        });
    }

    // Business Metrics Tracking
    trackBusinessMetrics() {
        // Form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.reportEvent('form_submission', {
                    formId: form.id || 'unknown',
                    formClass: form.className,
                    timestamp: Date.now()
                });
            });
        });

        // Booking inquiries
        const bookingButtons = document.querySelectorAll('.book-now-btn, .booking-btn');
        bookingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.reportEvent('booking_intent', {
                    timestamp: Date.now(),
                    page: window.location.pathname
                });
            });
        });

        // Newsletter signups
        const newsletterForms = document.querySelectorAll('form[action*="newsletter"], .newsletter-form');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', () => {
                this.reportEvent('newsletter_signup', {
                    timestamp: Date.now()
                });
            });
        });
    }

    // PWA Installation Tracking
    trackPWAInstallation() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
            this.reportEvent('pwa_install_prompt_shown', {
                timestamp: Date.now()
            });
        });

        window.addEventListener('appinstalled', () => {
            this.reportEvent('pwa_installed', {
                timestamp: Date.now()
            });
        });

        // Track install button clicks
        const installButtons = document.querySelectorAll('.install-app-btn, [data-action="install"]');
        installButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.reportEvent('pwa_install_clicked', {
                    timestamp: Date.now()
                });
            });
        });
    }

    // Reporting Functions
    reportMetric(name, value) {
        const data = {
            metric: name,
            value: value,
            timestamp: Date.now(),
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        // Send to analytics endpoint
        this.sendToAnalytics('metric', data);
        
        // Log to console in development
        if (this.isDevelopment()) {
            console.log(`📊 Metric: ${name} = ${value}ms`);
        }
    }

    reportEvent(eventName, data) {
        const eventData = {
            event: eventName,
            data: data,
            timestamp: Date.now(),
            page: window.location.pathname,
            sessionId: this.getSessionId()
        };

        this.sendToAnalytics('event', eventData);
        
        if (this.isDevelopment()) {
            console.log(`🎯 Event: ${eventName}`, data);
        }
    }

    reportError(errorType, errorData) {
        const data = {
            type: errorType,
            error: errorData,
            timestamp: Date.now(),
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        this.sendToAnalytics('error', data);
        
        console.error(`❌ Error: ${errorType}`, errorData);
    }

    // Analytics Integration
    sendToAnalytics(type, data) {
        // Send to Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', type, data);
        }

        // Send to custom analytics endpoint
        if (this.shouldSendToCustomEndpoint()) {
            fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, data })
            }).catch(err => {
                console.warn('Failed to send analytics data:', err);
            });
        }

        // Store locally for offline analysis
        this.storeLocally(type, data);
    }

    // Performance Dashboard
    generateDashboard() {
        const dashboard = {
            performance: {
                fcp: this.metrics.performance.fcp,
                lcp: this.metrics.performance.lcp,
                fid: this.metrics.performance.fid,
                cls: this.metrics.performance.cls,
                score: this.calculatePerformanceScore()
            },
            engagement: {
                timeOnPage: this.metrics.userEngagement.timeOnPage,
                scrollDepth: this.metrics.userEngagement.scrollDepth,
                interactions: this.getInteractionCount()
            },
            technical: {
                errors: this.getErrorCount(),
                loadTime: this.getPageLoadTime(),
                resources: this.getResourceMetrics()
            }
        };

        return dashboard;
    }

    calculatePerformanceScore() {
        const { fcp, lcp, fid, cls } = this.metrics.performance;
        
        let score = 100;
        
        // FCP scoring (target: <1.5s)
        if (fcp > 1500) score -= 20;
        else if (fcp > 1000) score -= 10;
        
        // LCP scoring (target: <2.5s)
        if (lcp > 2500) score -= 25;
        else if (lcp > 1500) score -= 15;
        
        // FID scoring (target: <100ms)
        if (fid > 100) score -= 20;
        else if (fid > 50) score -= 10;
        
        // CLS scoring (target: <0.1)
        if (cls > 0.1) score -= 15;
        else if (cls > 0.05) score -= 8;
        
        return Math.max(0, score);
    }

    // Utility Functions
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    shouldSendToCustomEndpoint() {
        return !this.isDevelopment() && 
               window.location.protocol === 'https:';
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('baddbeatz_session_id');
        if (!sessionId) {
            sessionId = this.generateSecureSessionId();
            sessionStorage.setItem('baddbeatz_session_id', sessionId);
        }
        return sessionId;
    }

    // Secure session ID generation using Web Crypto API
    generateSecureSessionId() {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            // Use Web Crypto API for cryptographically secure random values
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);
            const secureId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            return 'session_' + Date.now().toString(36) + '_' + secureId;
        } else {
            // Fallback for environments without Web Crypto API
            const crypto = require('crypto');
            const timestamp = Date.now().toString(36);
            const randomBytes = crypto.randomBytes(16);
            const randomPart = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
            console.warn('BaddBeatz Monitor: Using Node.js crypto module for secure random generation');
            return 'session_' + timestamp + '_' + randomPart;
        }
    }

    // Security utility methods
    static isSecureContextAvailable() {
        return typeof crypto !== 'undefined' && 
               typeof crypto.getRandomValues === 'function';
    }

    static generateSecureId(length = 32) {
        if (this.isSecureContextAvailable()) {
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            return Array.from(array, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
        } else {
            throw new Error('Secure random generation not available in this context');
        }
    }

    static generateCSRFToken() {
        return this.generateSecureId(32);
    }

    static generateNonce() {
        return this.generateSecureId(16);
    }

    storeLocally(type, data) {
        const key = `baddbeatz_analytics_${type}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        
        // Keep only last 100 entries
        if (existing.length > 100) {
            existing.splice(0, existing.length - 100);
        }
        
        localStorage.setItem(key, JSON.stringify(existing));
    }

    getInteractionCount() {
        const interactions = JSON.parse(localStorage.getItem('baddbeatz_analytics_event') || '[]');
        return interactions.filter(event => 
            event.data.event === 'click' || 
            event.data.event === 'form_submission'
        ).length;
    }

    getErrorCount() {
        const errors = JSON.parse(localStorage.getItem('baddbeatz_analytics_error') || '[]');
        return errors.length;
    }

    getPageLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        return navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    }

    getResourceMetrics() {
        const resources = performance.getEntriesByType('resource');
        return {
            total: resources.length,
            failed: resources.filter(r => r.transferSize === 0).length,
            slow: resources.filter(r => r.duration > 1000).length
        };
    }

    // Reporting Schedule
    startReporting() {
        // Send dashboard data every 30 seconds
        setInterval(() => {
            const dashboard = this.generateDashboard();
            this.reportEvent('dashboard_update', dashboard);
        }, 30000);

        // Send summary report every 5 minutes
        setInterval(() => {
            this.sendSummaryReport();
        }, 300000);
    }

    sendSummaryReport() {
        const summary = {
            performance: this.generateDashboard(),
            timestamp: Date.now(),
            page: window.location.pathname,
            session: this.getSessionId()
        };

        this.sendToAnalytics('summary', summary);
    }
}

// Initialize monitoring when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.baddbeatzMonitor = new BaddBeatzMonitor();
    
    // Expose dashboard for debugging
    window.getBaddBeatzDashboard = () => {
        return window.baddbeatzMonitor.generateDashboard();
    };
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaddBeatzMonitor;
}
