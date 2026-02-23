export const getQueryParam = (name) => new URLSearchParams(location.search).get(name);
export const navigate = (path) => { location.href = path; };
export const markActiveNav = () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
};
