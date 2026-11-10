// app.js — start aplikacji oraz ekrany: powitanie, Dziś, Plan, edytor, Więcej
import { S, P, profile, load, save, replaceState, uid, iso, addDays, dow, newProfileData, ACCENTS, day as tday, putImg, imgNow, allImgs, kv } from './store.js';
import { $, $$, esc, num, fmt, ic, DOW, DOW_FULL, dateLong, openSheet, closeSheet, sheetBody, confirmSheet, runConfirm, toast } from './ui.js';
import { A, IN, screens, nav, cur, render, go, back, setTab, navbar, large, after } from './core.js';
import { figure, ANIMS, ANIM_LIST, guessAnim } from './figures.js';
import { PLANS } from './plans.js';
import { MUSCLES, musclesOf, defaultMuscles, fromLib, musLine, musChips, bodyMap } from './muscles.js';
import { phase, TOTAL_WEEKS, EARLY_DELOAD } from './program.js';
import './workout.js';
import './stats.js';

export const VERSION = '1.5.2';
const SECS = { warmup: 'Rozgrzewka', exercises: 'Ćwiczenia', stretch: 'Rozciąganie' };
const restFmt = s => s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s} s`;
export const exLine = x => `${x.sets} × ${esc(x.reps)}${x.rir ? ` · RIR ${esc(x.rir)}` : ''}${+x.weight ? ` · ${fmt(x.weight)} kg` : ''}`;

// Ilustracja ćwiczenia: zdjęcia (dwie klatki) albo własna animacja SVG
// Tła dni i ekranu Dziś: własne zdjęcia zapisane tylko w telefonie
const BGS = {}; // zdjęcia tła nie są częścią aplikacji: każde wybiera się „Z telefonu” i zostaje tylko na urządzeniu
const bgUrl = d => !d?.bg ? '' : d.bg.startsWith('img:') ? (imgNow(d.bg.slice(4))?.a || '') : (BGS[d.bg]?.[0] || '');
after.push(c => {
  const el = $('#bg'); let d = null;
  if (S.profiles.length) { if (c.name === 'day') d = P().plan.days.find(x => x.id === c.p.id); else if (c.name === 'workout') d = P().plan.days.find(x => x.id === P().active?.dayId); }
  const home = S.profiles.length > 0 && c.name === 'home', hb = home ? P().homeBg || '' : '';
  const u = home ? (hb.startsWith('img:') ? (imgNow(hb.slice(4))?.a || '') : '') : bgUrl(d);
  el.classList.toggle('soft', home);
  if (el.dataset.u !== u) { el.dataset.u = u; el.style.backgroundImage = u ? `url("${u}")` : ''; }
  el.classList.toggle('on', !!u); $('#view').classList.toggle('hasbg', !!u);
});
export const optDot = x => x.optional ? `<em class="opt">opcjonalne</em>` : '';
export function phaseNote(cls = '') {
  const ph = phase(P()); if (!ph) return '';
  return `<div class="note phase ${cls}"><b>${ph.week >= 1 && ph.week <= TOTAL_WEEKS ? `Tydzień ${ph.week} z ${TOTAL_WEEKS} · ` : ''}${ph.title}</b><span>${ph.text}</span></div>`;
}
export function media(x, cls = '') {
  const im = x.img && imgNow(x.img);
  if (im) return `<div class="fig photo ${cls}"><img src="${im.a}" alt=""><img class="fb" src="${im.b || im.a}" alt=""></div>`;
  return figure(x.anim, cls);
}

function applyLook() {
  const p = profile();
  document.documentElement.dataset.theme = S.settings.theme;
  document.documentElement.style.setProperty('--ac', p ? ACCENTS[p.accent] || ACCENTS.blekit : ACCENTS.blekit);
}
A.closeSheet = () => closeSheet();
A.confirmOk = () => runConfirm();

// ───────── powitanie ─────────
screens.welcome = () => `<section class="welcome">
  ${figure('squat', 'hero')}
  <h1>Siłownia</h1>
  <p class="muted">Plan, serie i postępy w jednym miejscu. Wszystkie dane zostają na tym telefonie.</p>
  <label class="fld"><span>Jak masz na imię?</span><input id="w-name" type="text" autocomplete="given-name" placeholder="Imię" maxlength="24"></label>
  <label class="tick"><input id="w-sample" type="checkbox" checked><span>Wczytaj mój plan: hipertrofia 3 dni (A/B/C)</span></label>
  <button class="btn primary" data-a="createFirst">Zaczynamy</button>
  <button class="btn ghost" data-a="restore">Przywróć dane z kopii zapasowej</button>
</section>`;
function addProfile(name, accent, sample) {
  const id = uid(); S.profiles.push({ id, name, accent }); S.data[id] = newProfileData(sample); S.activeId = id; save(true); applyLook();
}
A.createFirst = () => {
  const name = $('#w-name').value.trim();
  if (!name) { toast('Wpisz imię'); $('#w-name').focus(); return; }
  const withPlan = $('#w-sample').checked; addProfile(name, 'blekit', false); if (withPlan) applyReady('h3', 'replace'); setTab('home');
};

// ───────── Dziś ─────────
const avatar = (p, cls = '') => `<span class="av ${cls}" style="--c:${ACCENTS[p.accent]}">${esc(p.name[0].toUpperCase())}</span>`;
const dayMeta = d => { const n = d.exercises.length; return `${n} ${n === 1 ? 'ćwiczenie' : n < 5 && n > 1 ? 'ćwiczenia' : 'ćwiczeń'} · ${d.exercises.reduce((s, x) => s + (+x.sets || 0), 0)} serii`; };
screens.home = () => {
  const p = P(), t = iso(), d = dow(t), mon = addDays(t, -d), td = tday(t);
  const week = DOW.map((l, i) => {
    const date = addDays(mon, i), done = p.sessions.some(s => s.date === date), planned = p.plan.days.some(x => x.dow?.includes(i));
    return `<button class="wd ${i === d ? 'today' : ''} ${done ? 'done' : ''}" data-a="go" data-s="date" data-id="${date}" aria-label="${dateLong(date)}"><span>${l}</span><i>${done ? ic('check', 16) : planned ? '<b></b>' : ''}</i></button>`;
  }).join('');
  const todays = p.plan.days.filter(x => x.dow?.includes(d)), others = p.plan.days.filter(x => !todays.includes(x));
  let hero;
  if (p.active) hero = `<article class="hero"><p class="sub">Trening trwa</p><h2>${esc(p.active.dayName)}</h2><p class="muted" data-clock></p><button class="btn primary" data-a="go" data-s="workout">${ic('play', 18)} Wróć do treningu</button></article>`;
  else if (todays.length) hero = todays.map(x => `<article class="hero"><p class="sub">Dzisiejszy trening</p><h2>${esc(x.name)}</h2><p class="muted">${dayMeta(x)}</p>
    <div class="strip">${x.exercises.slice(0, 5).map(e => media(e, 'mini')).join('')}</div>
    <button class="btn primary" data-a="start" data-id="${x.id}">${ic('play', 18)} Rozpocznij trening</button><button class="btn ghost" data-a="go" data-s="day" data-id="${x.id}">Zobacz plan dnia</button></article>`).join('');
  else hero = `<article class="hero quiet"><p class="sub">${p.plan.days.length ? 'Dzień wolny' : 'Brak planu'}</p><h2>${p.plan.days.length ? 'Dziś regeneracja' : 'Dodaj swój plan'}</h2>
    <p class="muted">${p.plan.days.length ? 'Na dziś nie ma zaplanowanego treningu. Możesz mimo to wybrać dowolny dzień z planu.' : 'W zakładce Plan wczytasz gotowy plan jednym dotknięciem albo wprowadzisz własne dni i ćwiczenia.'}</p>
    ${p.plan.days.length ? '' : `<button class="btn primary" data-a="tab" data-t="plan">Otwórz plan</button>`}</article>`;
  const sample = p.plan.days.some(x => x.sample);
  const backupDue = p.sessions.length >= 3 && Date.now() - (S.settings.lastBackup || 0) > 14 * 864e5;
  return `${large('Dziś', dateLong(t), `<button class="av-b" data-a="profiles" aria-label="Zmień profil">${avatar(profile())}</button>`)}
  <div class="week">${week}</div>
  ${hero}
  ${phaseNote()}
  <div class="quick">
    <button class="tile ${td.creatine ? 'on' : ''}" data-a="creatine" data-d="${t}">${ic(td.creatine ? 'check' : 'bolt', 20)}<span>Kreatyna</span><small>${td.creatine ? 'wzięta' : 'do wzięcia'}</small></button>
    <button class="tile" data-a="water" data-d="${t}" data-n="250">${ic('drop', 20)}<span>${fmt(td.water / 1000)} / ${fmt(p.goals.water / 1000)} l</span><small>dotknij: +250 ml</small></button>
  </div>
  ${others.length && !p.active ? `<h3 class="sec">${todays.length ? 'Pozostałe dni' : 'Wybierz trening'}</h3><div class="list">${others.map(x => `<button class="row" data-a="go" data-s="day" data-id="${x.id}"><div class="grow"><b>${esc(x.name)}</b><span class="muted">${dowLabel(x)} · ${dayMeta(x)}</span></div>${ic('chev', 18)}</button>`).join('')}</div>` : ''}
  ${sample ? `<div class="note"><b>To przykładowy plan.</b> Służy tylko do podglądu. Usuniesz go jednym dotknięciem i wprowadzisz własny.<div><button class="chip" data-a="dropSample">Usuń przykłady</button></div></div>` : ''}
  ${backupDue ? `<div class="note"><b>Zrób kopię zapasową.</b> Ostatnia kopia jest starsza niż dwa tygodnie.<div><button class="chip" data-a="backup">Zapisz kopię</button></div></div>` : ''}`;
};
const dowLabel = d => d.dow?.length ? d.dow.slice().sort().map(i => DOW[i]).join(', ') : 'bez dnia tygodnia';
A.dropSample = () => confirmSheet('Usunąć przykładowe dni?', 'Znikną tylko dni oznaczone jako przykład. Historia treningów zostaje.', 'Usuń przykłady', () => { P().plan.days = P().plan.days.filter(d => !d.sample); save(); render(); toast('Przykłady usunięte'); });

// ───────── Plan ─────────
screens.plan = () => {
  const days = P().plan.days;
  return `${large('Plan', 'Tydzień treningowy')}
  ${days.length ? `<div class="list">${days.map(d => `<button class="row tall" data-a="go" data-s="day" data-id="${d.id}"><div class="grow"><b>${esc(d.name)}</b><span class="muted">${dowLabel(d)}</span><span class="muted">${dayMeta(d)}</span></div>${ic('chev', 18)}</button>`).join('')}</div>`
      : `<div class="empty"><b>Plan jest pusty</b>Dodaj pierwszy dzień treningowy albo zaimportuj plan z pliku.</div>`}
  <button class="btn primary" data-a="addDay">${ic('plus', 18)} Dodaj dzień treningowy</button>
  <button class="btn ghost" data-a="readyPlans">Wczytaj gotowy plan</button>
  <button class="btn ghost" data-a="importPlan">Importuj plan z pliku lub tekstu</button>
  ${days.length ? `<button class="btn ghost" data-a="exportPlan">Eksportuj plan do pliku</button>` : ''}`;
};
const findDay = id => P().plan.days.find(d => d.id === id);
A.addDay = () => { const d = { id: uid(), name: 'Nowy dzień', dow: [], warmup: [], exercises: [], stretch: [] }; P().plan.days.push(d); save(); go('day', { id: d.id, edit: true }); };

screens.day = p => {
  const d = findDay(p.id); if (!d) return navbar('Plan') + `<div class="empty">Ten dzień został usunięty.</div>`;
  const ed = p.edit;
  const item = (x, sec, i, n) => {
    const sub = sec === 'exercises' ? `${exLine(x)} · przerwa ${restFmt(+x.rest || 90)}` : esc(x.detail || '');
    if (ed) return `<div class="row"><div class="ord"><button data-a="move" data-sec="${sec}" data-i="${i}" data-by="-1" ${i ? '' : 'disabled'} aria-label="W górę">${ic('up', 18)}</button><button data-a="move" data-sec="${sec}" data-i="${i}" data-by="1" ${i < n - 1 ? '' : 'disabled'} aria-label="W dół">${ic('down', 18)}</button></div>
      <button class="grow plain" data-a="editItem" data-sec="${sec}" data-id="${x.id}"><b>${esc(x.name)}${optDot(x)}</b><span class="muted">${sub}</span></button><button class="icb" data-a="editItem" data-sec="${sec}" data-id="${x.id}" aria-label="Edytuj">${ic('edit', 18)}</button></div>`;
    const open = p.open === x.id;
    return `<div class="item ${open ? 'open' : ''}"><button class="row" data-a="openItem" data-id="${x.id}">${media(x, 'thumb')}<div class="grow"><b>${esc(x.name)}${optDot(x)}</b><span class="muted">${sub}</span>${musLine(x)}</div>${ic(open ? 'up' : 'down', 18)}</button>
      ${open ? `<div class="detail"><div class="duo">${media(x, 'big')}${bodyMap(x)}</div>${musChips(x)}${x.desc ? `<p>${esc(x.desc)}</p>` : '<p class="muted">Brak opisu.</p>'}</div>` : ''}</div>`;
  };
  const section = sec => `<h3 class="sec ${sec}">${SECS[sec]}<small>${d[sec].length || ''}</small></h3>
    <div class="list">${d[sec].map((x, i) => item(x, sec, i, d[sec].length)).join('') || (ed ? '' : `<div class="row muted">Nic tu jeszcze nie ma.</div>`)}
    ${ed ? `<button class="row add" data-a="editItem" data-sec="${sec}">${ic('plus', 18)} Dodaj ${sec === 'exercises' ? 'ćwiczenie' : 'pozycję'}</button>` : ''}</div>`;
  return `${navbar(ed ? 'Edycja dnia' : d.name, `<button class="txt" data-a="dayEdit">${ed ? 'Gotowe' : 'Edytuj'}</button>`)}
  ${ed ? `<label class="fld"><span>Nazwa dnia</span><input type="text" value="${esc(d.name)}" data-i="dayName" maxlength="40"></label>
    <div class="fld"><span>Tło dnia</span><div class="chips"><button class="chip ${d.bg ? '' : 'on'}" data-a="dayBg" data-k="">Brak</button>${Object.entries(BGS).map(([k, v]) => `<button class="chip ${d.bg === k ? 'on' : ''}" data-a="dayBg" data-k="${k}">${v[1]}</button>`).join('')}<button class="chip ${d.bg?.startsWith('img:') ? 'on' : ''}" data-a="dayBgPick">${ic('image', 16)} Z telefonu</button></div></div>
    <div class="fld"><span>Dni tygodnia</span><div class="chips">${DOW.map((l, i) => `<button class="chip ${d.dow.includes(i) ? 'on' : ''}" data-a="dayDow" data-i="${i}">${l}</button>`).join('')}</div></div>`
      : `<p class="lead">${d.dow.length ? d.dow.slice().sort().map(i => DOW_FULL[i]).join(', ') : 'Bez przypisanego dnia tygodnia'}</p>
    <button class="btn primary" data-a="start" data-id="${d.id}">${ic('play', 18)} Rozpocznij trening</button>`}
  ${section('warmup')}${section('exercises')}${section('stretch')}
  ${ed ? `<button class="btn danger ghost" data-a="delDay">Usuń ten dzień</button>` : ''}`;
};
A.dayEdit = () => { const c = cur(); c.p.edit = !c.p.edit; const d = findDay(c.p.id); if (d && !c.p.edit) delete d.sample; save(); render(); };
A.openItem = d => { const c = cur(); c.p.open = c.p.open === d.id ? null : d.id; render(); };
IN.dayName = (d, el) => { findDay(cur().p.id).name = el.value || 'Dzień'; save(); };
A.dayBg = d => { const day = findDay(cur().p.id); if (d.k) day.bg = d.k; else delete day.bg; save(); render(); };
function pickBg(id, done) { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
  i.onchange = async () => { const f = i.files[0]; if (!f) return; try {
    const bmp = await createImageBitmap(f), w = Math.min(1000, bmp.width), c = document.createElement('canvas'); c.width = w; c.height = Math.round(bmp.height * w / bmp.width);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    await putImg(id, { a: c.toDataURL('image/jpeg', .76) }); done('img:' + id); $('#bg').dataset.u = ''; save(); render(); toast('Tło zapisane w telefonie');
  } catch (e) { toast('Nie udało się wczytać zdjęcia'); } }; i.click(); }
A.dayBgPick = () => { const day = findDay(cur().p.id); pickBg('bg-' + day.id, v => { day.bg = v; }); };
A.homeBg = d => { P().homeBg = d.k; save(); render(); };
A.homeBgPick = () => pickBg('bg-home-' + S.activeId, v => { P().homeBg = v; });
A.dayDow = d => { const day = findDay(cur().p.id), i = +d.i; day.dow = day.dow.includes(i) ? day.dow.filter(x => x !== i) : [...day.dow, i]; save(); render(); };
A.move = d => { const arr = findDay(cur().p.id)[d.sec], i = +d.i, j = i + +d.by; [arr[i], arr[j]] = [arr[j], arr[i]]; save(); render(); };
A.delDay = () => confirmSheet('Usunąć ten dzień?', 'Dzień zniknie z planu. Zapisane treningi i postępy zostają w historii.', 'Usuń dzień', () => { P().plan.days = P().plan.days.filter(x => x.id !== cur().p.id); save(); back(); });

// ───────── edytor ćwiczenia / pozycji ─────────
let ed = null;
A.editItem = d => {
  const day = findDay(cur().p.id), x = d.id && day[d.sec].find(i => i.id === d.id);
  ed = { sec: d.sec, id: d.id || null, auto: !x, mus: x?.muscles ? { p: [...(x.muscles.p || [])], s: [...(x.muscles.s || [])] } : null, d: x ? { ...x } : d.sec === 'exercises' ? { name: '', desc: '', sets: 3, reps: '10', rir: '', weight: 0, rest: 90, anim: '' } : { name: '', detail: '', desc: '', anim: '' } };
  openSheet(editorHTML());
};
function editorHTML() {
  const x = ed.d, isEx = ed.sec === 'exercises';
  return `<h2>${ed.id ? 'Edycja' : isEx ? 'Nowe ćwiczenie' : 'Nowa pozycja'} <small class="muted">${SECS[ed.sec].toLowerCase()}</small></h2>
  <label class="fld"><span>Nazwa</span><input type="text" value="${esc(x.name)}" data-i="ed" data-f="name" placeholder="${isEx ? 'np. Przysiad ze sztangą' : 'np. Rowerek'}" maxlength="60"></label>
  ${isEx ? `<div class="grid3">
      <label class="fld"><span>Serie</span><input inputmode="numeric" value="${esc(x.sets)}" data-i="ed" data-f="sets"></label>
      <label class="fld"><span>Powtórzenia</span><input type="text" value="${esc(x.reps)}" data-i="ed" data-f="reps" placeholder="8–10"></label>
      <label class="fld"><span>Ciężar (kg)</span><input inputmode="decimal" value="${fmt(x.weight)}" data-i="ed" data-f="weight"></label></div>
    <label class="fld"><span>RIR, czyli zapas powtórzeń (opcjonalnie)</span><input type="text" value="${esc(x.rir || '')}" data-i="ed" data-f="rir" placeholder="np. 1–2"></label>
    <button class="tog" data-a="edFlag" data-f="optional"><span class="sw ${x.optional ? 'on' : ''}"></span><span><b>Ćwiczenie opcjonalne</b>Można je pominąć, gdy brakuje czasu.</span></button>
    <button class="tog" data-a="edFlag" data-f="compound"><span class="sw ${x.compound ? 'on' : ''}"></span><span><b>Ćwiczenie wielostawowe</b>W tygodniach wprowadzających dostaje o 1 serię mniej.</span></button>
    <div class="fld"><span>Przerwa między seriami</span><div class="chips">${[45, 60, 90, 120, 150, 180].map(s => `<button class="chip ${+x.rest === s ? 'on' : ''}" data-a="edRest" data-s="${s}">${restFmt(s)}</button>`).join('')}</div></div>`
      : `<label class="fld"><span>Ile (czas lub powtórzenia)</span><input type="text" value="${esc(x.detail)}" data-i="ed" data-f="detail" placeholder="np. 5 min albo 2 × 15"></label>`}
  <label class="fld"><span>Opis techniki</span><textarea rows="3" data-i="ed" data-f="desc" placeholder="Najważniejsze wskazówki">${esc(x.desc)}</textarea></label>
  <div class="fld"><span>Ilustracja ruchu</span><div class="animrow"><div id="ed-prev">${media(x, 'thumb lg')}</div><div class="grow"><button class="chip" data-a="pickAnim">Wybierz animację</button><button class="chip" data-a="lib">${ic('image', 16)} Zdjęcia z biblioteki</button></div></div></div>
  <div class="fld"><span>Partie mięśniowe: dotknij raz (główna), drugi raz (pomocnicza)</span><div class="chips mpick">${(() => { const m = ed.mus || defaultMuscles(x.anim); return Object.entries(MUSCLES).map(([k, l]) => `<button class="chip ${m.p.includes(k) ? 'on' : m.s.includes(k) ? 'half' : ''}" data-a="edMus" data-k="${k}">${l}</button>`).join(''); })()}</div></div>
  <button class="btn primary" data-a="edSave">Zapisz</button>
  ${ed.id ? `<button class="btn danger ghost" data-a="edDel">Usuń</button>` : ''}`;
}
const edRefresh = () => { const b = $$('#sheets .sheet-wrap:not(.off) .sheet-body')[0]; if (b) { const st = b.parentNode.scrollTop; b.innerHTML = editorHTML(); b.parentNode.scrollTop = st; } };
IN.ed = (d, el) => {
  ed.d[d.f] = el.value;
  if (d.f === 'name' && ed.auto && !ed.d.img) { const g = guessAnim(el.value); if (g !== ed.d.anim) { ed.d.anim = g; $('#ed-prev').innerHTML = media(ed.d, 'thumb lg'); } }
};
A.edMus = d => { const base = ed.mus || defaultMuscles(ed.d.anim); ed.mus = { p: [...base.p], s: [...base.s] }; const m = ed.mus, k = d.k;
  if (m.p.includes(k)) { m.p = m.p.filter(i => i !== k); m.s.push(k); } else if (m.s.includes(k)) m.s = m.s.filter(i => i !== k); else m.p.push(k); edRefresh(); };
A.edFlag = d => { ed.d[d.f] = !ed.d[d.f]; edRefresh(); };
A.edRest = d => { ed.d.rest = +d.s; edRefresh(); };
A.edSave = () => {
  const x = ed.d, day = findDay(cur().p.id); x.name = String(x.name).trim();
  if (!x.name) return toast('Wpisz nazwę');
  if (ed.sec === 'exercises') { x.sets = Math.max(1, Math.min(12, Math.round(num(x.sets)) || 1)); x.weight = num(x.weight); x.reps = String(x.reps).trim() || '10'; x.rir = String(x.rir || '').trim(); x.rest = +x.rest || 90; }
  if (ed.mus) x.muscles = ed.mus; else delete x.muscles;
  if (ed.id) Object.assign(day[ed.sec].find(i => i.id === ed.id), x); else day[ed.sec].push({ ...x, id: uid() });
  save(); closeSheet(true); render();
};
A.edDel = () => { const day = findDay(cur().p.id); day[ed.sec] = day[ed.sec].filter(i => i.id !== ed.id); save(); closeSheet(true); render(); };
A.pickAnim = () => openSheet(`<h2>Wybierz animację</h2><div class="pick"><button data-a="setAnim" data-k=""><div class="fig none"><span>brak</span></div><span>Bez animacji</span></button>${ANIM_LIST.map(a => `<button data-a="setAnim" data-k="${a.key}">${figure(a.key)}<span>${esc(a.name)}</span></button>`).join('')}</div>`);
A.setAnim = d => { ed.d.anim = d.k; ed.d.img = null; ed.auto = false; ed.mus = null; closeSheet(); edRefresh(); };

// Biblioteka zdjęć: free-exercise-db (domena publiczna, licencja Unlicense)
const LIB = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/';
let lib = null;
A.lib = async () => {
  openSheet(`<h2>Zdjęcia z biblioteki</h2><p class="muted">Ponad 800 ćwiczeń z dwiema klatkami ruchu. Nazwy są po angielsku, np. „squat”, „bench press”, „lat pulldown”. Pobranie wymaga internetu, potem zdjęcia działają offline.</p>
    <label class="fld"><input type="search" placeholder="Szukaj po angielsku" data-i="libq" id="libq" autocapitalize="off"></label><div id="libres" class="list"><div class="row muted">Wczytuję bibliotekę…</div></div>`);
  try { lib ||= await (await fetch(LIB + 'dist/exercises.json')).json(); IN.libq({}, $('#libq')); }
  catch (e) { $('#libres').innerHTML = `<div class="row muted">Nie udało się połączyć z biblioteką. Sprawdź internet i spróbuj ponownie.</div>`; }
};
IN.libq = (d, el) => {
  if (!lib) return; const q = el.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const res = lib.filter(x => q.every(w => x.name.toLowerCase().includes(w))).slice(0, 30);
  $('#libres').innerHTML = !q.length ? `<div class="row muted">Wpisz nazwę ćwiczenia.</div>` : res.map(x => `<button class="row" data-a="libPick" data-id="${esc(x.id)}"><div class="grow"><b>${esc(x.name)}</b><span class="muted">${esc((x.primaryMuscles || []).join(', '))} · ${esc(x.equipment || '')}</span></div>${ic('plus', 18)}</button>`).join('') || `<div class="row muted">Brak wyników.</div>`;
};
async function shrink(url) {
  const bmp = await createImageBitmap(await (await fetch(url)).blob()), w = Math.min(520, bmp.width), c = document.createElement('canvas');
  c.width = w; c.height = Math.round(bmp.height * w / bmp.width); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .78);
}
A.libPick = async (d, el) => {
  const x = lib.find(i => i.id === d.id); if (!x) return; el.classList.add('busy');
  try {
    const [a, b] = await Promise.all((x.images || []).slice(0, 2).map(i => shrink(LIB + 'exercises/' + i)));
    const id = 'lib-' + uid(); await putImg(id, { a, b: b || a, src: x.name });
    ed.d.img = id; ed.auto = false; const lm = fromLib(x.primaryMuscles, x.secondaryMuscles); if (lm.p.length) ed.mus = lm; closeSheet(); edRefresh(); toast('Zdjęcia zapisane w telefonie');
  } catch (e) { el.classList.remove('busy'); toast('Nie udało się pobrać zdjęć'); }
};

// ───────── import / eksport planu ─────────
const DOW_CODES = { pn: 0, pon: 0, wt: 1, sr: 2, 'śr': 2, cz: 3, czw: 3, pt: 4, so: 5, sob: 5, nd: 6, ndz: 6, niedz: 6 };
function normPlan(obj) {
  const days = Array.isArray(obj) ? obj : obj.days; if (!Array.isArray(days)) throw new Error('Brak listy "days"');
  const it = x => ({ id: uid(), name: String(x.name || 'Pozycja'), detail: String(x.detail || ''), desc: String(x.desc || ''), anim: ANIMS[x.anim] ? x.anim : guessAnim(x.name) });
  return days.map(d => ({ id: uid(), name: String(d.name || 'Dzień'), ...(BGS[d.bg] ? { bg: d.bg } : {}),
    dow: [...new Set((d.weekdays || d.dow || []).map(w => typeof w === 'number' ? w - 1 : DOW_CODES[String(w).toLowerCase().replace('.', '')]).filter(w => w >= 0 && w <= 6))],
    warmup: (d.warmup || []).map(it), stretch: (d.stretch || []).map(it),
    exercises: (d.exercises || []).map(x => ({ id: uid(), name: String(x.name || 'Ćwiczenie'), desc: String(x.desc || ''), sets: Math.max(1, Math.round(num(x.sets)) || 3), reps: String(x.reps ?? '10'), rir: String(x.rir ?? ''), optional: !!x.optional, compound: !!x.compound, ...(x.muscles && Array.isArray(x.muscles.p) ? { muscles: { p: x.muscles.p.filter(k => MUSCLES[k]), s: (x.muscles.s || []).filter(k => MUSCLES[k]) } } : {}), weight: num(x.weight), rest: Math.round(num(x.rest)) || 90, anim: ANIMS[x.anim] ? x.anim : guessAnim(x.name) })) }));
}
const planOut = () => ({ format: 'silownia-plan', days: P().plan.days.map(d => ({ name: d.name, ...(BGS[d.bg] ? { bg: d.bg } : {}), weekdays: d.dow.slice().sort().map(i => Object.keys(DOW_CODES).find(k => DOW_CODES[k] === i)),
  warmup: d.warmup.map(({ name, detail, desc, anim }) => ({ name, detail, desc, anim })), exercises: d.exercises.map(({ name, desc, sets, reps, rir, weight, rest, anim, muscles, optional, compound }) => ({ name, desc, sets, reps, rir: rir || '', weight, rest, anim, optional: !!optional, compound: !!compound, ...(muscles ? { muscles } : {}) })),
  stretch: d.stretch.map(({ name, detail, desc, anim }) => ({ name, detail, desc, anim })) })) });
async function shareFile(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' }), file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file] }); return true; } catch (e) { if (e.name === 'AbortError') return false; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return true;
}
function pickFile(cb) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json,text/plain';
  i.onchange = async () => { const f = i.files[0]; if (!f) return; try { cb(JSON.parse(await f.text())); } catch (e) { toast('To nie jest poprawny plik: ' + e.message); } }; i.click();
}
A.exportPlan = () => shareFile(`plan-${profile().name.toLowerCase()}.json`, planOut());
A.importPlan = () => openSheet(`<h2>Import planu</h2><p class="muted">Wklej treść pliku z planem albo wybierz plik zapisany w telefonie. Format opisuje instrukcja dołączona do aplikacji.</p>
  <label class="fld"><textarea id="imp" rows="6" placeholder='{"days":[…]}' autocapitalize="off" spellcheck="false"></textarea></label>
  <button class="btn ghost" data-a="impFile">Wybierz plik</button>
  <button class="btn primary" data-a="impDo" data-m="add">Dodaj do obecnego planu</button><button class="btn danger ghost" data-a="impDo" data-m="replace">Zastąp cały plan</button>`);
A.impFile = () => pickFile(o => { $('#imp').value = JSON.stringify(o); toast('Plik wczytany, wybierz sposób importu'); });
A.impDo = d => {
  let days; try { days = normPlan(JSON.parse($('#imp').value)); } catch (e) { return toast('Błąd w danych: ' + e.message); }
  if (!days.length) return toast('Plik nie zawiera żadnych dni');
  P().plan.days = d.m === 'replace' ? days : [...P().plan.days, ...days]; save(); closeSheet(true); render(); toast(`Zaimportowano dni: ${days.length}`);
};

// ───────── gotowe plany ─────────
function applyReady(key, mode) {
  const pl = PLANS[key], days = normPlan(pl);
  P().plan.days = mode === 'replace' ? days : [...P().plan.days, ...days];
  Object.assign(P().goals, pl.goals || {});
  if (pl.program && !P().program?.start) P().program = { start: addDays(iso(), -dow(iso())) }; // tydzień 1 zaczyna się w poniedziałek bieżącego tygodnia
  save();
}
A.readyPlans = () => openSheet(`<h2>Gotowe plany</h2><p class="muted">Plan trafia do aktywnego profilu (${esc(profile().name)}). Ustawia też cele dzienne: 2800 kcal, 140 g białka, 8 h snu. Historia treningów zostaje.</p>
  ${Object.entries(PLANS).map(([k, pl]) => `<div class="ready"><b>${esc(pl.name)}</b><span class="muted">${esc(pl.info)}</span><div class="chips"><button class="chip solid" data-a="loadReady" data-k="${k}" data-m="replace">Zastąp obecny plan</button><button class="chip" data-a="loadReady" data-k="${k}" data-m="add">Dodaj do planu</button></div></div>`).join('')}`);
A.loadReady = d => { applyReady(d.k, d.m); closeSheet(true); render(); toast('Wczytano: ' + PLANS[d.k].name); };

// ───────── kopia zapasowa ─────────
A.backup = async () => {
  const ok = await shareFile(`silownia-kopia-${iso()}.json`, { format: 'silownia-backup', version: VERSION, exported: new Date().toISOString(), state: S, images: await allImgs() });
  if (ok) { S.settings.lastBackup = Date.now(); save(); render(); }
};
A.restore = () => pickFile(o => {
  if (o.format !== 'silownia-backup' || !o.state?.profiles) return toast('To nie jest kopia zapasowa tej aplikacji');
  const doIt = async () => { for (const [k, v] of Object.entries(o.images || {})) await putImg(k, v); replaceState(o.state); applyLook(); setTab('home'); toast('Dane przywrócone'); };
  S.profiles.length ? confirmSheet('Przywrócić dane z kopii?', 'Obecne dane wszystkich profili zostaną zastąpione zawartością kopii.', 'Przywróć', doIt) : doIt();
});

// ───────── profile ─────────
A.profiles = () => openSheet(`<h2>Profile</h2><div class="list">${S.profiles.map(p => `<div class="row"><button class="grow plain line" data-a="useProfile" data-id="${p.id}">${avatar(p)}<b>${esc(p.name)}</b>${p.id === S.activeId ? `<span class="pill">aktywny</span>` : ''}</button><button class="icb" data-a="editProfile" data-id="${p.id}" aria-label="Edytuj profil">${ic('edit', 18)}</button></div>`).join('')}
  <button class="row add" data-a="editProfile">${ic('plus', 18)} Dodaj profil</button></div><p class="muted small">Każdy profil ma własny plan, historię i dziennik.</p>`);
A.useProfile = d => { S.activeId = d.id; save(); applyLook(); closeSheet(true); setTab(nav.tab); toast('Profil: ' + profile().name); };
let pe = null;
A.editProfile = d => {
  const p = S.profiles.find(x => x.id === d.id); pe = p ? { ...p } : { id: null, name: '', accent: Object.keys(ACCENTS).find(a => !S.profiles.some(x => x.accent === a)) || 'koral' };
  openSheet(profHTML());
};
const profHTML = () => `<h2>${pe.id ? 'Edycja profilu' : 'Nowy profil'}</h2><label class="fld"><span>Imię</span><input type="text" value="${esc(pe.name)}" data-i="pe" maxlength="24" placeholder="Imię"></label>
  <div class="fld"><span>Kolor akcentu</span><div class="swatches">${Object.entries(ACCENTS).map(([k, c]) => `<button class="${pe.accent === k ? 'on' : ''}" style="--c:${c}" data-a="peAccent" data-k="${k}" aria-label="${k}"></button>`).join('')}</div></div>
  <button class="btn primary" data-a="peSave">Zapisz</button>${pe.id && S.profiles.length > 1 ? `<button class="btn danger ghost" data-a="peDel">Usuń profil</button>` : ''}`;
IN.pe = (d, el) => { pe.name = el.value; };
A.peAccent = d => { pe.accent = d.k; sheetBody().innerHTML = profHTML(); };
A.peSave = () => {
  pe.name = pe.name.trim(); if (!pe.name) return toast('Wpisz imię');
  if (pe.id) Object.assign(S.profiles.find(x => x.id === pe.id), pe); else addProfile(pe.name, pe.accent, false);
  save(); applyLook(); closeSheet(true); setTab(nav.tab);
};
A.peDel = () => confirmSheet(`Usunąć profil „${pe.name}”?`, 'Plan, historia i dziennik tego profilu zostaną trwale usunięte.', 'Usuń profil', () => {
  S.profiles = S.profiles.filter(x => x.id !== pe.id); delete S.data[pe.id]; if (S.activeId === pe.id) S.activeId = S.profiles[0].id; save(true); applyLook(); closeSheet(true); setTab(nav.tab);
});

// ───────── Więcej ─────────
let persisted = null;
screens.more = () => {
  const p = P(), g = p.goals, lb = S.settings.lastBackup;
  return `${large('Więcej', 'Ustawienia i dane')}
  <h3 class="sec">Profil</h3><div class="list"><button class="row" data-a="profiles">${avatar(profile())}<div class="grow"><b>${esc(profile().name)}</b><span class="muted">Dotknij, aby przełączyć lub dodać profil</span></div>${ic('chev', 18)}</button></div>
  <h3 class="sec">Cele dzienne</h3><div class="list">
    ${[['water', 'Woda', 'ml'], ['kcal', 'Kalorie', 'kcal'], ['protein', 'Białko', 'g'], ['sleep', 'Sen', 'h']].map(([k, l, u]) => `<label class="row"><div class="grow"><b>${l}</b></div><input class="inl" inputmode="decimal" value="${fmt(g[k])}" data-c="goal" data-k="${k}"><span class="muted u">${u}</span></label>`).join('')}</div>
  <h3 class="sec">Wygląd i dźwięk</h3><div class="list"><div class="row"><div class="grow"><b>Motyw</b></div><div class="seg">${[['auto', 'Auto'], ['dark', 'Ciemny'], ['light', 'Jasny']].map(([k, l]) => `<button class="${S.settings.theme === k ? 'on' : ''}" data-a="theme" data-k="${k}">${l}</button>`).join('')}</div></div>
    <button class="row" data-a="sound"><div class="grow"><b>Sygnał końca przerwy</b></div><span class="sw ${S.settings.sound ? 'on' : ''}"></span></button></div>
  <h3 class="sec">Tło ekranu Dziś</h3><div class="chips pad"><button class="chip ${(p.homeBg || '').startsWith('img:') ? '' : 'on'}" data-a="homeBg" data-k="">Brak</button><button class="chip ${(p.homeBg || '').startsWith('img:') ? 'on' : ''}" data-a="homeBgPick">${ic('image', 16)} Z telefonu</button></div>
  <p class="muted small foot2">Wybrane zdjęcie zapisuje się tylko w tym telefonie i trafia do kopii zapasowej.</p>
  <h3 class="sec">Apple Zdrowie</h3><div class="list"><button class="row" data-a="health"><div class="grow"><b>Wyślij dzisiejszy dziennik</b><span class="muted">Waga, woda, kalorie i białko przez skrót „Silownia Zdrowie”</span></div>${ic('share', 20)}</button>
    <button class="row" data-a="hw"><div class="grow"><b>Wysyłaj też treningi</b><span class="muted">Włącz tylko wtedy, gdy nie nagrywasz treningu zegarkiem</span></div><span class="sw ${S.settings.healthWorkout ? 'on' : ''}"></span></button></div>
  <h3 class="sec">Program 6-miesięczny</h3><div class="list"><label class="row"><div class="grow"><b>Początek tygodnia 1</b><span class="muted">${(() => { const ph = phase(p); return ph ? (ph.week >= 1 && ph.week <= TOTAL_WEEKS ? `Tydzień ${ph.week} z ${TOTAL_WEEKS} · ` : '') + ph.title : 'Wyłączony'; })()}</span></div><input class="inl date" type="date" value="${p.program?.start || ''}" max="${addDays(iso(), 60)}" data-c="progStart"></label>
    ${p.program?.start ? `<button class="row" data-a="progOff"><div class="grow"><b>Wyłącz program</b><span class="muted">Znikną podpowiedzi etapów i automatyczne zmiany liczby serii</span></div></button>` : ''}</div>
  <p class="muted small foot2">Aplikacja sama odejmuje serię w ćwiczeniach wielostawowych w tygodniach 1–2 i tnie serie o połowę w tygodniach deload (8, 15, 23). ${EARLY_DELOAD}</p>
  <h3 class="sec">Kopia zapasowa</h3><div class="list">
    <button class="row" data-a="backup">${ic('share', 20)}<div class="grow"><b>Zapisz kopię zapasową</b><span class="muted">${lb ? 'Ostatnia: ' + new Date(lb).toLocaleDateString('pl-PL') : 'Jeszcze nie zrobiono kopii'}</span></div></button>
    <button class="row" data-a="restore"><div class="grow"><b>Przywróć z kopii</b><span class="muted">Zastępuje dane wszystkich profili</span></div></button></div>
  <h3 class="sec">Plan</h3><div class="list"><button class="row" data-a="importPlan"><div class="grow"><b>Importuj plan</b></div>${ic('chev', 18)}</button><button class="row" data-a="exportPlan"><div class="grow"><b>Eksportuj plan</b></div>${ic('chev', 18)}</button>
    ${p.plan.days.some(d => d.sample) ? `<button class="row" data-a="dropSample"><div class="grow"><b>Usuń przykładowe dni</b></div></button>` : ''}</div>
  <p class="muted small foot">Siłownia ${VERSION}. Dane są zapisane wyłącznie na tym urządzeniu${persisted === true ? ' w trwałej pamięci' : ''}. Animacje postaci są częścią aplikacji; zdjęcia z biblioteki pochodzą z projektu free-exercise-db (domena publiczna).</p>`;
};
IN.progStart = (d, el) => { if (el.value) { P().program = { start: el.value }; save(); render(); } };
A.progOff = () => { delete P().program; save(); render(); };
IN.goal = (d, el) => { P().goals[d.k] = num(el.value); save(); };
A.theme = d => { S.settings.theme = d.k; save(); applyLook(); render(); };
A.hw = () => { S.settings.healthWorkout = !S.settings.healthWorkout; save(); render(); };
A.sound = () => { S.settings.sound = !S.settings.sound; save(); render(); };

// ───────── start ─────────
(async () => {
  await load();
  await allImgs(); // wczytuje zapisane zdjęcia ćwiczeń do pamięci
  applyLook(); render('fade');
  try { persisted = await navigator.storage?.persisted?.(); } catch (e) {}
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
