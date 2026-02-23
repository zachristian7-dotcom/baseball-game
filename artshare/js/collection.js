import { requireAuth, getCurrentUser } from './auth.js';
import { getContentById } from './database.js';

export function initCollectionPage() {
  if (!requireAuth()) return;
  const grid = document.getElementById('collection-grid');
  const user = getCurrentUser();
  const posts = (user.savedPosts || []).map(getContentById).filter(Boolean);
  grid.innerHTML = posts.map(p=>`<article class="card"><a href="watch.html?id=${p.id}"><img class="thumb" loading="lazy" src="${p.poster||p.url}" alt="${p.title}"></a><div class="card-body"><h3>${p.title}</h3></div></article>`).join('') || '<p>No saved posts.</p>';
}
