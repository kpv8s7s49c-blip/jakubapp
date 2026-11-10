// workout.js — trening na żywo: szybkie logowanie serii, timer przerw, pasek postępu, podsumowanie
import { S, P, save, uid, iso, history, exKey } from './store.js';
import { $, esc, num, fmt, big, ic, clock, openSheet, closeSheet, confirmSheet, toast } from './ui.js';
import { A, IN, screens, nav, cur, render, go, setTab, after } from './core.js';
import { media, optDot, phaseNote } from './app.js';
import { phase, setsFor, progression } from './program.js';
import { musChips, bodyMap } from './muscles.js';

const act = () => P().active;
const planDay = () => P().plan.days.find(d => d.id === act()?.dayId);

A.start = d => {
  const p = P();
  if (p.active) {
    if (p.active.dayId === d.id) return go('workout');
    return confirmSheet('Masz rozpoczęty trening', `Rozpoczęcie nowego usunie niezapisany trening „${p.active.dayName}”.`, 'Zacznij nowy', () => { p.active = null; begin(d.id); });
  }
  begin(d.id);
};
function begin(id) {
  const d = P().plan.days.find(x => x.id === id); if (!d) return;
  const ph = phase(P());
  unlockAudio();
  P().active = { id: uid(), dayId: d.id, dayName: d.name, start: Date.now(), warm: {}, str: {}, open: 0, info: null, rest: null,
    entries: d.exercises.map(x => {
      const last = history(exKey(x.name)).at(-1), reps = parseInt(x.reps) || 0, n = setsFor(x, ph), pg = progression(x, last, ph);
      return { exId: x.id, name: x.name, rest: +x.rest || 90, plan: `${x.sets} × ${x.reps}${x.rir ? ` · RIR ${x.rir}` : ''}${+x.weight ? ` · ${fmt(x.weight)} kg` : ''}`,
        last: last ? last.sets.map(s => `${fmt(s.w)} × ${s.r}`).join('  ·  ') : '', tip: pg.tip, up: pg.up || 0, lo: pg.lo || 0, optional: !!x.optional, skip: false,
        cut: n !== Math.max(1, +x.sets || 1) ? `${n} z ${x.sets} serii (${ph.title.toLowerCase()})` : '',
        sets: Array.from({ length: n }, (_, i) => ({ w: last ? (last.sets[i] || last.sets.at(-1)).w : +x.weight || 0, r: last ? (last.sets[i] || last.sets.at(-1)).r : reps, done: false })) };
    }) };
  save(); nav.stack = []; go('workout');
}
function counts() {
  const a = act(), d = planDay(), w = d?.warmup || [], s = d?.stretch || [];
  const sets = a.entries.filter(e => !e.skip).flatMap(e => e.sets);
  const total = w.length + s.length + sets.length, done = w.filter(x => a.warm[x.id]).length + s.filter(x => a.str[x.id]).length + sets.filter(x => x.done).length;
  return { total, done };
}

screens.workout = () => {
  const a = act(); if (!a) return `<header class="nb"><button class="nb-b" data-a="back">${ic('back', 24)}</button><h2>Trening</h2><div class="nb-r"></div></header><div class="empty">Brak rozpoczętego treningu.</div>`;
  const d = planDay() || { warmup: [], stretch: [], exercises: [] }, c = counts();
  const todo = (x, key) => { const on = a[key][x.id], open = a.info === x.id;
    return `<div class="item ${open ? 'open' : ''}"><div class="row todo ${on ? 'done' : ''}"><button class="box" data-a="todo" data-k="${key}" data-id="${x.id}" aria-label="Odhacz">${on ? ic('check', 20) : ''}</button>
      <button class="grow plain" data-a="wInfo" data-id="${x.id}"><b>${esc(x.name)}</b><span class="muted">${esc(x.detail || '')}</span></button>${media(x, 'thumb')}</div>
      ${open ? `<div class="detail"><div class="duo">${media(x, 'big')}${bodyMap(x)}</div>${musChips(x)}${x.desc ? `<p>${esc(x.desc)}</p>` : ''}</div>` : ''}</div>`; };
  const card = (e, i) => {
    const x = d.exercises.find(y => y.id === e.exId) || { anim: '', desc: '' }, open = a.open === i, nd = e.sets.filter(s => s.done).length, all = nd === e.sets.length;
    if (e.skip) return `<article class="ex skipped" id="ex-${i}"><div class="ex-h">${media(x, 'thumb')}<div class="grow"><b>${esc(e.name)}</b><span class="muted">Pominięte dziś</span></div><button class="chip" data-a="skipEx" data-e="${i}">Przywróć</button></div></article>`;
    return `<article class="ex ${open ? 'open' : ''} ${all ? 'all' : ''}" id="ex-${i}">
      <button class="ex-h" data-a="wOpen" data-i="${i}">${media(x, 'thumb')}<div class="grow"><b>${esc(e.name)}${optDot(e)}</b><span class="muted">Plan: ${esc(e.plan)}${e.cut ? ` · dziś ${esc(e.cut)}` : ''}</span></div><div class="dots">${e.sets.map(s => `<i class="${s.done ? 'on' : ''}"></i>`).join('')}</div></button>
      ${open ? `<div class="ex-b">
        <div class="duo">${x.anim || x.img ? media(x, 'big') : ''}${bodyMap(x)}</div>${musChips(x)}<div class="demo nofig"><div>${x.desc ? `<p>${esc(x.desc)}</p>` : ''}${e.last ? `<p class="last"><span>Ostatnio</span>${esc(e.last)}</p>` : `<p class="last"><span>Ostatnio</span>pierwszy raz</p>`}</div></div>
        ${e.tip ? `<div class="tip"><b>Progresja</b>${esc(e.tip)}${e.up && e.sets.some(s => !s.done && s.w !== e.up) ? `<div><button class="chip solid" data-a="applyUp" data-e="${i}">Ustaw ${fmt(e.up)} kg × ${e.lo}</button></div>` : ''}</div>` : ''}
        ${e.optional && !nd ? `<button class="chip skipb" data-a="skipEx" data-e="${i}">Pomiń to ćwiczenie dziś</button>` : ''}
        <div class="set-hd"><span></span><span>kg</span><span>powt.</span><span></span></div>
        ${e.sets.map((s, j) => `<div class="set ${s.done ? 'done' : ''}"><span class="set-n">${j + 1}</span>
          ${['w', 'r'].map(f => `<div class="stp"><button data-a="stp" data-e="${i}" data-s="${j}" data-f="${f}" data-d="${f === 'w' ? -2.5 : -1}" aria-label="Mniej">${ic('minus', 18)}</button><input inputmode="${f === 'w' ? 'decimal' : 'numeric'}" value="${fmt(s[f])}" data-c="setv" data-e="${i}" data-s="${j}" data-f="${f}" aria-label="${f === 'w' ? 'Ciężar' : 'Powtórzenia'}"><button data-a="stp" data-e="${i}" data-s="${j}" data-f="${f}" data-d="${f === 'w' ? 2.5 : 1}" aria-label="Więcej">${ic('plus', 18)}</button></div>`).join('')}
          <button class="chk" data-a="setDone" data-e="${i}" data-s="${j}" aria-label="Seria wykonana">${ic('check', 24)}</button></div>`).join('')}
        <div class="ex-f"><button class="chip" data-a="addSet" data-e="${i}">${ic('plus', 16)} Seria</button>${e.sets.length > 1 ? `<button class="chip" data-a="delSet" data-e="${i}">${ic('minus', 16)} Seria</button>` : ''}<span class="muted">${ic('timer', 16)} przerwa ${e.rest >= 60 ? Math.floor(e.rest / 60) + ':' + String(e.rest % 60).padStart(2, '0') : e.rest + ' s'}</span></div>
      </div>` : ''}</article>`;
  };
  return `<header class="wh"><button class="nb-b" data-a="back" aria-label="Zwiń trening">${ic('down', 24)}</button><div class="wh-t"><b>${esc(a.dayName)}</b><span data-clock></span></div><button class="txt" data-a="finishAsk">Zakończ</button>
    <div class="prog"><i style="width:${c.total ? c.done / c.total * 100 : 0}%"></i></div><p class="prog-l">${c.done} z ${c.total} kroków</p></header>
  ${phaseNote('inw')}
  ${d.warmup.length ? `<h3 class="sec warmup">Rozgrzewka</h3><div class="list">${d.warmup.map(x => todo(x, 'warm')).join('')}</div>` : ''}
  <h3 class="sec exercises">Ćwiczenia</h3>${a.entries.map(card).join('') || `<div class="empty small">Ten dzień nie ma ćwiczeń.</div>`}
  ${d.stretch.length ? `<h3 class="sec stretch">Rozciąganie</h3><div class="list">${d.stretch.map(x => todo(x, 'str')).join('')}</div>` : ''}
  <button class="btn primary" data-a="finishAsk">Zakończ trening</button><div class="pad-rest"></div>`;
};
A.todo = d => { const a = act(); a[d.k][d.id] = !a[d.k][d.id]; save(); render(); };
A.wInfo = d => { const a = act(); a.info = a.info === d.id ? null : d.id; render(); };
A.wOpen = d => { const a = act(); a.open = a.open === +d.i ? -1 : +d.i; save(); render(); };
const setOf = d => act().entries[+d.e].sets[+d.s];
A.stp = (d, el) => { const s = setOf(d); s[d.f] = Math.max(0, Math.round((s[d.f] + +d.d) * 100) / 100); el.parentNode.querySelector('input').value = fmt(s[d.f]); save(); };
IN.setv = (d, el) => { const s = setOf(d); s[d.f] = Math.max(0, d.f === 'r' ? Math.round(num(el.value)) : num(el.value)); el.value = fmt(s[d.f]); save(); };
A.setDone = d => {
  const a = act(), e = a.entries[+d.e], s = e.sets[+d.s]; unlockAudio();
  s.done = !s.done;
  if (s.done) {
    const lastOfAll = a.entries.every(x => x.skip || x.sets.every(y => y.done));
    if (!lastOfAll) a.rest = { end: Date.now() + e.rest * 1000, total: e.rest };
    if (e.sets.every(x => x.done)) { const nx = a.entries.findIndex((x, i) => i > +d.e && !x.skip && x.sets.some(y => !y.done)); if (nx >= 0) a.open = nx; }
  } else a.rest = null;
  save(); render(); tick();
  if (s.done && a.open !== +d.e) $('#ex-' + a.open)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
A.applyUp = d => { const e = act().entries[+d.e]; for (const s of e.sets) if (!s.done) { s.w = e.up; s.r = e.lo; } save(); render(); };
A.skipEx = d => { const a = act(), e = a.entries[+d.e]; e.skip = !e.skip; if (e.skip) { e.sets.forEach(s => { s.done = false; }); const nx = a.entries.findIndex((x, i) => i > +d.e && !x.skip && x.sets.some(y => !y.done)); a.open = nx; } else a.open = +d.e; save(); render(); };
A.addSet = d => { const e = act().entries[+d.e], l = e.sets.at(-1); e.sets.push({ w: l.w, r: l.r, done: false }); save(); render(); };
A.delSet = d => { act().entries[+d.e].sets.pop(); save(); render(); };

// ---- timer przerwy ----
let ac;
function unlockAudio() { try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} }
function beep() {
  try { navigator.vibrate?.([120, 80, 120]); } catch (e) {}
  if (!S.settings.sound || !ac) return;
  [0, .2, .4].forEach(t => { const o = ac.createOscillator(), g = ac.createGain(), T = ac.currentTime + t; o.frequency.value = t === .4 ? 1175 : 880; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(.0001, T); g.gain.exponentialRampToValueAtTime(.35, T + .02); g.gain.exponentialRampToValueAtTime(.0001, T + .16); o.start(T); o.stop(T + .18); });
}
A.restAdj = d => { const r = act()?.rest; if (r) { r.end += +d.s * 1000; r.total = Math.max(r.total + +d.s, 5); save(); tick(); } };
A.restSkip = () => { const a = act(); if (a) { a.rest = null; save(); tick(); } };
let pillOn = false;
function tick() {
  const a = S?.profiles.length ? act() : null, pill = $('#rest');
  document.querySelectorAll('[data-clock]').forEach(el => { el.textContent = a ? clock(Date.now() - a.start) : ''; });
  const show = !!(a?.rest) && cur().name === 'workout';
  if (a?.rest && a.rest.end <= Date.now()) { a.rest = null; save(); beep(); if (cur().name === 'workout') toast('Koniec przerwy. Następna seria'); pill.hidden = true; pillOn = false; return; }
  if (!show) { if (pillOn) { pill.hidden = true; pillOn = false; } return; }
  const left = a.rest.end - Date.now(), f = Math.max(0, Math.min(1, left / (a.rest.total * 1000)));
  if (!pillOn) { pill.hidden = false; pillOn = true; pill.innerHTML = `<div class="rest-bar"><i></i></div><button data-a="restAdj" data-s="-15">−15</button><div class="rest-t"><span>Przerwa</span><b></b></div><button data-a="restAdj" data-s="15">+15</button><button class="skip" data-a="restSkip">Pomiń</button>`; }
  pill.querySelector('b').textContent = clock(left + 999); pill.querySelector('i').style.width = f * 100 + '%';
}
setInterval(tick, 250);
after.push(() => { tick(); wake(); });
let lock = null;
async function wake() {
  const want = cur().name === 'workout' && !!S.profiles.length && !!act();
  try { if (want && !lock && navigator.wakeLock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } else if (!want && lock) { await lock.release(); lock = null; } } catch (e) {}
}
addEventListener('visibilitychange', () => { if (!document.hidden) { wake(); tick(); } });

// ---- zakończenie ----
A.finishAsk = () => {
  const a = act(), n = a.entries.flatMap(e => e.sets).filter(s => s.done).length, c = counts();
  openSheet(`<h2>Zakończyć trening?</h2><p class="muted">${n ? `Zapiszę ${n} ${n === 1 ? 'wykonaną serię' : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? 'wykonane serie' : 'wykonanych serii'}. ${c.done < c.total ? 'Nieodhaczone serie nie trafią do historii.' : ''}` : 'Nie odhaczono żadnej serii, więc nie ma czego zapisać.'}</p>
    ${n ? `<button class="btn primary" data-a="finish">Zapisz trening</button>` : ''}<button class="btn danger ghost" data-a="discard">Porzuć bez zapisywania</button><button class="btn ghost" data-a="closeSheet">Trenuję dalej</button>`);
};
A.discard = () => { P().active = null; save(); closeSheet(true); setTab('home'); };
A.finish = () => {
  const p = P(), a = act(), d = planDay();
  const entries = a.entries.map(e => ({ name: e.name, sets: e.sets.filter(s => s.done).map(s => ({ w: s.w, r: s.r })) })).filter(e => e.sets.length);
  const prs = [];
  for (const e of entries) { const h = history(exKey(e.name)), top = Math.max(...e.sets.map(s => s.w)); if (h.length && top > Math.max(...h.map(x => x.top))) prs.push(`${e.name}: ${fmt(top)} kg`); }
  const s = { id: a.id, date: iso(new Date(a.start)), dayId: a.dayId, dayName: a.dayName, start: a.start, end: Date.now(), entries, prs,
    warm: (d?.warmup || []).filter(x => a.warm[x.id]).length, str: (d?.stretch || []).filter(x => a.str[x.id]).length };
  p.sessions.push(s); p.active = null; save(true); closeSheet(true);
  nav.stack = [{ name: 'summary', p: { id: s.id } }]; render('push');
};
export const sessVol = s => s.entries.reduce((t, e) => t + e.sets.reduce((u, x) => u + x.w * x.r, 0), 0);
export const sessSets = s => s.entries.reduce((t, e) => t + e.sets.length, 0);
screens.summary = q => {
  const s = P().sessions.find(x => x.id === q.id); if (!s) return '';
  return `<section class="done-s"><div class="burst">${ic('check', 44)}</div><h1>Trening zapisany</h1><p class="muted">${esc(s.dayName)}</p>
    <div class="stats"><div><b>${clock(s.end - s.start)}</b><span>czas</span></div><div><b>${sessSets(s)}</b><span>serie</span></div><div><b>${big(sessVol(s))}</b><span>kg łącznie</span></div></div>
    ${s.prs.length ? `<h3 class="sec">Nowe rekordy</h3><div class="list">${s.prs.map(x => `<div class="row"><span class="pill">rekord</span><div class="grow"><b>${esc(x)}</b></div></div>`).join('')}</div>` : ''}
    ${S.settings.healthWorkout ? `<button class="btn ghost" data-a="health" data-w="${s.id}">${ic('share', 18)} Wyślij trening do Apple Zdrowie</button>` : ''}
    <button class="btn primary" data-a="tab" data-t="home">Gotowe</button><button class="btn ghost" data-a="tab" data-t="progress">Zobacz postępy</button></section>`;
};
