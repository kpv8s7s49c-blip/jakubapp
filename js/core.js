// core.js — nawigacja, rejestr ekranów i akcji
import { $, ic, esc } from './ui.js';
import { S } from './store.js';
export const A = {}, IN = {}, screens = {}, after = [];
export const nav = { tab: 'home', stack: [], scroll: 0 };
export const TABS = [['home', 'Dziś', 'home'], ['plan', 'Plan', 'plan'], ['tracker', 'Dziennik', 'drop'], ['progress', 'Postępy', 'chart'], ['more', 'Więcej', 'more']];
export const cur = () => nav.stack[nav.stack.length - 1] || { name: S.profiles.length ? nav.tab : 'welcome', p: {} };
const holder = () => nav.stack[nav.stack.length - 1] || nav;

export function render(anim) {
  const v = $('#view'), c = cur(), keep = v.scrollTop;
  v.innerHTML = screens[c.name](c.p || {});
  v.dataset.screen = c.name;
  if (anim) { v.scrollTop = anim === 'pop' ? (holder().scroll || 0) : 0; v.classList.remove('push', 'pop', 'fade'); void v.offsetWidth; v.classList.add(anim); }
  else v.scrollTop = keep;
  const tabs = $('#tabs'), show = !nav.stack.length && S.profiles.length > 0;
  tabs.hidden = !show;
  if (show) tabs.innerHTML = TABS.map(([k, label, icon]) => `<button class="${nav.tab === k ? 'on' : ''}" data-a="tab" data-t="${k}" aria-label="${label}">${ic(icon, 24)}<span>${label}</span></button>`).join('');
  after.forEach(f => f(c));
}
export function go(name, p = {}) { holder().scroll = $('#view').scrollTop; nav.stack.push({ name, p }); render('push'); }
export function back() { nav.stack.pop(); render('pop'); }
export function setTab(t) { nav.tab = t; nav.stack = []; nav.scroll = 0; render('fade'); }
A.tab = d => setTab(d.t);
A.back = () => back();
A.go = d => go(d.s, { id: d.id });

export const navbar = (title, right = '') => `<header class="nb"><button class="nb-b" data-a="back" aria-label="Wstecz">${ic('back', 24)}</button><h2>${esc(title)}</h2><div class="nb-r">${right}</div></header>`;
export const large = (title, sub = '', right = '') => `<header class="lt"><div><p class="sub">${esc(sub)}</p><h1>${esc(title)}</h1></div>${right}</header>`;

document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && A[el.dataset.a]) A[el.dataset.a](el.dataset, el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && IN[el.dataset.i]) IN[el.dataset.i](el.dataset, el); });
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (el && IN[el.dataset.c]) IN[el.dataset.c](el.dataset, el); });
document.addEventListener('focusin', e => { if (e.target.matches('input[inputmode]')) setTimeout(() => { try { e.target.select(); } catch (x) {} }, 0); });
