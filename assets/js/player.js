let playlist = [];
let audio;
let list;
let current = 0;

async function loadPlaylist() {
  const res = await fetch('/api/tracks');
  const data = await res.json();
  playlist = data.tracks || [];
  const stored = JSON.parse(localStorage.getItem('playlist') || '[]');
  playlist = playlist.concat(stored);
  return playlist;
}

function savePlaylist() {
  localStorage.setItem('playlist', JSON.stringify(playlist));
}

async function addTrack(title, url, art) {
  const track = { title, url, art };
  playlist.push(track);
  savePlaylist();
  await fetch('/api/tracks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(track)
  });
  renderPlaylist();
}

function removeTrack(index) {
  playlist.splice(index, 1);
  savePlaylist();
  renderPlaylist();
}

function playTrack(index) {
  current = index;
  audio.src = playlist[index].url;
  audio.play();
  Array.from(list.children).forEach((li, i) => {
    li.classList.toggle('active', i === index);
  });
}

function renderPlaylist() {
  list.innerHTML = '';
  playlist.forEach((track, i) => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = track.art || 'assets/images/placeholder/dj-profile.jpg';
    img.alt = track.title;
    img.className = 'album-art';
    li.appendChild(img);
    const span = document.createElement('span');
    span.textContent = track.title;
    li.appendChild(span);
    li.onclick = () => playTrack(i);
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.className = 'remove-btn';
    btn.onclick = (e) => { e.stopPropagation(); removeTrack(i); };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function createPlayer(tracks) {
  playlist = tracks;
  document.getElementById('nextBtn').onclick = () => {
    playTrack((current + 1) % playlist.length);
  };

  document.getElementById('prevBtn').onclick = () => {
    playTrack((current - 1 + playlist.length) % playlist.length);
  };

  renderPlaylist();
  if (playlist.length) {
    playTrack(0);
  }
}

async function initPlayer() {
  audio = document.getElementById('audioPlayer');
  list = document.getElementById('playlist');
  const tracks = await loadPlaylist();
  createPlayer(tracks);
}

window.addTrack = addTrack;
window.removeTrack = removeTrack;
window.savePlaylist = savePlaylist;

document.addEventListener('DOMContentLoaded', initPlayer);
