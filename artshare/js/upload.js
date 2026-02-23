import { requireAuth, getCurrentUser } from './auth.js';
import { generateUniqueContentID } from './idGenerator.js';
import { addContent } from './database.js';

export function initUploadPage() {
  if (!requireAuth()) return;
  const form = document.getElementById('upload-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const title = fd.get('title')?.toString().trim();
    const url = fd.get('url')?.toString().trim();
    const type = fd.get('type')?.toString();
    const verified = fd.get('aiVerified');
    if (!title || !url || !type || !verified) return alert('Please complete required fields and AI verification.');
    const user = getCurrentUser();
    const item = {
      id: generateUniqueContentID(), type, title,
      description: fd.get('description')?.toString().trim() || '',
      url, poster: fd.get('poster')?.toString().trim() || '',
      artist: { username: user.username, displayName: user.displayName }, likes: 0, comments: [], createdAt: Date.now(), flagged:false
    };
    addContent(item);
    location.href = `watch.html?id=${item.id}`;
  });
}
