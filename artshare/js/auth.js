import { saveUser, getUserByEmail } from './database.js';
const SESSION_KEY = 'artshare_session';

const hash = (value) => btoa(unescape(encodeURIComponent(value))).split('').reverse().join('');

export function registerUser(userObject) {
  const user = {
    ...userObject,
    id: userObject.id || crypto.randomUUID?.() || `u_${Date.now()}`,
    passwordHash: hash(userObject.password),
    createdAt: Date.now(),
    savedPosts: [], notifications: [], followers: [], following: []
  };
  delete user.password;
  saveUser(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
  return user;
}

export function loginUser(email, password) {
  const user = getUserByEmail(email);
  if (!user || user.passwordHash !== hash(password)) return null;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
  return user;
}

export const logoutUser = () => localStorage.removeItem(SESSION_KEY);
export const getCurrentUser = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session?.email) return null;
    return getUserByEmail(session.email);
  } catch { return null; }
};
export const isAuthenticated = () => Boolean(getCurrentUser());
export function requireAuth() {
  if (!isAuthenticated()) {
    location.href = 'login.html?redirect=' + encodeURIComponent(location.pathname.split('/').pop());
    return false;
  }
  return true;
}
