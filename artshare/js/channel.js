import { getQueryParam } from './router.js';
import { getContentByUser, getUserByUsername } from './database.js';

export function initChannelPage() {
  const username = getQueryParam('user');
  const header = document.getElementById('channel-header');
  const grid = document.getElementById('channel-grid');
  if (!username) { header.textContent = 'No user specified'; return; }
  const user = getUserByUsername(username);
  const posts = getContentByUser(username).sort((a,b)=>b.createdAt-a.createdAt);
  header.innerHTML = `<h1>@${username}</h1><p class="meta">${user?.displayName || 'Artist'} · ${posts.length} posts</p>`;
  grid.innerHTML = posts.map(p=>`<article class="card"><a href="watch.html?id=${p.id}"><img class="thumb" loading="lazy" src="${p.poster||p.url}" alt="${p.title}"></a><div class="card-body"><h3>${p.title}</h3></div></article>`).join('') || '<p>No posts.</p>';
}
