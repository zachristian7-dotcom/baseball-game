import { requireAuth, getCurrentUser } from './auth.js';
import { saveUser } from './database.js';

export function initNotificationsPage() {
  if (!requireAuth()) return;
  const list = document.getElementById('notification-list');
  const clearBtn = document.getElementById('clear-notifications');
  const user = getCurrentUser();
  const render = ()=>{ list.innerHTML = (user.notifications||[]).map((n,i)=>`<li class="card p-8">${n.text || n}<button data-i="${i}" class="btn mt-8">Mark read</button></li>`).join('') || '<p>No notifications.</p>'; };
  list.addEventListener('click', (e)=>{
    const idx = e.target.dataset.i;
    if (idx === undefined) return;
    user.notifications.splice(Number(idx),1);
    saveUser(user); render();
  });
  clearBtn?.addEventListener('click', ()=>{ user.notifications=[]; saveUser(user); render(); });
  render();
}
