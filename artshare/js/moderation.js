import { requireAuth } from './auth.js';
import { getAllContent, deleteContent, updateContent } from './database.js';

export function initModerationPage() {
  if (!requireAuth()) return;
  const gate = document.getElementById('mod-gate');
  const panel = document.getElementById('mod-panel');
  const list = document.getElementById('mod-list');
  const filter = document.getElementById('flag-filter');
  document.getElementById('mod-pass-form')?.addEventListener('submit',(e)=>{
    e.preventDefault();
    if (document.getElementById('mod-pass').value === 'ARTSHARE_MOD') { gate.classList.add('hidden'); panel.classList.remove('hidden'); render(); }
    else alert('Invalid passcode');
  });
  const render = ()=>{
    let items = getAllContent().sort((a,b)=>b.createdAt-a.createdAt);
    if (filter?.checked) items = items.filter(i=>i.flagged);
    list.innerHTML = items.map(i=>`<article class="card p-8"><h3>${i.title}</h3><p class="meta">${i.id}</p><div class="flex gap-8 mt-8"><button class="btn" data-flag="${i.id}">${i.flagged?'Unflag':'Flag'}</button><button class="btn btn-danger" data-del="${i.id}">Delete</button></div></article>`).join('') || '<p>No content.</p>';
  };
  panel?.addEventListener('click',(e)=>{
    if (e.target.dataset.del) { deleteContent(e.target.dataset.del); render(); }
    if (e.target.dataset.flag) { const id=e.target.dataset.flag; const curr=getAllContent().find(x=>x.id===id); updateContent(id,{flagged:!curr.flagged}); render(); }
  });
  filter?.addEventListener('change', render);
}
