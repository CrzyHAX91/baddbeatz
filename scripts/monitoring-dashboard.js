/**
 * BaddBeatz Monitoring Dashboard
 * Tracks performance metrics, user engagement, and optimization progress
 */

class BaddBeatzMonitoring {
    constructor() {
        this.metrics = {
            performance: {},
            userEngagement: {},
            businessKPIs: {},
            technicalHealth: {}
        };
        this.alerts = [];
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupUserEngagementTracking();
        this.setupBusinessMetrics();
        this.setupTechnicalHealthChecks();
        this.startDashboard();
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Core Web Vitals tracking
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackCoreWebVital(entry);
                }
            });

            observer.observe({
                entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']
            });
        }

        // Page load performance
        window.addEventListener('load', () => {
            this.trackPageLoadMetrics();
        });

        // Bundle size monitoring
        this.trackBundleSize();
    }

    trackCoreWebVital(entry) {
        const metric = {
            name: entry.name,
            value: entry.value,
            rating: this.getRating(entry.name, entry.value),
            timestamp: Date.now(),
            page: window.location.pathname
        };

        this.metrics.performance[entry.name] = metric;
        
        // Alert if performance degrades
        if (metric.rating === 'poor') {
            this.createAlert('performance', `Poor ${entry.name}: ${entry.value}`, 'high');
        }

        this.sendToAnalytics('core_web_vital', metric);
    }

    trackPageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstByte: navigation.responseStart - navigation.requestStart,
            domInteractive: navigation.domInteractive - navigation.navigationStart,
            timestamp: Date.now(),
            page: window.location.pathname
        };

        this.metrics.performance.pageLoad = metrics;
        
        // Alert if page load is too slow
        if (metrics.loadComplete > 3000) {
            this.createAlert('performance', `Slow page load: ${metrics.loadComplete}ms`, 'medium');
        }

        this.sendToAnalytics('page_load_metrics', metrics);
    }

    trackBundleSize() {
        // Estimate bundle size from loaded resources
        const resources = performance.getEntriesByType('resource');
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;

        resources.forEach(resource => {
            if (resource.transferSize) {
                totalSize += resource.transferSize;
                if (resource.name.endsWith('.js')) {
                    jsSize += resource.transferSize;
                } else if (resource.name.endsWith('.css')) {
                    cssSize += resource.transferSize;
                }
            }
        });

        const bundleMetrics = {
            totalSize,
            jsSize,
            cssSize,
            timestamp: Date.now()
        };

        this.metrics.performance.bundleSize = bundleMetrics;
        
        // Alert if bundle size is too large
        if (totalSize > 500000) { // 500KB threshold
            this.createAlert('performance', `Large bundle size: ${(totalSize/1024).toFixed(2)}KB`, 'medium');
        }

        this.sendToAnalytics('bundle_size', bundleMetrics);
    }

    // User Engagement Tracking
    setupUserEngagementTracking() {
        this.sessionStart = Date.now();
        this.pageViews = 0;
        this.interactions = 0;

        // Track page views
        this.trackPageView();

        // Track user interactions
        this.setupInteractionTracking();

        // Track session duration
        this.setupSessionTracking();

        // Track feature usage
        this.setupFeatureTracking();
    }

    trackPageView() {
        this.pageViews++;
        const pageView = {
            page: window.location.pathname,
            timestamp: Date.now(),
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };

        this.metrics.userEngagement.pageViews = this.pageViews;
        this.sendToAnalytics('page_view', pageView);
    }

    setupInteractionTracking() {
        const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart'];
        
        interactionEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.interactions++;
                this.metrics.userEngagement.interactions = this.interactions;
            }, { passive: true });
        });
    }

    setupSessionTracking() {
        // Track session duration every 30 seconds
        setInterval(() => {
            const sessionDuration = Date.now() - this.sessionStart;
            this.metrics.userEngagement.sessionDuration = sessionDuration;
            
            this.sendToAnalytics('session_update', {
                duration: sessionDuration,
                pageViews: this.pageViews,
                interactions: this.interactions
            });
        }, 30000);

        // Track session end
        window.addEventListener('beforeunload', () => {
            const sessionData = {
                duration: Date.now() - this.sessionStart,
                pageViews: this.pageViews,
                interactions: this.interactions,
                endReason: 'navigation'
            };
            
            this.sendToAnalytics('session_end', sessionData);
        });
    }

    setupFeatureTracking() {
        // Track authentication events
        this.trackAuthenticationEvents();
        
        // Track music player usage
        this.trackMusicPlayerEvents();
        
        // Track live streaming events
        this.trackLiveStreamingEvents();
        
        // Track booking inquiries
        this.trackBookingEvents();
    }

    trackAuthenticationEvents() {
        // Login attempts
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                this.sendToAnalytics('auth_attempt', { type: 'login' });
            } else if (e.target.id === 'registerForm') {
                this.sendToAnalytics('auth_attempt', { type: 'register' });
            }
        });
    }

    trackMusicPlayerEvents() {
        // Track play/pause events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('play-button')) {
                this.sendToAnalytics('music_player', { action: 'play' });
            } else if (e.target.classList.contains('pause-button')) {
                this.sendToAnalytics('music_player', { action: 'pause' });
            }
        });
    }

    trackLiveStreamingEvents() {
        // Track stream views
        if (window.location.pathname === '/live.html') {
            this.sendToAnalytics('live_stream', { action: 'view_start' });
            
            // Track stream duration
            const streamStart = Date.now();
            window.addEventListener('beforeunload', () => {
                this.sendToAnalytics('live_stream', { 
                    action: 'view_end',
                    duration: Date.now() - streamStart
                });
            });
        }
    }

    trackBookingEvents() {
        // Track contact form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('booking-form')) {
                this.sendToAnalytics('booking_inquiry', { 
                    page: window.location.pathname,
                    timestamp: Date.now()
                });
            }
        });
    }

    // Business Metrics
    setupBusinessMetrics() {
        this.trackConversionFunnel();
        this.trackRevenueEvents();
        this.trackUserRetention();
    }

    trackConversionFunnel() {
        const funnelSteps = {
            'landing': 'Landing page visit',
            'contact_view': 'Contact form viewed',
            'contact_submit': 'Contact form submitted',
            'booking_confirmed': 'Booking confirmed'
        };

        // Track funnel progression
        Object.keys(funnelSteps).forEach(step => {
            if (this.shouldTrackFunnelStep(step)) {
                this.sendToAnalytics('conversion_funnel', { step, timestamp: Date.now() });
            }
        });
    }

    shouldTrackFunnelStep(step) {
        switch(step) {
            case 'landing':
                return window.location.pathname === '/';
            case 'contact_view':
                return window.location.pathname.includes('contact') || 
                       document.querySelector('.contact-form') !== null;
            case 'contact_submit':
                // This would be triggered by form submission event
                return false;
            case 'booking_confirmed':
                // This would be triggered by successful booking
                return false;
            default:
                return false;
        }
    }

    trackRevenueEvents() {
        // Track premium subscription events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('premium-upgrade')) {
                this.sendToAnalytics('revenue_event', { 
                    type: 'premium_click',
                    value: 9.99
                });
            }
        });

        // Track merchandise clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('merch-item')) {
                this.sendToAnalytics('revenue_event', { 
                    type: 'merchandise_click',
                    item: e.target.dataset.item
                });
            }
        });
    }

    trackUserRetention() {
        // Track returning users
        const lastVisit = localStorage.getItem('lastVisit');
        const currentVisit = Date.now();
        
        if (lastVisit) {
            const daysSinceLastVisit = (currentVisit - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
            this.sendToAnalytics('user_retention', { 
                daysSinceLastVisit,
                isReturningUser: true
            });
        } else {
            this.sendToAnalytics('user_retention', { 
                isReturningUser: false,
                isNewUser: true
            });
        }
        
        localStorage.setItem('lastVisit', currentVisit.toString());
    }

    // Technical Health Checks
    setupTechnicalHealthChecks() {
        this.checkJavaScriptErrors();
        this.checkAPIHealth();
        this.checkSecurityHeaders();
        this.checkPWAStatus();
    }

    checkJavaScriptErrors() {
        window.addEventListener('error', (event) => {
            const error = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            };

            this.createAlert('technical', `JavaScript Error: ${event.message}`, 'high');
            this.sendToAnalytics('javascript_error', error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            const error = {
                reason: event.reason,
                promise: event.promise,
                timestamp: Date.now()
            };

            this.createAlert('technical', `Unhandled Promise Rejection: ${event.reason}`, 'high');
            this.sendToAnalytics('promise_rejection', error);
        });
    }

    checkAPIHealth() {
        // Check authentication API
        fetch('/api/health')
            .then(response => {
                this.metrics.technicalHealth.apiStatus = response.ok ? 'healthy' : 'degraded';
                if (!response.ok) {
                    this.createAlert('technical', 'API health check failed', 'high');
                }
            })
            .catch(error => {
                this.metrics.technicalHealth.apiStatus = 'down';
                this.createAlert('technical', 'API is unreachable', 'critical');
            });
    }

    checkSecurityHeaders() {
        // Check if security headers are present
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                const securityHeaders = [
                    'content-security-policy',
                    'x-frame-options',
                    'x-content-type-options',
                    'strict-transport-security'
                ];

                const missingHeaders = securityHeaders.filter(header => 
                    !response.headers.has(header)
                );

                if (missingHeaders.length > 0) {
                    this.createAlert('security', `Missing security headers: ${missingHeaders.join(', ')}`, 'medium');
                }

                this.metrics.technicalHealth.securityHeaders = {
                    present: securityHeaders.length - missingHeaders.length,
                    missing: missingHeaders
                };
            });
    }

    checkPWAStatus() {
        // Check if service worker is registered
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    this.metrics.technicalHealth.pwaStatus = registration ? 'active' : 'inactive';
                });
        } else {
            this.metrics.technicalHealth.pwaStatus = 'unsupported';
        }

        // Check if app is installable
        window.addEventListener('beforeinstallprompt', () => {
            this.metrics.technicalHealth.installable = true;
        });
    }

    // Utility Methods
    getRating(metricName, value) {
        const thresholds = {
            'largest-contentful-paint': { good: 2500, poor: 4000 },
            'first-input-delay': { good: 100, poor: 300 },
            'cumulative-layout-shift': { good: 0.1, poor: 0.25 }
        };

        const threshold = thresholds[metricName];
        if (!threshold) return 'unknown';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }

    createAlert(category, message, severity) {
        const alert = {
            id: Date.now(),
            category,
            message,
            severity,
            timestamp: Date.now()
        };

        this.alerts.push(alert);
        console.warn(`[BaddBeatz Alert] ${severity.toUpperCase()}: ${message}`);
        
        // Send critical alerts immediately
        if (severity === 'critical') {
            this.sendToAnalytics('alert', alert);
        }
    }

    sendToAnalytics(event, data) {
        // Send to your analytics service (Google Analytics, custom endpoint, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }

        // Send to custom analytics endpoint
        if (window.customAnalytics) {
            window.customAnalytics.track(event, data);
        }

        // Store locally for dashboard
        const analyticsData = {
            event,
            data,
            timestamp: Date.now()
        };

        const existingData = JSON.parse(localStorage.getItem('baddbeatz_analytics') || '[]');
        existingData.push(analyticsData);
        
        // Keep only last 1000 events
        if (existingData.length > 1000) {
            existingData.splice(0, existingData.length - 1000);
        }
        
        localStorage.setItem('baddbeatz_analytics', JSON.stringify(existingData));
    }

    // Dashboard Methods
    startDashboard() {
        // Create dashboard UI if in development mode
        if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
            this.createDashboardUI();
        }

        // Update dashboard every 5 seconds
        setInterval(() => {
            this.updateDashboard();
        }, 5000);
    }

    createDashboardUI() {
        const dashboard = document.createElement('div');
        dashboard.id = 'baddbeatz-monitoring-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ffff;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #00ffff;
        `;

        dashboard.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #ff00ff;">
                🚀 BaddBeatz Monitoring
            </div>
            <div id="dashboard-content"></div>
            <button onclick="this.parentElement.style.display='none'" 
                    style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: #ff00ff; cursor: pointer;">
                ✕
            </button>
        `;

        document.body.appendChild(dashboard);
    }

    updateDashboard() {
        const content = document.getElementById('dashboard-content');
        if (!content) return;

        const performance = this.metrics.performance;
        const engagement = this.metrics.userEngagement;
        const technical = this.metrics.technicalHealth;

        content.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>⚡ Performance</strong><br>
                LCP: ${performance['largest-contentful-paint']?.value?.toFixed(0) || 'N/A'}ms 
                (${performance['largest-contentful-paint']?.rating || 'N/A'})<br>
                FID: ${performance['first-input-delay']?.value?.toFixed(0) || 'N/A'}ms<br>
                CLS: ${performance['cumulative-layout-shift']?.value?.toFixed(3) || 'N/A'}<br>
                Bundle: ${performance.bundleSize ? (performance.bundleSize.totalSize/1024).toFixed(1) + 'KB' : 'N/A'}
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>👥 Engagement</strong><br>
                Session: ${engagement.sessionDuration ? Math.floor(engagement.sessionDuration/1000) + 's' : 'N/A'}<br>
                Page Views: ${engagement.pageViews || 0}<br>
                Interactions: ${engagement.interactions || 0}
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>🔧 Technical</strong><br>
                API: ${technical.apiStatus || 'Unknown'}<br>
                PWA: ${technical.pwaStatus || 'Unknown'}<br>
                Security Headers: ${technical.securityHeaders?.present || 0}/4
            </div>
            
            <div>
                <strong>🚨 Alerts (${this.alerts.length})</strong><br>
                ${this.alerts.slice(-3).map(alert => 
                    `<span style="color: ${this.getAlertColor(alert.severity)}">${alert.message}</span>`
                ).join('<br>')}
            </div>
        `;
    }

    getAlertColor(severity) {
        switch(severity) {
            case 'critical': return '#ff0000';
            case 'high': return '#ff6600';
            case 'medium': return '#ffff00';
            case 'low': return '#00ff00';
            default: return '#ffffff';
        }
    }

    // Public API
    getMetrics() {
        return this.metrics;
    }

    getAlerts() {
        return this.alerts;
    }

    clearAlerts() {
        this.alerts = [];
    }

    exportData() {
        return {
            metrics: this.metrics,
            alerts: this.alerts,
            analyticsData: JSON.parse(localStorage.getItem('baddbeatz_analytics') || '[]')
        };
    }
}

// Initialize monitoring
const baddBeatzMonitoring = new BaddBeatzMonitoring();

// Make it globally available
window.BaddBeatzMonitoring = baddBeatzMonitoring;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaddBeatzMonitoring;
}
