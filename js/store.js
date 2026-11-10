// store.js — dane aplikacji i trwały zapis na urządzeniu (IndexedDB + kopia w localStorage)
const DBN = 'silownia-db', ST = 'kv';
let dbp;
function db() {
  return dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open(DBN, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(ST);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(ST, mode); const rq = fn(t.objectStore(ST));
    t.oncomplete = () => res(rq && rq.result); t.onerror = t.onabort = () => rej(t.error);
  });
}
export const kv = {
  get: k => tx('readonly', s => s.get(k)),
  set: (k, v) => tx('readwrite', s => s.put(v, k)),
  del: k => tx('readwrite', s => s.delete(k)),
  keys: () => tx('readonly', s => s.getAllKeys()),
};

export let S = null;
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const iso = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
export const addDays = (isoDate, n) => { const d = new Date(isoDate + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
export const dow = isoDate => (new Date(isoDate + 'T12:00').getDay() + 6) % 7; // 0 = poniedziałek
export const exKey = name => String(name || '').trim().toLowerCase();
export const ACCENTS = { blekit: '#4C8DFF', koral: '#FF6B5E', fiolet: '#9B7BFF', bursztyn: '#F5A524', mieta: '#2FCB9A' };

const blank = () => ({ v: 1, profiles: [], activeId: null, data: {}, settings: { theme: 'auto', sound: true, lastBackup: 0, created: Date.now() } });

export function newProfileData(withSample) {
  return { plan: { days: [] }, sessions: [], tracker: {}, goals: { water: 2500, kcal: 2500, protein: 140, sleep: 8 }, active: null };
}
export const P = () => S.data[S.activeId];
export const profile = () => S.profiles.find(p => p.id === S.activeId);

export async function load() {
  let s = null;
  try { s = await kv.get('state'); } catch (e) {}
  if (!s) { try { s = JSON.parse(localStorage.getItem('silownia-state')); } catch (e) {} }
  S = s || blank();
  try { navigator.storage?.persist?.(); } catch (e) {}
  return S;
}
export function replaceState(s) { S = s; save(true); }
let timer;
export function save(now) {
  clearTimeout(timer);
  const w = () => {
    try { localStorage.setItem('silownia-state', JSON.stringify(S)); } catch (e) {}
    kv.set('state', S).catch(() => {});
  };
  now ? w() : (timer = setTimeout(w, 200));
}
addEventListener('visibilitychange', () => { if (document.hidden && S) save(true); });
addEventListener('pagehide', () => { if (S) save(true); });

// ---- zdjęcia ćwiczeń (dwie klatki) ----
const imgCache = {};
export async function getImg(id) {
  if (imgCache[id]) return imgCache[id];
  try { const v = await kv.get('img:' + id); if (v) imgCache[id] = v; return v; } catch (e) { return null; }
}
export const imgNow = id => imgCache[id];
export async function putImg(id, val) { imgCache[id] = val; await kv.set('img:' + id, val); }
export async function allImgs() {
  const out = {};
  try { for (const k of await kv.keys()) if (String(k).startsWith('img:')) out[k.slice(4)] = imgCache[k.slice(4)] = await kv.get(k); } catch (e) {}
  return out;
}

// ---- tracker dnia ----
export function day(date) {
  const t = P().tracker;
  return t[date] ||= { creatine: false, water: 0, kcal: 0, protein: 0, weight: null, sleep: null };
}

// ---- historia ćwiczenia ----
export function history(key) {
  const out = [];
  for (const s of P().sessions) for (const e of s.entries) {
    if (exKey(e.name) !== key || !e.sets.length) continue;
    let top = 0, e1 = 0, vol = 0, reps = 0;
    for (const x of e.sets) { top = Math.max(top, x.w); e1 = Math.max(e1, x.w * (1 + x.r / 30)); vol += x.w * x.r; reps = Math.max(reps, x.r); }
    out.push({ date: s.date, sid: s.id, top, e1: Math.round(e1 * 10) / 10, vol, reps, sets: e.sets });
  }
  return out.sort((a, b) => a.date < b.date ? -1 : 1);
}
export function exerciseKeys() {
  const m = new Map();
  for (const s of P().sessions) for (const e of s.entries) if (e.sets.length) m.set(exKey(e.name), e.name);
  return [...m].map(([key, name]) => ({ key, name }));
}
