import { markActiveNav } from './router.js';
import { getCurrentUser, logoutUser } from './auth.js';

export function initApp() {
  markActiveNav();
  const user = getCurrentUser();
  const menu = document.querySelector('.profile-menu');
  if (menu) {
    menu.innerHTML = user ? `<span class="meta">@${user.username}</span> <button id="logout-btn" class="btn">Logout</button>` : '<a class="btn" href="login.html">Login</a>';
    document.getElementById('logout-btn')?.addEventListener('click', ()=>{ logoutUser(); location.href='index.html'; });
  }
  document.querySelectorAll('.search-form').forEach(form=>{
    form.innerHTML = '<label class="hidden" for="global-search">Search</label><input id="global-search" name="q" placeholder="Search art or artist" aria-label="Search">';
    form.addEventListener('submit', (e)=>{e.preventDefault(); const q=form.querySelector('input').value.trim(); if(q) location.href=`search.html?q=${encodeURIComponent(q)}`;});
  });
}
