import { getQueryParam } from './router.js';
import { addComment, getContentById, incrementLike } from './database.js';
import { getCurrentUser, isAuthenticated } from './auth.js';
import { toggleSave } from './interactions.js';

export function initWatchPage() {
  const id = getQueryParam('id');
  const root = document.getElementById('watch-root');
  if (!id) { root.innerHTML = '<p>Missing content id.</p>'; return; }
  const item = getContentById(id);
  if (!item) { root.innerHTML = '<p>Content not found.</p>'; return; }

  root.innerHTML = `
    <article class="card p-16">
      ${item.type === 'video' ? `<video controls src="${item.url}" poster="${item.poster || ''}"></video>` : `<img src="${item.url}" alt="${item.title}">`}
      <h1 class="mt-16">${item.title}</h1>
      <p>${item.description || ''}</p>
      <p class="meta mt-8">Artist: <a href="channel.html?user=${item.artist.username}">@${item.artist.displayName || item.artist.username}</a></p>
      <div id="interactions" class="mt-16"></div>
      <section class="mt-16"><h2>Comments</h2><div id="comments"></div></section>
    </article>`;

  const comments = document.getElementById('comments');
  const paintComments = () => {
    const updated = getContentById(id);
    comments.innerHTML = (updated.comments || []).map(c => `<p><strong>${c.username}</strong>: ${c.text}</p>`).join('') || '<p>No comments.</p>';
  };
  paintComments();

  const inter = document.getElementById('interactions');
  if (!isAuthenticated()) {
    inter.innerHTML = '<p class="meta">You are viewing as a guest.</p><a class="btn btn-primary mt-8" href="login.html">Login to interact</a>';
    return;
  }
  inter.innerHTML = `
    <div class="flex gap-8">
      <button id="like-btn" class="btn">Like (${item.likes || 0})</button>
      <button id="save-btn" class="btn">Save</button>
    </div>
    <form id="comment-form" class="mt-8">
      <label for="comment-text">Add comment</label>
      <input id="comment-text" required maxlength="300" />
      <button class="btn btn-primary mt-8" type="submit">Post</button>
    </form>`;

  document.getElementById('like-btn').addEventListener('click', () => {
    const updated = incrementLike(id);
    if (updated) document.getElementById('like-btn').textContent = `Like (${updated.likes})`;
  });
  document.getElementById('save-btn').addEventListener('click', (e) => {
    e.target.textContent = toggleSave(id) ? 'Saved' : 'Save';
  });
  document.getElementById('comment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('comment-text').value.trim();
    if (!text) return;
    const user = getCurrentUser();
    addComment(id, { id: `c_${Date.now()}`, username: user.username, text, timestamp: Date.now() });
    e.target.reset();
    paintComments();
  });
}
