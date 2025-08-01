(function() {
  'use strict';

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    initFadeInAnimations();
    initMobileNavigation();
    initSmoothScrolling();
    initScrollHeader();
    initDynamicImports();
  });

  // Fade-in animations with Intersection Observer
  function initFadeInAnimations() {
    const faders = document.querySelectorAll(".fade-in");
    
    if (!faders.length) return;

    const appearOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("appear");
        observer.unobserve(entry.target);
      });
    }, appearOptions);

    faders.forEach(fader => {
      appearOnScroll.observe(fader);
    });
  }

  // Mobile navigation toggle
  function initMobileNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navLinks = document.querySelector('.nav__links');
    const body = document.body;
    
    if (!navToggle || !navLinks) return;

    // Toggle mobile menu
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      const isActive = !expanded;
      
      navToggle.setAttribute('aria-expanded', String(isActive));
      navToggle.classList.toggle('nav__toggle--active');
      navLinks.classList.toggle('nav__links--active');
      
      // Prevent body scroll when menu is open
      if (isActive) {
        body.classList.add('nav-open');
      } else {
        body.classList.remove('nav-open');
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    // Helper function to close menu
    function closeMenu() {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('nav__toggle--active');
      navLinks.classList.remove('nav__links--active');
      body.classList.remove('nav-open');
    }
  }

  // Smooth scrolling for anchor links
  function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Initialize dynamic imports for lazy loading
  function initDynamicImports() {
    // Dashboard button
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (dashboardBtn) {
      dashboardBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading(dashboardBtn);
        
        try {
          const { default: loadDashboard } = await import('./modules/dashboard.js');
          await loadDashboard();
        } catch (error) {
          const { ErrorHandler } = await import('./utils/error-handler.js');
          ErrorHandler.handle(error, 'Failed to load dashboard');
        } finally {
          hideLoading(dashboardBtn);
        }
      });
    }

    // Admin panel button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
      adminBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading(adminBtn);
        
        try {
          const { default: loadAdmin } = await import('./modules/admin.js');
          await loadAdmin();
        } catch (error) {
          const { ErrorHandler } = await import('./utils/error-handler.js');
          ErrorHandler.handle(error, 'Failed to load admin panel');
        } finally {
          hideLoading(adminBtn);
        }
      });
    }

    // Music player - only load when needed
    const playButtons = document.querySelectorAll('.play-btn');
    if (playButtons.length > 0) {
      playButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          showLoading(btn);
          
          try {
            const { default: initMusicPlayer } = await import('./modules/music-player.js');
            await initMusicPlayer(btn.dataset.track);
          } catch (error) {
            const { ErrorHandler } = await import('./utils/error-handler.js');
            ErrorHandler.handle(error, 'Failed to load music player');
          } finally {
            hideLoading(btn);
          }
        });
      });
    }
  }

  // Utility function for throttling
  function throttle(func, limit) {
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

  // Add scroll-based header styling
  function initScrollHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    const handleScroll = throttle(() => {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
  }

  // Add loading state management
  function showLoading(element) {
    if (element) {
      element.classList.add('loading');
      element.setAttribute('aria-busy', 'true');
      
      // Add spinner if not present
      if (!element.querySelector('.loading-spinner')) {
        const spinner = document.createElement('span');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '⏳';
        element.appendChild(spinner);
      }
    }
  }

  function hideLoading(element) {
    if (element) {
      element.classList.remove('loading');
      element.setAttribute('aria-busy', 'false');
      
      // Remove spinner
      const spinner = element.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }
    }
  }

  // Export utilities for use in other scripts
  window.AppUtils = {
    throttle,
    showLoading,
    hideLoading
  };

})();
