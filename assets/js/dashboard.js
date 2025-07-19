// Dashboard JavaScript - BaddBeatz Community
class BaddBeatzDashboard {
    constructor() {
        this.currentUser = this.loadUserSession();
        this.currentSection = 'overview';
        this.uploadQueue = [];
        
        this.initializeEventListeners();
        this.initializeUserInterface();
        this.loadUserData();
    }

    initializeEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // User menu toggle
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuToggle && userDropdown) {
            userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
        }

        // File upload functionality
        this.initializeUploadSystem();

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Avatar upload
        const avatarChangeBtn = document.querySelector('.avatar-change-btn');
        const avatarInput = document.getElementById('avatarInput');
        
        if (avatarChangeBtn && avatarInput) {
            avatarChangeBtn.addEventListener('click', () => avatarInput.click());
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // Search and filter functionality
        this.initializeSearchAndFilter();
    }

    initializeUploadSystem() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const trackDetailsForm = document.getElementById('trackDetailsForm');

        if (uploadArea && fileInput) {
            // Click to upload
            uploadArea.addEventListener('click', () => fileInput.click());

            // File input change
            fileInput.addEventListener('change', (e) => this.handleFileSelection(e.target.files));

            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFileSelection(e.dataTransfer.files);
            });
        }

        // Track details form submission
        if (trackDetailsForm) {
            trackDetailsForm.addEventListener('submit', (e) => this.handleTrackUpload(e));
        }
    }

    initializeSearchAndFilter() {
        const trackSearch = document.getElementById('trackSearch');
        const genreFilter = document.getElementById('genreFilter');
        const sortBy = document.getElementById('sortBy');

        if (trackSearch) {
            trackSearch.addEventListener('input', (e) => this.filterTracks(e.target.value));
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', (e) => this.filterByGenre(e.target.value));
        }

        if (sortBy) {
            sortBy.addEventListener('change', (e) => this.sortTracks(e.target.value));
        }
    }

    initializeUserInterface() {
        // Check if user is logged in
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Update user display
        this.updateUserDisplay();
        
        // Load initial section
        this.switchSection('overview');
    }

    loadUserSession() {
        const userData = localStorage.getItem('baddbeatz_user');
        return userData ? JSON.parse(userData) : null;
    }

    updateUserDisplay() {
        const userDisplayName = document.getElementById('userDisplayName');
        const userAvatarImg = document.getElementById('userAvatarImg');
        const welcomeUserName = document.getElementById('welcomeUserName');
        const userRole = document.getElementById('userRole');

        if (this.currentUser) {
            if (userDisplayName) {
                userDisplayName.textContent = this.currentUser.artistName || this.currentUser.email;
            }
            
            if (userAvatarImg) {
                userAvatarImg.src = this.currentUser.avatar || 'assets/images/default-avatar.png';
            }
            
            if (welcomeUserName) {
                welcomeUserName.textContent = this.currentUser.artistName || 'Artist';
            }
            
            if (userRole) {
                userRole.textContent = this.currentUser.role || 'Member';
            }
        }
    }

    loadUserData() {
        // Load user statistics and data
        this.loadStatistics();
        this.loadRecentActivity();
        this.loadUserTracks();
    }

    loadStatistics() {
        // Simulate loading user statistics
        const stats = {
            totalPlays: Math.floor(Math.random() * 5000) + 500,
            totalTracks: Math.floor(Math.random() * 20) + 3,
            totalFollowers: Math.floor(Math.random() * 500) + 50,
            totalLikes: Math.floor(Math.random() * 1000) + 100
        };

        // Update stat displays
        const totalPlaysEl = document.getElementById('totalPlays');
        const totalTracksEl = document.getElementById('totalTracks');
        const totalFollowersEl = document.getElementById('totalFollowers');
        const totalLikesEl = document.getElementById('totalLikes');

        if (totalPlaysEl) totalPlaysEl.textContent = stats.totalPlays.toLocaleString();
        if (totalTracksEl) totalTracksEl.textContent = stats.totalTracks;
        if (totalFollowersEl) totalFollowersEl.textContent = stats.totalFollowers;
        if (totalLikesEl) totalLikesEl.textContent = stats.totalLikes;
    }

    loadRecentActivity() {
        // This would typically load from an API
        const activities = [
            {
                icon: '🎵',
                content: 'New track uploaded: "Underground Vibes Mix"',
                time: '2 hours ago'
            },
            {
                icon: '❤️',
                content: 'Your track got 15 new likes: "Techno Madness"',
                time: '1 day ago'
            },
            {
                icon: '👤',
                content: 'New follower: DJ_ElectroBeats started following you',
                time: '2 days ago'
            }
        ];

        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <p><strong>${activity.content}</strong></p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    loadUserTracks() {
        // Sample tracks data
        const tracks = [
            {
                id: 1,
                title: 'Underground Vibes Mix',
                genre: 'Techno',
                plays: 234,
                likes: 18,
                artwork: 'assets/images/default-track.png'
            },
            {
                id: 2,
                title: 'Techno Madness',
                genre: 'Techno',
                plays: 456,
                likes: 32,
                artwork: 'assets/images/default-track.png'
            },
            {
                id: 3,
                title: 'Dark Energy',
                genre: 'Hardstyle',
                plays: 189,
                likes: 15,
                artwork: 'assets/images/default-track.png'
            }
        ];

        this.renderTracks(tracks);
    }

    renderTracks(tracks) {
        const tracksGrid = document.getElementById('tracksGrid');
        if (!tracksGrid) return;

        tracksGrid.innerHTML = tracks.map(track => `
            <div class="track-card" data-track-id="${track.id}">
                <div class="track-artwork">
                    <img src="${track.artwork}" alt="${track.title} Artwork">
                    <div class="track-overlay">
                        <button class="play-btn" onclick="playTrack(${track.id})">▶️</button>
                    </div>
                </div>
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p class="track-genre">${track.genre}</p>
                    <div class="track-stats">
                        <span>👁️ ${track.plays} plays</span>
                        <span>❤️ ${track.likes} likes</span>
                    </div>
                </div>
                <div class="track-actions">
                    <button class="action-btn" title="Edit" onclick="editTrack(${track.id})">✏️</button>
                    <button class="action-btn" title="Share" onclick="shareTrack(${track.id})">🔗</button>
                    <button class="action-btn" title="Delete" onclick="deleteTrack(${track.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    switchSection(sectionName) {
        if (!sectionName) return;

        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionName);
        });

        // Show/hide content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.toggle('active', section.id === sectionName);
        });

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'overview':
                this.loadStatistics();
                this.loadRecentActivity();
                break;
            case 'my-music':
                this.loadUserTracks();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'community':
                this.loadCommunityData();
                break;
        }
    }

    loadAnalytics() {
        // Placeholder for analytics data loading
        console.log('Loading analytics data...');
    }

    loadCommunityData() {
        // Placeholder for community data loading
        console.log('Loading community data...');
    }

    handleFileSelection(files) {
        const validFiles = Array.from(files).filter(file => {
            const validTypes = ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/mpeg'];
            const maxSize = 50 * 1024 * 1024; // 50MB
            
            if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac)$/i)) {
                this.showMessage(`${file.name} is not a supported audio format`, 'error');
                return false;
            }
            
            if (file.size > maxSize) {
                this.showMessage(`${file.name} is too large (max 50MB)`, 'error');
                return false;
            }
            
            return true;
        });

        if (validFiles.length > 0) {
            this.uploadQueue = validFiles;
            this.showUploadForm();
        }
    }

    showUploadForm() {
        const trackDetailsForm = document.getElementById('trackDetailsForm');
        const uploadQueue = document.getElementById('uploadQueue');
        const queueList = document.getElementById('queueList');

        if (trackDetailsForm) {
            trackDetailsForm.style.display = 'block';
        }

        if (uploadQueue && queueList) {
            uploadQueue.style.display = 'block';
            queueList.innerHTML = this.uploadQueue.map(file => `
                <div class="queue-item">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                </div>
            `).join('');
        }

        // Pre-fill form if single file
        if (this.uploadQueue.length === 1) {
            const fileName = this.uploadQueue[0].name;
            const trackTitle = document.getElementById('trackTitle');
            if (trackTitle) {
                trackTitle.value = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
            }
        }
    }

    async handleTrackUpload(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const trackData = {
            title: formData.get('trackTitle'),
            genre: formData.get('trackGenre'),
            description: formData.get('trackDescription'),
            tags: formData.get('trackTags'),
            bpm: formData.get('trackBPM'),
            allowDownload: document.getElementById('allowDownload').checked,
            featuredTrack: document.getElementById('featuredTrack').checked
        };

        // Validate required fields
        if (!trackData.title || !trackData.genre) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Show upload modal
        this.showUploadModal();

        try {
            // Simulate upload process
            await this.uploadFiles(this.uploadQueue, trackData);
            
            this.showMessage('Track uploaded successfully! 🎵', 'success');
            this.hideUploadModal();
            this.resetUploadForm();
            
            // Refresh tracks list
            this.loadUserTracks();
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage('Upload failed. Please try again.', 'error');
            this.hideUploadModal();
        }
    }

    async uploadFiles(files, trackData) {
        const modal = document.getElementById('uploadModal');
        const progressFill = document.getElementById('uploadProgress');
        const uploadStatus = document.getElementById('uploadStatus');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Update status
            if (uploadStatus) {
                uploadStatus.textContent = `Uploading ${file.name}...`;
            }

            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 10) {
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        // Final processing
        if (uploadStatus) {
            uploadStatus.textContent = 'Processing track...';
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    showUploadModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideUploadModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetUploadForm() {
        const trackDetailsForm = document.getElementById('trackDetailsForm');
        const uploadQueue = document.getElementById('uploadQueue');
        
        if (trackDetailsForm) {
            trackDetailsForm.style.display = 'none';
            trackDetailsForm.reset();
        }
        
        if (uploadQueue) {
            uploadQueue.style.display = 'none';
        }
        
        this.uploadQueue = [];
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            artistName: formData.get('artistName'),
            bio: formData.get('bio'),
            genre: formData.get('genre'),
            location: formData.get('location'),
            soundcloudUrl: formData.get('soundcloudUrl'),
            spotifyUrl: formData.get('spotifyUrl'),
            youtubeUrl: formData.get('youtubeUrl')
        };

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update current user data
            this.currentUser = { ...this.currentUser, ...profileData };
            localStorage.setItem('baddbeatz_user', JSON.stringify(this.currentUser));
            
            this.updateUserDisplay();
            this.showMessage('Profile updated successfully! 💾', 'success');
            
        } catch (error) {
            console.error('Profile update error:', error);
            this.showMessage('Failed to update profile. Please try again.', 'error');
        }
    }

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select a valid image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const profileAvatar = document.getElementById('profileAvatar');
            const userAvatarImg = document.getElementById('userAvatarImg');
            
            if (profileAvatar) {
                profileAvatar.src = e.target.result;
            }
            
            if (userAvatarImg) {
                userAvatarImg.src = e.target.result;
            }
            
            // Update user data
            this.currentUser.avatar = e.target.result;
            localStorage.setItem('baddbeatz_user', JSON.stringify(this.currentUser));
            
            this.showMessage('Avatar updated! 📷', 'success');
        };
        
        reader.readAsDataURL(file);
    }

    filterTracks(searchTerm) {
        const trackCards = document.querySelectorAll('.track-card');
        
        trackCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const genre = card.querySelector('.track-genre').textContent.toLowerCase();
            
            const matches = title.includes(searchTerm.toLowerCase()) || 
                          genre.includes(searchTerm.toLowerCase());
            
            card.style.display = matches ? 'block' : 'none';
        });
    }

    filterByGenre(genre) {
        const trackCards = document.querySelectorAll('.track-card');
        
        trackCards.forEach(card => {
            const trackGenre = card.querySelector('.track-genre').textContent.toLowerCase();
            
            const matches = !genre || trackGenre === genre.toLowerCase();
            card.style.display = matches ? 'block' : 'none';
        });
    }

    sortTracks(sortBy) {
        const tracksGrid = document.getElementById('tracksGrid');
        const trackCards = Array.from(document.querySelectorAll('.track-card'));
        
        trackCards.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
                case 'most-played':
                    const playsA = parseInt(a.querySelector('.track-stats span').textContent.match(/\d+/)[0]);
                    const playsB = parseInt(b.querySelector('.track-stats span').textContent.match(/\d+/)[0]);
                    return playsB - playsA;
                case 'oldest':
                    return parseInt(a.dataset.trackId) - parseInt(b.dataset.trackId);
                case 'newest':
                default:
                    return parseInt(b.dataset.trackId) - parseInt(a.dataset.trackId);
            }
        });
        
        // Re-append sorted cards
        trackCards.forEach(card => tracksGrid.appendChild(card));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: #fff;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        // Set background based on type
        switch (type) {
            case 'success':
                messageEl.style.background = 'linear-gradient(45deg, #00ff88, #00ffff)';
                messageEl.style.color = '#000';
                break;
            case 'error':
                messageEl.style.background = 'linear-gradient(45deg, #ff4444, #ff0096)';
                break;
            default:
                messageEl.style.background = 'linear-gradient(45deg, #0088ff, #00ffff)';
                messageEl.style.color = '#000';
        }

        document.body.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }
}

// Global functions for track actions
function playTrack(trackId) {
    console.log('Playing track:', trackId);
    // Implement track playback
}

function editTrack(trackId) {
    console.log('Editing track:', trackId);
    // Implement track editing
}

function shareTrack(trackId) {
    console.log('Sharing track:', trackId);
    // Implement track sharing
    navigator.clipboard.writeText(`${window.location.origin}/track/${trackId}`);
    dashboard.showMessage('Track link copied to clipboard! 🔗', 'success');
}

function deleteTrack(trackId) {
    if (confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
        console.log('Deleting track:', trackId);
        // Implement track deletion
        dashboard.showMessage('Track deleted successfully', 'info');
        dashboard.loadUserTracks();
    }
}

function cancelUpload() {
    dashboard.resetUploadForm();
}

function showSection(sectionName) {
    dashboard.switchSection(sectionName);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('baddbeatz_user');
        localStorage.removeItem('baddbeatz_login_time');
        window.location.href = 'login.html';
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new BaddBeatzDashboard();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaddBeatzDashboard;
}
