const CONTENT_KEY = 'artshare_content';
const USERS_KEY = 'artshare_users';

const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getAllContent = () => Object.values(readJSON(CONTENT_KEY, {}));
export const getContentById = (id) => readJSON(CONTENT_KEY, {})[id] || null;
export const getContentByUser = (username) => getAllContent().filter(p => p.artist.username === username);
export const addContent = (contentObject) => {
  const content = readJSON(CONTENT_KEY, {});
  content[contentObject.id] = contentObject;
  writeJSON(CONTENT_KEY, content);
  return contentObject;
};
export const deleteContent = (id) => {
  const content = readJSON(CONTENT_KEY, {});
  delete content[id];
  writeJSON(CONTENT_KEY, content);
};
export const updateContent = (id, updates) => {
  const content = readJSON(CONTENT_KEY, {});
  if (!content[id]) return null;
  content[id] = { ...content[id], ...updates };
  writeJSON(CONTENT_KEY, content);
  return content[id];
};
export const incrementLike = (id) => {
  const item = getContentById(id);
  if (!item) return null;
  return updateContent(id, { likes: (item.likes || 0) + 1 });
};
export const addComment = (id, commentObject) => {
  const item = getContentById(id);
  if (!item) return null;
  item.comments = [...(item.comments || []), commentObject];
  return updateContent(id, { comments: item.comments });
};

export const saveUser = (userObject) => {
  const users = readJSON(USERS_KEY, []);
  const idx = users.findIndex(u => u.username === userObject.username || u.email === userObject.email);
  if (idx >= 0) users[idx] = userObject; else users.push(userObject);
  writeJSON(USERS_KEY, users);
  return userObject;
};
export const getUserByUsername = (username) => readJSON(USERS_KEY, []).find(u => u.username === username) || null;
export const getUserByEmail = (email) => readJSON(USERS_KEY, []).find(u => u.email === email) || null;
export const searchContent = (query) => {
  const q = query.trim().toLowerCase();
  return getAllContent().filter(p => p.title.toLowerCase().includes(q) || p.artist.username.toLowerCase().includes(q));
};
