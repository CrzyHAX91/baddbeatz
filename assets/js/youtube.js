async function loadYoutubeVideos() {
  const list = document.getElementById('youtubeVideos');
  if (!list) return;
  try {
    const channelId = list.dataset.channelId || 'UC_x5XG1OV2P6uZZ5FSM9Ttw';
    const res = await fetch(`/api/youtube?channel_id=${encodeURIComponent(channelId)}`);
    const data = await res.json();
    list.innerHTML = '';
    (data.videos || []).forEach(v => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `https://www.youtube.com/watch?v=${v.id}`;
      a.textContent = v.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch (err) {
    list.textContent = 'Failed to load videos.';
  }
}

document.addEventListener('DOMContentLoaded', loadYoutubeVideos);
