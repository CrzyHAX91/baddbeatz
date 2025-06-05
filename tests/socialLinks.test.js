const fs = require('fs');
const path = require('path');

test('contact page has updated social links', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'contact.html'), 'utf8');
  expect(html).toContain('https://www.instagram.com/tbg_thebadguy.official/');
  expect(html).toContain('https://www.youtube.com/@TheBadGuyHimself');
  expect(html).toContain('https://soundcloud.com/thebadguyhimself');
});

test('music page embeds the SoundCloud playlist', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'music.html'), 'utf8');
  expect(html).toContain('https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/2019398421');
});
