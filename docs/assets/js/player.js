function authHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function loadPlaylist() {
  const res = await fetch('/api/tracks', { headers: authHeaders() });
  if (!res.ok) {
    console.error('Failed to load tracks', await res.text());
    return [];
  }
  const data = await res.json();
  return data.tracks || [];
}

async function addTrack(title, url) {
  const res = await fetch('/api/tracks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, url })
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

function createPlayer(tracks) {
  const audio = document.getElementById('audioPlayer');
  const list = document.getElementById('playlist');
  let current = 0;

  function playTrack(index) {
    current = index;
    audio.src = tracks[index].url;
    audio.play();
    Array.from(list.children).forEach((li, i) => {
      li.classList.toggle('active', i === index);
    });
  }

  document.getElementById('nextBtn').onclick = () => {
    playTrack((current + 1) % tracks.length);
  };

  document.getElementById('prevBtn').onclick = () => {
    playTrack((current - 1 + tracks.length) % tracks.length);
  };

  tracks.forEach((track, i) => {
    const li = document.createElement('li');
    li.textContent = track.title;
    li.onclick = () => playTrack(i);
    list.appendChild(li);
  });

  if (tracks.length) {
    playTrack(0);
  }
}

async function initPlayer() {
  const tracks = await loadPlaylist();
  createPlayer(tracks);
}

document.addEventListener('DOMContentLoaded', initPlayer);
