/**
 * BaddBeatz Enhanced Visual Effects
 * Particle system and animations for cyberpunk aesthetic
 */

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        // Create and setup canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Event listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Create initial particles
        this.createParticles();
        
        // Start animation
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 280 // Purple to pink range
            });
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Move particles
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x -= dx * force * 0.02;
                particle.y -= dy * force * 0.02;
            }

            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `hsla(${particle.hue}, 100%, 50%, ${0.2 * (1 - distance / 150)})`;
                    this.ctx.stroke();
                }
            });
        });

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.opacity})`;
            this.ctx.fill();

            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 50%, ${particle.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Smooth scroll animations
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Reveal animations on scroll
        this.observeElements();
    }

    observeElements() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in, .scale-in').forEach(el => {
            observer.observe(el);
        });
    }
}

// Hover effects for interactive elements
class HoverEffects {
    constructor() {
        this.init();
    }

    init() {
        // Add ripple effect to buttons
        document.querySelectorAll('button, .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add glow effect on hover for cards
        document.querySelectorAll('.card, .mix-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }
}

// Loading animations
class LoadingAnimation {
    constructor() {
        this.loader = null;
        this.init();
    }

    init() {
        // Create loading overlay
        this.loader = document.createElement('div');
        this.loader.className = 'loading-overlay';
        this.loader.innerHTML = `
            <div class="loader">
                <div class="loader-inner">
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                </div>
                <div class="loader-text">LOADING BEATS...</div>
            </div>
        `;
        document.body.appendChild(this.loader);

        // Hide loader when page is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loader.classList.add('fade-out');
                setTimeout(() => this.loader.remove(), 500);
            }, 1000);
        });
    }
}

// Page transition effects
class PageTransitions {
    constructor() {
        this.init();
    }

    init() {
        // Add transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);

        // Intercept navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.startsWith('#') && link.hostname === window.location.hostname) {
                e.preventDefault();
                overlay.classList.add('active');
                
                setTimeout(() => {
                    window.location.href = link.href;
                }, 500);
            }
        });

        // Remove overlay on page show
        window.addEventListener('pageshow', () => {
            overlay.classList.remove('active');
        });
    }
}

// Text animation effects
class TextAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Typewriter effect
        document.querySelectorAll('.typewriter').forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.visibility = 'visible';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            // Start animation when element is in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        typeWriter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(element);
        });

        // Glitch effect
        document.querySelectorAll('.glitch').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.classList.add('glitching');
                setTimeout(() => element.classList.remove('glitching'), 1000);
            });
        });
    }
}

// Initialize all animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize particle system on larger screens
    if (window.innerWidth > 768) {
        new ParticleSystem();
    }
    
    new SmoothScroll();
    new HoverEffects();
    new LoadingAnimation();
    new PageTransitions();
    new TextAnimations();
});

// Export for use in other modules
window.BaddBeatzAnimations = {
    ParticleSystem,
    SmoothScroll,
    HoverEffects,
    LoadingAnimation,
    PageTransitions,
    TextAnimations
};
