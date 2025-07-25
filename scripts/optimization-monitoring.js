/**
 * BaddBeatz Optimization Monitoring System
 * Tracks performance metrics, errors, and optimization progress
 */

class OptimizationMonitor {
    constructor() {
        this.metrics = {
            performance: {},
            errors: [],
            optimizations: {},
            userExperience: {}
        };
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.setupOptimizationTracking();
        this.setupUserExperienceTracking();
        this.startReporting();
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Core Web Vitals tracking
        this.trackCoreWebVitals();
        
        // Page load metrics
        window.addEventListener('load', () => {
            this.recordPageLoadMetrics();
        });

        // Resource loading monitoring
        this.monitorResourceLoading();
    }

    trackCoreWebVitals() {
        // First Contentful Paint (FCP)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.performance.fcp = entry.startTime;
                    this.logMetric('FCP', entry.startTime);
                }
            }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.performance.lcp = lastEntry.startTime;
            this.logMetric('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.performance.fid = entry.processingStart - entry.startTime;
                this.logMetric('FID', this.metrics.performance.fid);
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
            this.logMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    recordPageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        this.metrics.performance.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        this.metrics.performance.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        this.metrics.performance.totalLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        this.logMetric('DOM Content Loaded', this.metrics.performance.domContentLoaded);
        this.logMetric('Load Complete', this.metrics.performance.loadComplete);
        this.logMetric('Total Load Time', this.metrics.performance.totalLoadTime);
    }

    monitorResourceLoading() {
        // Monitor CSS loading
        const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
        this.metrics.performance.cssCount = cssFiles.length;
        
        // Monitor JS loading
        const jsFiles = document.querySelectorAll('script[src]');
        this.metrics.performance.jsCount = jsFiles.length;
        
        // Monitor image loading
        const images = document.querySelectorAll('img');
        this.metrics.performance.imageCount = images.length;
        
        this.logMetric('CSS Files', this.metrics.performance.cssCount);
        this.logMetric('JS Files', this.metrics.performance.jsCount);
        this.logMetric('Images', this.metrics.performance.imageCount);
    }

    // Error Tracking
    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Console errors (override console.error)
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.recordError({
                type: 'console',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalConsoleError.apply(console, args);
        };
    }

    recordError(error) {
        this.metrics.errors.push(error);
        this.logError(error);
        
        // Send critical errors immediately
        if (this.isCriticalError(error)) {
            this.sendErrorReport(error);
        }
    }

    isCriticalError(error) {
        const criticalPatterns = [
            'DOMPurify is not defined',
            'Cannot read property',
            'TypeError',
            'ReferenceError'
        ];
        
        return criticalPatterns.some(pattern => 
            error.message.includes(pattern)
        );
    }

    // Optimization Tracking
    setupOptimizationTracking() {
        // Track optimization implementations
        this.trackOptimizationStatus();
        
        // Monitor bundle sizes
        this.trackBundleSizes();
        
        // Track feature usage
        this.trackFeatureUsage();
    }

    trackOptimizationStatus() {
        const optimizations = {
            // Phase 1: Critical Fixes
            javascriptErrors: this.checkJavaScriptErrors(),
            dompurifyLoaded: this.checkDOMPurifyLoaded(),
            mobileNavigation: this.checkMobileNavigation(),
            backendAPI: this.checkBackendAPI(),
            
            // Phase 2: Performance
            cssOptimized: this.checkCSSOptimization(),
            jsCodeSplitting: this.checkJSCodeSplitting(),
            assetOptimization: this.checkAssetOptimization(),
            serviceWorkerOptimized: this.checkServiceWorkerOptimization(),
            
            // Phase 3: User Experience
            loadingStates: this.checkLoadingStates(),
            errorHandling: this.checkErrorHandling(),
            accessibility: this.checkAccessibility(),
            
            // Phase 4: SEO
            structuredData: this.checkStructuredData(),
            metaTags: this.checkMetaTags(),
            analytics: this.checkAnalytics()
        };
        
        this.metrics.optimizations = optimizations;
        this.logOptimizationStatus(optimizations);
    }

    // Optimization Check Methods
    checkJavaScriptErrors() {
        return this.metrics.errors.filter(e => e.type === 'javascript').length === 0;
    }

    checkDOMPurifyLoaded() {
        return typeof DOMPurify !== 'undefined';
    }

    checkMobileNavigation() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        return mobileToggle && mobileToggle.onclick !== null;
    }

    checkBackendAPI() {
        // This would be checked via API call in real implementation
        return true; // Placeholder
    }

    checkCSSOptimization() {
        return this.metrics.performance.cssCount <= 3;
    }

    checkJSCodeSplitting() {
        // Check if lazy loading is implemented
        return document.querySelectorAll('script[async], script[defer]').length > 0;
    }

    checkAssetOptimization() {
        return document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]').length > 0;
    }

    checkServiceWorkerOptimization() {
        return 'serviceWorker' in navigator && navigator.serviceWorker.controller;
    }

    checkLoadingStates() {
        return document.querySelectorAll('.loading, [data-loading]').length > 0;
    }

    checkErrorHandling() {
        return typeof ErrorHandler !== 'undefined';
    }

    checkAccessibility() {
        return document.querySelectorAll('[aria-label], [role]').length > 10;
    }

    checkStructuredData() {
        return document.querySelectorAll('script[type="application/ld+json"]').length > 0;
    }

    checkMetaTags() {
        return document.querySelectorAll('meta[property^="og:"], meta[name="description"]').length >= 3;
    }

    checkAnalytics() {
        return typeof gtag !== 'undefined' || typeof analytics !== 'undefined';
    }

    trackBundleSizes() {
        // Estimate bundle sizes based on resource loading
        const resources = performance.getEntriesByType('resource');
        let totalSize = 0;
        
        resources.forEach(resource => {
            if (resource.transferSize) {
                totalSize += resource.transferSize;
            }
        });
        
        this.metrics.performance.totalBundleSize = totalSize;
        this.logMetric('Total Bundle Size', `${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    }

    trackFeatureUsage() {
        // Track which features are being used
        const features = {
            pwaBanner: document.querySelector('.pwa-install-banner') !== null,
            audioPlayer: document.querySelector('.audio-player') !== null,
            liveStream: document.querySelector('.live-stream') !== null,
            chatBot: document.querySelector('.chat-bot') !== null,
            socialLogin: document.querySelector('.social-login') !== null
        };
        
        this.metrics.userExperience.featuresUsed = features;
    }

    // User Experience Tracking
    setupUserExperienceTracking() {
        // Track user interactions
        this.trackUserInteractions();
        
        // Track page visibility
        this.trackPageVisibility();
        
        // Track scroll behavior
        this.trackScrollBehavior();
    }

    trackUserInteractions() {
        let interactionCount = 0;
        
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionCount++;
            });
        });
        
        // Record interaction count every 30 seconds
        setInterval(() => {
            this.metrics.userExperience.interactionsPerMinute = interactionCount * 2;
            interactionCount = 0;
        }, 30000);
    }

    trackPageVisibility() {
        let visibilityStart = Date.now();
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const visibilityDuration = Date.now() - visibilityStart;
                this.metrics.userExperience.averageVisibilityTime = visibilityDuration;
            } else {
                visibilityStart = Date.now();
            }
        });
    }

    trackScrollBehavior() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
            this.metrics.userExperience.maxScrollDepth = maxScroll;
        });
    }

    // Reporting
    startReporting() {
        // Send reports every 5 minutes
        setInterval(() => {
            this.generateReport();
        }, 300000);
        
        // Send report on page unload
        window.addEventListener('beforeunload', () => {
            this.generateReport();
        });
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics: this.metrics,
            optimizationScore: this.calculateOptimizationScore()
        };
        
        this.sendReport(report);
        this.logReport(report);
    }

    calculateOptimizationScore() {
        const optimizations = this.metrics.optimizations;
        const totalOptimizations = Object.keys(optimizations).length;
        const completedOptimizations = Object.values(optimizations).filter(Boolean).length;
        
        return Math.round((completedOptimizations / totalOptimizations) * 100);
    }

    sendReport(report) {
        // In production, send to analytics service
        if (typeof fetch !== 'undefined') {
            fetch('/api/analytics/optimization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(report)
            }).catch(error => {
                console.warn('Failed to send optimization report:', error);
            });
        }
    }

    sendErrorReport(error) {
        // Send critical errors immediately
        if (typeof fetch !== 'undefined') {
            fetch('/api/analytics/error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    error: error
                })
            }).catch(err => {
                console.warn('Failed to send error report:', err);
            });
        }
    }

    // Logging Methods
    logMetric(name, value) {
        console.log(`📊 [METRIC] ${name}: ${value}`);
    }

    logError(error) {
        console.error(`🚨 [ERROR] ${error.type}: ${error.message}`);
    }

    logOptimizationStatus(optimizations) {
        const completed = Object.values(optimizations).filter(Boolean).length;
        const total = Object.keys(optimizations).length;
        console.log(`🎯 [OPTIMIZATION] Progress: ${completed}/${total} (${Math.round(completed/total*100)}%)`);
    }

    logReport(report) {
        console.log(`📋 [REPORT] Optimization Score: ${report.optimizationScore}%`);
        console.log(`📋 [REPORT] Performance:`, report.metrics.performance);
        console.log(`📋 [REPORT] Errors: ${report.metrics.errors.length}`);
    }

    // Public API
    getMetrics() {
        return this.metrics;
    }

    getOptimizationScore() {
        return this.calculateOptimizationScore();
    }

    getPerformanceReport() {
        return {
            coreWebVitals: {
                fcp: this.metrics.performance.fcp,
                lcp: this.metrics.performance.lcp,
                fid: this.metrics.performance.fid,
                cls: this.metrics.performance.cls
            },
            loadTimes: {
                domContentLoaded: this.metrics.performance.domContentLoaded,
                loadComplete: this.metrics.performance.loadComplete,
                totalLoadTime: this.metrics.performance.totalLoadTime
            },
            resources: {
                cssCount: this.metrics.performance.cssCount,
                jsCount: this.metrics.performance.jsCount,
                imageCount: this.metrics.performance.imageCount,
                totalBundleSize: this.metrics.performance.totalBundleSize
            }
        };
    }
}

// Initialize monitoring system
const optimizationMonitor = new OptimizationMonitor();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizationMonitor;
}

// Make available globally
window.OptimizationMonitor = optimizationMonitor;

console.log('🚀 BaddBeatz Optimization Monitoring System initialized');
