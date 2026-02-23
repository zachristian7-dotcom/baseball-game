import { getQueryParam } from './router.js';
import { searchContent } from './database.js';

const debounce = (fn,ms=250)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};

export function initSearchPage() {
  const q = getQueryParam('q') || '';
  const input = document.getElementById('search-input');
  const out = document.getElementById('search-results');
  if (!input || !out) return;
  input.value = q;
  const run = () => {
    const term = input.value.trim();
    const results = term ? searchContent(term) : [];
    out.innerHTML = results.map(r => `<article class="card"><a href="watch.html?id=${r.id}"><img class="thumb" loading="lazy" src="${r.poster||r.url}" alt="${r.title}"></a><div class="card-body"><h3>${r.title}</h3><p class="meta">@${r.artist.username}</p></div></article>`).join('') || '<p>No results.</p>';
  };
  input.addEventListener('input', debounce(run));
  run();
}
