/**
 * BaddBeatz Audio Visualizer
 * Real-time audio visualization for SoundCloud and other audio sources
 */

class AudioVisualizer {
    constructor(options = {}) {
        this.canvas = null;
        this.ctx = null;
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.animationId = null;
        
        // Visualization settings
        this.options = {
            fftSize: options.fftSize || 256,
            smoothingTimeConstant: options.smoothingTimeConstant || 0.8,
            minDecibels: options.minDecibels || -90,
            maxDecibels: options.maxDecibels || -10,
            barWidth: options.barWidth || 2,
            barGap: options.barGap || 1,
            waveformColor: options.waveformColor || '#00ffff',
            barColor: options.barColor || '#ff0033',
            mirrorWave: options.mirrorWave !== false,
            showParticles: options.showParticles !== false
        };
        
        this.particles = [];
        this.visualizationMode = 'bars'; // 'bars', 'waveform', 'circular'
        
        this.init();
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'audio-visualizer';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '200px';
        this.canvas.style.background = 'rgba(0, 0, 0, 0.5)';
        this.canvas.style.borderRadius = '12px';
        this.canvas.style.border = '1px solid rgba(255, 0, 51, 0.3)';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set up audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.options.fftSize;
        this.analyser.smoothingTimeConstant = this.options.smoothingTimeConstant;
        this.analyser.minDecibels = this.options.minDecibels;
        this.analyser.maxDecibels = this.options.maxDecibels;
        
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    connectAudioElement(audioElement) {
        if (this.source) {
            this.source.disconnect();
        }
        
        try {
            this.source = this.audioContext.createMediaElementSource(audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            // Start visualization when audio plays
            audioElement.addEventListener('play', () => this.start());
            audioElement.addEventListener('pause', () => this.stop());
            audioElement.addEventListener('ended', () => this.stop());
            
            return true;
        } catch (error) {
            console.error('Error connecting audio element:', error);
            return false;
        }
    }

    connectSoundCloudWidget(widget) {
        // For SoundCloud widget, we need to get the audio element from the iframe
        widget.bind(SC.Widget.Events.PLAY, () => {
            // Try to access the audio element within the widget
            try {
                const iframe = widget.getIframe();
                const audioElement = iframe.contentWindow.document.querySelector('audio');
                if (audioElement) {
                    this.connectAudioElement(audioElement);
                }
            } catch (error) {
                console.warn('Cannot access SoundCloud audio element due to cross-origin restrictions');
                // Fallback to fake visualization based on time
                this.startFakeVisualization();
            }
        });
        
        widget.bind(SC.Widget.Events.PAUSE, () => this.stop());
        widget.bind(SC.Widget.Events.FINISH, () => this.stop());
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.clearCanvas();
        }
    }

    clearCanvas() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw based on visualization mode
        switch (this.visualizationMode) {
            case 'bars':
                this.drawBars();
                break;
            case 'waveform':
                this.drawWaveform();
                break;
            case 'circular':
                this.drawCircular();
                break;
        }
        
        // Draw particles if enabled
        if (this.options.showParticles) {
            this.updateParticles();
            this.drawParticles();
        }
    }

    drawBars() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        const barCount = Math.floor(width / (this.options.barWidth + this.options.barGap));
        const step = Math.floor(this.bufferLength / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = i * step;
            const barHeight = (this.dataArray[dataIndex] / 255) * height * 0.8;
            const x = i * (this.options.barWidth + this.options.barGap);
            const y = height - barHeight;
            
            // Create gradient for bars
            const gradient = this.ctx.createLinearGradient(x, y, x, height);
            gradient.addColorStop(0, this.options.barColor);
            gradient.addColorStop(0.5, this.options.waveformColor);
            gradient.addColorStop(1, 'rgba(255, 0, 51, 0.2)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, this.options.barWidth, barHeight);
            
            // Mirror effect
            if (this.options.mirrorWave) {
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.fillRect(x, y - 5, this.options.barWidth, -barHeight * 0.3);
            }
            
            // Add glow effect for loud frequencies
            if (this.dataArray[dataIndex] > 200) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = this.options.barColor;
                this.ctx.fillRect(x, y, this.options.barWidth, barHeight);
                this.ctx.shadowBlur = 0;
                
                // Create particle on beat
                if (Math.random() > 0.8) {
                    this.createParticle(x + this.options.barWidth / 2, y);
                }
            }
        }
    }

    drawWaveform() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        const sliceWidth = width / this.bufferLength;
        
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.options.waveformColor;
        this.ctx.beginPath();
        
        let x = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * height / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Add glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.options.waveformColor;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawCircular() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.3;
        
        const barCount = 64;
        const step = Math.floor(this.bufferLength / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = i * step;
            const barHeight = (this.dataArray[dataIndex] / 255) * radius;
            const angle = (i / barCount) * Math.PI * 2;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);
            
            // Create gradient for lines
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, 'rgba(255, 0, 51, 0.5)');
            gradient.addColorStop(1, this.options.barColor);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // Inner circle
            if (i === 0) {
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
    }

    createParticle(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            life: 1,
            size: Math.random() * 3 + 1,
            color: Math.random() > 0.5 ? this.options.barColor : this.options.waveformColor
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Gravity
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow effect
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        this.ctx.globalAlpha = 1;
    }

    setVisualizationMode(mode) {
        if (['bars', 'waveform', 'circular'].includes(mode)) {
            this.visualizationMode = mode;
        }
    }

    startFakeVisualization() {
        // Fallback visualization when we can't access actual audio data
        let time = 0;
        
        const fakeAnimate = () => {
            this.animationId = requestAnimationFrame(fakeAnimate);
            
            // Generate fake frequency data
            for (let i = 0; i < this.bufferLength; i++) {
                this.dataArray[i] = Math.sin(time * 0.01 + i * 0.1) * 127 + 
                                   Math.random() * 50 + 
                                   Math.sin(time * 0.003) * 30;
            }
            
            time++;
            
            // Use the same drawing methods
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            switch (this.visualizationMode) {
                case 'bars':
                    this.drawBars();
                    break;
                case 'waveform':
                    this.drawWaveform();
                    break;
                case 'circular':
                    this.drawCircular();
                    break;
            }
            
            if (this.options.showParticles) {
                this.updateParticles();
                this.drawParticles();
            }
        };
        
        fakeAnimate();
    }

    attachToElement(element) {
        if (element && element.appendChild) {
            element.appendChild(this.canvas);
            this.resize();
        }
    }

    destroy() {
        this.stop();
        if (this.source) {
            this.source.disconnect();
        }
        if (this.analyser) {
            this.analyser.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export for use
window.AudioVisualizer = AudioVisualizer;

// Auto-initialize for SoundCloud widgets on page
document.addEventListener('DOMContentLoaded', () => {
    // Find SoundCloud iframes
    const scIframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
    
    scIframes.forEach(iframe => {
        // Create visualizer container
        const vizContainer = document.createElement('div');
        vizContainer.className = 'audio-visualizer-container';
        vizContainer.style.marginTop = '10px';
        
        // Insert after iframe
        iframe.parentNode.insertBefore(vizContainer, iframe.nextSibling);
        
        // Create visualizer
        const visualizer = new AudioVisualizer({
            barColor: '#ff0033',
            waveformColor: '#00ffff',
            showParticles: true
        });
        
        visualizer.attachToElement(vizContainer);
        
        // Try to connect to SoundCloud widget
        if (window.SC && window.SC.Widget) {
            const widget = SC.Widget(iframe);
            visualizer.connectSoundCloudWidget(widget);
        } else {
            // If SC.Widget is not available, start fake visualization
            visualizer.startFakeVisualization();
        }
        
        // Add mode switcher
        const controls = document.createElement('div');
        controls.className = 'visualizer-controls';
        controls.style.marginTop = '10px';
        controls.style.textAlign = 'center';
        
        ['bars', 'waveform', 'circular'].forEach(mode => {
            const button = document.createElement('button');
            button.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
            button.className = 'viz-mode-btn';
            button.style.margin = '0 5px';
            button.style.padding = '5px 15px';
            button.style.background = 'rgba(255, 0, 51, 0.2)';
            button.style.border = '1px solid #ff0033';
            button.style.color = '#fff';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            
            button.addEventListener('click', () => {
                visualizer.setVisualizationMode(mode);
                // Update button styles
                controls.querySelectorAll('.viz-mode-btn').forEach(btn => {
                    btn.style.background = 'rgba(255, 0, 51, 0.2)';
                });
                button.style.background = '#ff0033';
            });
            
            controls.appendChild(button);
        });
        
        vizContainer.appendChild(controls);
    });
});
