(function() {
  'use strict';

  let playlist = [];
  let current = 0;
  let audio = null;
  let list = null;
  let isPlaying = false;

  // Add track to playlist
  async function addTrack(title, url, art) {
    if (!title || !url) {
      console.error('Title and URL are required');
      return;
    }

    const track = { title, url, art };
    playlist.push(track);
    savePlaylist();
    
    try {
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      renderPlaylist();
      showNotification('Track added successfully!', 'success');
    } catch (error) {
      console.error('Error adding track:', error);
      showNotification('Failed to add track', 'error');
    }
  }

  // Remove track from playlist
  function removeTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    playlist.splice(index, 1);
    savePlaylist();
    
    // Adjust current track index if necessary
    if (current >= index && current > 0) {
      current--;
    }
    
    renderPlaylist();
    showNotification('Track removed', 'info');
  }

  // Play specific track
  function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    current = index;
    const track = playlist[index];
    
    if (audio && track) {
      audio.src = track.url;
      audio.play().catch(error => {
        console.error('Error playing track:', error);
        showNotification('Failed to play track', 'error');
      });
      
      isPlaying = true;
      updatePlaylistUI();
      updatePlayerControls();
    }
  }

  // Update playlist UI
  function updatePlaylistUI() {
    if (!list) return;
    
    Array.from(list.children).forEach((li, i) => {
      li.classList.toggle('active', i === current);
    });
  }

  // Update player controls
  function updatePlayerControls() {
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (playBtn) {
      playBtn.textContent = isPlaying ? 'Pause' : 'Play';
    }
    
    if (prevBtn) {
      prevBtn.disabled = playlist.length === 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = playlist.length === 0;
    }
  }

  // Render playlist
  function renderPlaylist() {
    if (!list) return;
    
    list.innerHTML = '';
    
    if (playlist.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = 'No tracks in playlist';
      emptyMessage.className = 'empty-message';
      list.appendChild(emptyMessage);
      return;
    }
    
    playlist.forEach((track, i) => {
      const li = document.createElement('li');
      li.className = 'playlist-item';
      
      // Album art
      const img = document.createElement('img');
      img.src = track.art || 'assets/images/placeholder/dj-profile.jpg';
      img.alt = track.title;
      img.className = 'album-art';
      img.onerror = () => {
        img.src = 'assets/images/placeholder/dj-profile.jpg';
      };
      li.appendChild(img);
      
      // Track info
      const trackInfo = document.createElement('div');
      trackInfo.className = 'track-info';
      
      const title = document.createElement('span');
      title.textContent = track.title;
      title.className = 'track-title';
      trackInfo.appendChild(title);
      
      const url = document.createElement('span');
      url.textContent = track.url;
      url.className = 'track-url';
      trackInfo.appendChild(url);
      
      li.appendChild(trackInfo);
      
      // Play button
      const playBtn = document.createElement('button');
      playBtn.textContent = '▶';
      playBtn.className = 'play-btn';
      playBtn.onclick = (e) => {
        e.stopPropagation();
        playTrack(i);
      };
      li.appendChild(playBtn);
      
      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✕';
      removeBtn.className = 'remove-btn';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Remove this track from playlist?')) {
          removeTrack(i);
        }
      };
      li.appendChild(removeBtn);
      
      list.appendChild(li);
    });
    
    updatePlaylistUI();
  }

  // Save playlist to localStorage
  function savePlaylist() {
    try {
      localStorage.setItem('dj-playlist', JSON.stringify(playlist));
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  }

  // Load playlist from localStorage
  async function loadPlaylist() {
    try {
      // Try to load from localStorage first
      const saved = localStorage.getItem('dj-playlist');
      if (saved) {
        return JSON.parse(saved);
      }
      
      // Fallback to server
      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        return data.tracks || [];
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
    
    return [];
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  // Create player controls
  function createPlayer(tracks) {
    playlist = tracks;
    
    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        const nextIndex = (current + 1) % playlist.length;
        playTrack(nextIndex);
      };
    }

    // Previous button
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
      prevBtn.onclick = () => {
        const prevIndex = (current - 1 + playlist.length) % playlist.length;
        playTrack(prevIndex);
      };
    }

    // Play/Pause button
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.onclick = () => {
        if (audio) {
          if (isPlaying) {
            audio.pause();
          } else {
            if (playlist.length > 0) {
              playTrack(current);
            }
          }
        }
      };
    }

    // Audio event listeners
    if (audio) {
      audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayerControls();
      });
      
      audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayerControls();
      });
      
      audio.addEventListener('ended', () => {
        const nextIndex = (current + 1) % playlist.length;
        if (nextIndex !== current) {
          playTrack(nextIndex);
        } else {
          isPlaying = false;
          updatePlayerControls();
        }
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        showNotification('Error playing audio', 'error');
        isPlaying = false;
        updatePlayerControls();
      });
    }

    renderPlaylist();
    updatePlayerControls();
    
    if (playlist.length > 0) {
      // Don't auto-play, just load the first track
      if (audio) {
        audio.src = playlist[0].url;
      }
    }
  }

  // Initialize player
  async function initPlayer() {
    audio = document.getElementById('audioPlayer');
    list = document.getElementById('playlist');
    
    if (!audio || !list) {
      console.warn('Player elements not found');
      return;
    }
    
    try {
      const tracks = await loadPlaylist();
      createPlayer(tracks);
    } catch (error) {
      console.error('Error initializing player:', error);
      showNotification('Failed to initialize player', 'error');
    }
  }

  // Export functions to global scope
  window.addTrack = addTrack;
  window.removeTrack = removeTrack;
  window.savePlaylist = savePlaylist;
  window.loadPlaylist = loadPlaylist;

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', initPlayer);

})();
