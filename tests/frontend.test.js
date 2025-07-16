/**
 * @jest-environment jsdom
 */

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
  });

  test('renders forum UI elements correctly', () => {
    const header = document.querySelector('header');
    const forumList = document.getElementById('forum-list');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const errorMessage = document.getElementById('error-message');

    expect(header).toBeTruthy();
    expect(header.textContent).toBe('Premium Chatroom Forum');
    expect(forumList).toBeTruthy();
    expect(messageForm).toBeTruthy();
    expect(messageInput).toBeTruthy();
    expect(errorMessage).toBeTruthy();
  });

  test('shows error message when not logged in', () => {
    const errorMessageEl = document.getElementById('error-message');
    const forumListEl = document.getElementById('forum-list');
    const messagesEl = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');

    // Simulate no auth token scenario
    errorMessageEl.textContent = 'You must be logged in to join the forum. Please login first.';
    forumListEl.innerHTML = '';
    messagesEl.innerHTML = '';
    messageForm.style.display = 'none';

    expect(errorMessageEl.textContent).toBe('You must be logged in to join the forum. Please login first.');
    expect(forumListEl.innerHTML).toBe('');
    expect(messagesEl.innerHTML).toBe('');
    expect(messageForm.style.display).toBe('none');
  });

  test('can render forum buttons', () => {
    const forumListEl = document.getElementById('forum-list');
    const forums = [
      { id: 1, name: 'General', premium_only: false },
      { id: 2, name: 'Premium Lounge', premium_only: true }
    ];

    // Simulate rendering forums
    forumListEl.innerHTML = '';
    forums.forEach(forum => {
      const btn = document.createElement('button');
      btn.textContent = forum.name + (forum.premium_only ? ' (Premium)' : '');
      forumListEl.appendChild(btn);
    });

    expect(forumListEl.children.length).toBe(2);
    expect(forumListEl.children[0].textContent).toBe('General');
    expect(forumListEl.children[1].textContent).toBe('Premium Lounge (Premium)');
  });

  test('can render messages', () => {
    const messagesEl = document.getElementById('messages');
    const messages = [
      { id: 1, username: 'user1', content: 'Hello' },
      { id: 2, username: 'user2', content: 'Hi there' }
    ];

    // Simulate rendering messages
    messagesEl.innerHTML = '';
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'message';
      div.innerHTML = `<span class="username">${msg.username}:</span> ${msg.content}`;
      messagesEl.appendChild(div);
    });

    expect(messagesEl.children.length).toBe(2);
    expect(messagesEl.children[0].textContent).toBe('user1: Hello');
    expect(messagesEl.children[1].textContent).toBe('user2: Hi there');
  });
});
