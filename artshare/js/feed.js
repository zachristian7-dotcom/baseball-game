import { getAllContent } from './database.js';

export function renderFeed(container, { sort = 'newest', type = 'all' } = {}) {
  let items = getAllContent();
  items = items.sort((a,b)=> sort==='likes' ? (b.likes-a.likes) : (b.createdAt-a.createdAt));
  if (type !== 'all') items = items.filter(i => i.type === type);
  container.innerHTML = items.map(item => `
    <article class="card">
      <a href="watch.html?id=${item.id}">
        <img class="thumb" loading="lazy" src="${item.poster || item.url}" alt="${item.title}">
      </a>
      <div class="card-body">
        <h3>${item.title}</h3>
        <p class="meta">by <a href="channel.html?user=${item.artist.username}">@${item.artist.displayName || item.artist.username}</a></p>
        <p class="meta">❤ ${item.likes || 0} · 💬 ${(item.comments || []).length}</p>
      </div>
    </article>`).join('') || '<p>No artwork yet.</p>';
}
