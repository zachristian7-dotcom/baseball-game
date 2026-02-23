import { getCurrentUser } from './auth.js';
import { saveUser } from './database.js';

export function toggleSave(contentId) {
  const user = getCurrentUser();
  if (!user) return false;
  const has = user.savedPosts.includes(contentId);
  user.savedPosts = has ? user.savedPosts.filter(id => id !== contentId) : [...user.savedPosts, contentId];
  saveUser(user);
  return !has;
}
