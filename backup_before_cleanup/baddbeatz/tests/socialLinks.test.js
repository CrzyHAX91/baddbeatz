import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('contact page has updated social links', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'contact.html'), 'utf8');
  expect(html).toContain('https://www.instagram.com/tbg_thebadguy.official/');
  expect(html).toContain('https://www.youtube.com/@TheBadGuyHimself');
  expect(html).toContain('https://soundcloud.com/thebadguyhimself');
});

test('music page embeds the SoundCloud playlist', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'music.html'), 'utf8');
  expect(html).toContain('https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/2019398421');
});

test('index page contains responsive viewport meta tag', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'index.html'), 'utf8');
  expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
});

