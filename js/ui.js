// ui.js — drobne narzędzia interfejsu: ikony, arkusze, komunikaty, wykresy
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
export const fmt = n => String(Math.round((+n || 0) * 100) / 100).replace('.', ',');
export const big = n => Math.round(+n || 0).toLocaleString('pl-PL');
export const DOW = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
export const DOW_FULL = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
export const dateLong = d => new Date(d + 'T12:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
export const dateShort = d => new Date(d + 'T12:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
export const clock = ms => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); };

const PATHS = {
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z', plan: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z', chart: 'M4 19V5M4 19h16M8 15l3-4 3 2 4-6', more: 'M5 12h.01M12 12h.01M19 12h.01',
  plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', check: 'M5 12.5l4.5 4.5L19 7.5', back: 'M15 5l-7 7 7 7', chev: 'M9 5l7 7-7 7', x: 'M6 6l12 12M18 6L6 18',
  up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6', trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13', edit: 'M4 20h4L19 9l-4-4L4 16z', play: 'M8 5l11 7-11 7z',
  timer: 'M12 8v5l3 2M9 3h6M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', share: 'M12 15V4M8 8l4-4 4 4M5 13v6h14v-6', image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
};
export const ic = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${n === 'more' ? 3 : 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[n]}"${n === 'play' ? ' fill="currentColor"' : ''}/></svg>`;

// ---- arkusze (wysuwane od dołu) ----
export function openSheet(html, cls = '') {
  const w = document.createElement('div'); w.className = 'sheet-wrap ' + cls;
  w.innerHTML = `<div class="backdrop" data-a="closeSheet"></div><div class="sheet" role="dialog"><div class="grab"></div><div class="sheet-body">${html}</div></div>`;
  $('#sheets').appendChild(w); requestAnimationFrame(() => w.classList.add('on'));
  return w;
}
export function closeSheet(all) {
  const ws = $$('#sheets .sheet-wrap:not(.off)'); const list = all ? ws : ws.slice(-1);
  for (const w of list) { w.classList.add('off'); w.classList.remove('on'); setTimeout(() => w.remove(), 280); }
}
export const sheetBody = () => { const ws = $$('#sheets .sheet-wrap:not(.off) .sheet-body'); return ws[ws.length - 1]; };
let confirmCb = null;
export function confirmSheet(title, text, okLabel, cb, danger = true) {
  confirmCb = cb;
  openSheet(`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><button class="btn ${danger ? 'danger' : 'primary'}" data-a="confirmOk">${esc(okLabel)}</button><button class="btn ghost" data-a="closeSheet">Anuluj</button>`);
}
export function runConfirm() { const cb = confirmCb; confirmCb = null; closeSheet(); cb && cb(); }
let toastT;
export function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }

// ---- wykresy (własne SVG, bez bibliotek) ----
export function chart(pts, unit = '') {
  if (!pts.length) return `<div class="empty small">Brak danych do wykresu.</div>`;
  const W = 340, H = 170, l = 6, r = 44, t = 16, b = 24;
  let mn = Math.min(...pts.map(p => p.y)), mx = Math.max(...pts.map(p => p.y));
  if (mn === mx) { mn -= 1; mx += 1; } const pad = (mx - mn) * .12; mn -= pad; mx += pad;
  const X = i => pts.length === 1 ? (l + W - r) / 2 : l + i * (W - l - r) / (pts.length - 1), Y = v => t + (mx - v) * (H - t - b) / (mx - mn);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(p.y).toFixed(1)}`).join('');
  const grid = [0, .5, 1].map(f => { const v = mn + pad + (mx - mn - 2 * pad) * f; return `<line class="grid" x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="lab" x="${W - r + 6}" y="${Y(v) + 4}">${fmt(Math.round(v * 10) / 10)}</text>`; }).join('');
  const last = pts.length - 1;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Wykres">${grid}
    ${pts.length > 1 ? `<path class="area" d="${line}L${X(last)} ${H - b}L${X(0)} ${H - b}Z"/><path class="line" d="${line}"/>` : ''}
    ${pts.map((p, i) => `<circle class="${i === last ? 'dot last' : 'dot'}" cx="${X(i)}" cy="${Y(p.y)}" r="${i === last ? 5 : pts.length > 24 ? 0 : 2.5}"/>`).join('')}
    <text class="lab" x="${l}" y="${H - 6}">${esc(pts[0].x)}</text>${pts.length > 1 ? `<text class="lab" text-anchor="end" x="${W - r}" y="${H - 6}">${esc(pts[last].x)}</text>` : ''}
    <text class="lab unit" x="${W - r + 6}" y="${H - 6}">${esc(unit)}</text></svg>`;
}
export function spark(vals) {
  if (vals.length < 2) return '';
  const mn = Math.min(...vals), mx = Math.max(...vals), d = mx - mn || 1;
  return `<svg class="spark" viewBox="0 0 64 24"><path d="${vals.map((v, i) => `${i ? 'L' : 'M'}${(2 + i * 60 / (vals.length - 1)).toFixed(1)} ${(21 - (v - mn) * 18 / d).toFixed(1)}`).join('')}"/></svg>`;
}
export function ring(frac, label, sub) {
  const c = 2 * Math.PI * 52, f = Math.max(0, Math.min(1, frac));
  return `<svg class="ring" viewBox="0 0 120 120"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}" transform="rotate(-90 60 60)"/><text x="60" y="60" class="ring-t">${label}</text><text x="60" y="80" class="ring-s">${sub}</text></svg>`;
}
