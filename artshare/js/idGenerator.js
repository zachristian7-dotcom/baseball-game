import { getAllContent } from './database.js';
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function generateUniqueContentID() {
  const existing = new Set(getAllContent().map(c => c.id));
  let id = '';
  do {
    id = Array.from({ length: 10 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  } while (existing.has(id));
  return id;
}
