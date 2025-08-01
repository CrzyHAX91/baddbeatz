
/**
 * Lazy Loading Implementation for BaddBeatz
 */

// Lazy load images
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
});

// Lazy load YouTube iframes
function lazyLoadYouTube() {
  const videos = document.querySelectorAll('.youtube-lazy');
  
  const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const iframe = document.createElement('iframe');
        iframe.src = video.dataset.src;
        iframe.width = video.dataset.width || '560';
        iframe.height = video.dataset.height || '315';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        video.parentNode.replaceChild(iframe, video);
        observer.unobserve(video);
      }
    });
  });
  
  videos.forEach(video => videoObserver.observe(video));
}

// Dynamic import for code splitting
async function loadModule(moduleName) {
  try {
    const module = await import(`./modules/${moduleName}.js`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load module ${moduleName}:`, error);
  }
}

// Export functions
window.lazyLoadYouTube = lazyLoadYouTube;
window.loadModule = loadModule;
