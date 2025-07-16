/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('Premium Chatroom Forum UI', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header>Premium Chatroom Forum</header>
      <section id="forum-list" aria-label="Available forums" role="list"></section>
      <section id="chat-container" aria-live="polite">
        <div id="messages" role="log" aria-live="polite" aria-relevant="additions"></div>
        <form id="message-form" aria-label="Send message">
          <input type="text" id="message-input" placeholder="Type your message..." autocomplete="off" required />
          <button type="submit" id="send-button">Send</button>
        </form>
        <div id="error-message" role="alert" aria-live="assertive"></div>
      </section>
    `;

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
    Storage.prototype.setItem = jest.fn(() => {});

    // Mock fetch
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    }));
  });

  afterEach(() => {
    if (global.fetch && global.fetch.mockClear) {
      global.fetch.mockClear();
    }
    jest.restoreAllMocks();
  });

  test('shows error if not logged in', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    const errorMessageEl = document.getElementById('error-message');
    const forumListEl = document.getElementById('forum-list');
    const messagesEl = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');

    // Simulate checkLogin function
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      errorMessageEl.textContent = 'You must be logged in to join the forum. Please login first.';
      forumListEl.innerHTML = '';
      messagesEl.innerHTML = '';
      messageForm.style.display = 'none';
    }

    expect(errorMessageEl.textContent).toBe('You must be logged in to join the forum. Please login first.');
    expect(forumListEl.innerHTML).toBe('');
    expect(messagesEl.innerHTML).toBe('');
    expect(messageForm.style.display).toBe('none');
  });

  test('fetches and renders forums', async () => {
    const forums = [
      { id: 1, name: 'General', premium_only: false },
      { id: 2, name: 'Premium Lounge', premium_only: true }
    ];
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ forums }),
    }));

    // Call fetchForums function
    const fetchForums = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;
      const res = await fetch('/api/forums', {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      if (!res.ok) throw new Error('Failed to fetch forums');
      const data = await res.json();
      const forumListEl = document.getElementById('forum-list');
      forumListEl.innerHTML = '';
      data.forums.forEach(forum => {
        const btn = document.createElement('button');
        btn.textContent = forum.name + (forum.premium_only ? ' (Premium)' : '');
        forumListEl.appendChild(btn);
      });
    };

    await fetchForums();

    const forumListEl = document.getElementById('forum-list');
    expect(forumListEl.children.length).toBe(2);
    expect(forumListEl.children[0].textContent).toBe('General');
    expect(forumListEl.children[1].textContent).toBe('Premium Lounge (Premium)');
  });

  test('loads and renders messages', async () => {
    const messages = [
      { id: 1, username: 'user1', content: 'Hello' },
      { id: 2, username: 'user2', content: 'Hi there' }
    ];
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ messages }),
    }));

    const loadMessages = async (forumId) => {
      const authToken = localStorage.getItem('authToken');
      const res = await fetch(`/api/forums/${forumId}/messages`, {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      const messagesEl = document.getElementById('messages');
      messagesEl.innerHTML = '';
      data.messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<span class="username">${msg.username}:</span> ${msg.content}`;
        messagesEl.appendChild(div);
      });
    };

    await loadMessages(1);

    const messagesEl = document.getElementById('messages');
    expect(messagesEl.children.length).toBe(2);
    expect(messagesEl.children[0].textContent).toBe('user1: Hello');
    expect(messagesEl.children[1].textContent).toBe('user2: Hi there');
  });

  test('sends a new message', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 3, forum_id: 1, user_id: 1, content: 'New message' }),
    }));

    const messageInput = document.getElementById('message-input');
    messageInput.value = 'New message';

    const messageForm = document.getElementById('message-form');
    const authToken = localStorage.getItem('authToken');

    const submitEvent = new Event('submit');
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = messageInput.value.trim();
      if (!content) return;
      const res = await fetch(`/api/forums/1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to send message');
      messageInput.value = '';
    });

    messageForm.dispatchEvent(submitEvent);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/forums/1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer ' + authToken
          }),
          body: JSON.stringify({ content: 'New message' })
        })
      );
    });
  });
});
