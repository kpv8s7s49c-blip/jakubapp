// stats.js — Dziennik dnia oraz Postępy (historia i wykresy)
import { S, P, save, iso, addDays, dow, day as tday, history, exerciseKeys } from './store.js';
import { esc, num, fmt, big, ic, DOW, dateLong, dateShort, clock, chart, spark, ring, confirmSheet, toast, openSheet, closeSheet } from './ui.js';
import { A, IN, screens, cur, render, go, back, setTab, navbar, large } from './core.js';
import { sessVol, sessSets } from './workout.js';

// ───────── Dziennik ─────────
let tDate = null;
const D = () => tDate || iso();
function streak() { let n = 0, d = iso(); const t = P().tracker; if (!t[d]?.creatine) d = addDays(d, -1); while (t[d]?.creatine) { n++; d = addDays(d, -1); } return n; }
screens.tracker = () => {
  const date = D(), t = tday(date), g = P().goals, today = date === iso(), st = streak();
  const prevW = Object.keys(P().tracker).filter(k => k < date && P().tracker[k].weight).sort().at(-1), dW = t.weight && prevW ? t.weight - P().tracker[prevW].weight : null;
  const week = Array.from({ length: 7 }, (_, i) => { const d = addDays(date, i - 6), x = P().tracker[d] || {}, f = Math.min(1, (x.water || 0) / (g.water || 1));
    return `<button class="wk ${d === date ? 'on' : ''}" data-a="tGo" data-d="${d}"><div class="bar"><i style="height:${Math.round(f * 100)}%"></i></div><em class="${x.creatine ? 'on' : ''}"></em><span>${DOW[dow(d)]}</span></button>`; }).join('');
  const meter = (k, label, unit) => `<article class="card"><div class="card-h"><h3>${label}</h3><span class="muted">cel ${big(g[k])} ${unit}</span></div>
    <p class="bign">${big(t[k])}<small> ${unit}</small></p><div class="prog"><i style="width:${Math.min(100, t[k] / (g[k] || 1) * 100)}%"></i></div>
    <div class="addrow"><input inputmode="numeric" placeholder="np. ${k === 'kcal' ? 650 : 30}" id="add-${k}" aria-label="Dodaj ${label}"><button class="chip solid" data-a="tAdd" data-k="${k}">Dodaj</button>${t[k] ? `<button class="chip" data-a="tZero" data-k="${k}">Wyzeruj</button>` : ''}</div></article>`;
  return `${large('Dziennik', today ? 'dziś, ' + dateLong(date) : dateLong(date))}
  <div class="dnav"><button data-a="tGo" data-d="${addDays(date, -1)}" aria-label="Poprzedni dzień">${ic('back', 20)}</button><div class="wkrow">${week}</div><button data-a="tGo" data-d="${addDays(date, 1)}" ${today ? 'disabled' : ''} aria-label="Następny dzień">${ic('chev', 20)}</button></div>
  <p class="muted small legend">Słupki: woda względem celu. Kropka: kreatyna.</p>
  <button class="card crea ${t.creatine ? 'on' : ''}" data-a="creatine" data-d="${date}"><div><h3>Kreatyna</h3><span class="muted">${t.creatine ? 'Wzięta' : 'Jeszcze nie wzięta'}${st > 1 ? ` · seria ${st} dni` : ''}</span></div><span class="bigbox">${t.creatine ? ic('check', 28) : ''}</span></button>
  <article class="card water"><div class="card-h"><h3>Woda</h3><span class="muted">cel ${fmt(g.water / 1000)} l</span></div>
    <div class="wrow">${ring(t.water / (g.water || 1), fmt(t.water / 1000), 'litra')}<div class="wbtn"><button class="btn primary" data-a="water" data-d="${date}" data-n="250">+ 250 ml</button><button class="btn ghost" data-a="water" data-d="${date}" data-n="500">+ 500 ml</button><button class="chip" data-a="water" data-d="${date}" data-n="-250" ${t.water ? '' : 'disabled'}>Cofnij 250 ml</button></div></div></article>
  ${meter('kcal', 'Kalorie', 'kcal')}${meter('protein', 'Białko', 'g')}
  <div class="two"><article class="card"><h3>Waga ciała</h3><div class="inrow"><input inputmode="decimal" value="${t.weight ? fmt(t.weight) : ''}" placeholder="—" data-c="tWeight" aria-label="Waga ciała"><span class="muted">kg</span></div><span class="muted small">${dW === null ? 'rano, na czczo' : (dW > 0 ? '+' : '') + fmt(dW) + ' kg od ostatniego pomiaru'}</span></article>
    <article class="card"><h3>Sen</h3><div class="sleep"><button data-a="tSleep" data-n="-0.5" aria-label="Mniej snu">${ic('minus', 18)}</button><b>${t.sleep ? fmt(t.sleep) : '—'}<small> h</small></b><button data-a="tSleep" data-n="0.5" aria-label="Więcej snu">${ic('plus', 18)}</button></div><span class="muted small">cel ${fmt(g.sleep)} h</span></article></div>
  ${today ? `<button class="btn ghost" data-a="health">${ic('share', 18)} Wyślij dzisiejszy dziennik do Apple Zdrowie</button>` : ''}`;
};
A.tGo = d => { if (d.d > iso()) return; tDate = d.d === iso() ? null : d.d; render(); };
A.creatine = d => { const t = tday(d.d); t.creatine = !t.creatine; save(); render(); };
A.water = d => { const t = tday(d.d); t.water = Math.max(0, t.water + +d.n); save(); render(); if (cur().name === 'home') toast(`Woda: ${fmt(t.water / 1000)} l`); };
A.tAdd = d => { const el = document.getElementById('add-' + d.k), v = Math.round(num(el.value)); if (!v) return el.focus(); tday(D())[d.k] = Math.max(0, tday(D())[d.k] + v); save(); render(); };
A.tZero = d => confirmSheet('Wyzerować ten dzień?', 'Wartość z wybranego dnia wróci do zera.', 'Wyzeruj', () => { tday(D())[d.k] = 0; save(); render(); });
IN.tWeight = (d, el) => { tday(D()).weight = num(el.value) || null; save(); render(); };
A.tSleep = d => { const t = tday(D()); t.sleep = Math.max(0, Math.min(16, (t.sleep ?? P().goals.sleep) + (t.sleep == null ? 0 : +d.n))); save(); render(); };

// ───────── Apple Zdrowie przez Skróty ─────────
// Aplikacja kopiuje dane do schowka jako tekst JSON i uruchamia skrót „Silownia Zdrowie”, który zapisuje je w Zdrowiu.
// Wysyłane są tylko różnice od poprzedniej wysyłki z tego dnia, żeby nic się nie dublowało.
export const SHORTCUT = 'Silownia Zdrowie';
const SUMS = [['water', 'woda', 'Woda', 'ml'], ['kcal', 'kcal', 'Kalorie', 'kcal'], ['protein', 'bialko', 'Białko', 'g']];
let hPending = null;
async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
  try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
}
A.health = async d => {
  const out = {}, lines = []; let mark;
  if (d.w) { const s = P().sessions.find(x => x.id === d.w); if (!s) return; const min = Math.max(1, Math.round((s.end - s.start) / 6e4));
    out.trening_min = min; lines.push(['Trening siłowy', `${min} min`]); if (s.sent) lines.push(['Uwaga', 'ten trening był już wysłany']); mark = () => { s.sent = true; };
  } else { const t = tday(iso()), sent = t.sent || {};
    if (t.weight && t.weight !== sent.weight) { out.waga = t.weight; lines.push(['Waga', fmt(t.weight) + ' kg']); }
    for (const [k, key, label, u] of SUMS) { const dv = (t[k] || 0) - (sent[k] || 0); if (dv > 0) { out[key] = dv; lines.push([label, `${sent[k] ? '+' : ''}${big(dv)} ${u}`]); } }
    mark = () => { t.sent = { weight: t.weight, water: t.water, kcal: t.kcal, protein: t.protein }; };
  }
  if (!lines.length) return openSheet(`<h2>Wszystko już wysłane</h2><p class="muted">Od ostatniej wysyłki w dzisiejszym dzienniku nie przybyło nic nowego. Kreatyny i snu aplikacja nie wysyła: Zdrowie nie ma rodzaju danych dla kreatyny, a sen dokładniej mierzy zegarek.</p>
    <button class="btn ghost" data-a="healthReset">Wyślij dzisiejsze dane jeszcze raz</button><button class="btn ghost" data-a="closeSheet">Zamknij</button>`);
  const ok = await copyText(JSON.stringify(out)); hPending = mark;
  openSheet(`<h2>Do Apple Zdrowie</h2><div class="list">${lines.map(([l, v]) => `<div class="row"><div class="grow"><b>${l}</b></div><span class="muted">${v}</span></div>`).join('')}</div>
    <p class="muted small">${ok ? 'Dane są skopiowane do schowka.' : 'Nie udało się skopiować danych do schowka. Spróbuj ponownie.'} Przycisk poniżej otwiera skrót „${SHORTCUT}”, który zapisuje je w Zdrowiu. Jeśli skrót się nie otworzy, uruchom go ręcznie w aplikacji Skróty i wróć tutaj.</p>
    <a class="btn primary" href="shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT)}" data-a="healthGo">Uruchom skrót</a><button class="btn ghost" data-a="healthDone">Oznacz jako wysłane</button><button class="btn ghost" data-a="closeSheet">Anuluj</button>`);
};
A.healthGo = A.healthDone = () => { hPending?.(); hPending = null; save(true); setTimeout(() => { closeSheet(true); toast('Oznaczono jako wysłane'); }, 400); };
A.healthReset = () => confirmSheet('Wysłać jeszcze raz?', 'Jeśli poprzednia wysyłka się udała, woda, kalorie i białko z dziś zapiszą się w Zdrowiu podwójnie.', 'Wyślij ponownie', () => { delete tday(iso()).sent; save(); closeSheet(true); A.health({}); }, false);

// ───────── Postępy ─────────
let seg = 'ex', metric = 'top';
const segs = (cur, list, act) => `<div class="seg wide">${list.map(([k, l]) => `<button class="${cur === k ? 'on' : ''}" data-a="${act}" data-k="${k}">${l}</button>`).join('')}</div>`;
A.pSeg = d => { seg = d.k; render(); };
A.pMetric = d => { metric = d.k; render(); };
screens.progress = () => {
  const p = P(); let body;
  if (seg === 'ex') {
    const list = exerciseKeys().map(x => ({ ...x, h: history(x.key) })).sort((a, b) => a.h.at(-1).date < b.h.at(-1).date ? 1 : -1);
    body = list.length ? `<div class="list">${list.map(x => { const l = x.h.at(-1); return `<button class="row" data-a="go" data-s="exercise" data-id="${esc(x.key)}"><div class="grow"><b>${esc(x.name)}</b><span class="muted">${l.top ? fmt(l.top) + ' kg × ' + l.reps : l.reps + ' powt.'} · ${dateShort(l.date)}</span></div>${spark(x.h.slice(-12).map(i => i.top || i.reps))}${ic('chev', 18)}</button>`; }).join('')}</div>`
      : `<div class="empty"><b>Jeszcze nic tu nie ma</b>Po pierwszym zapisanym treningu zobaczysz tu historię i wykres każdego ćwiczenia.</div>`;
  } else if (seg === 'ses') {
    const ss = p.sessions.slice().sort((a, b) => b.start - a.start), wk = addDays(iso(), -dow(iso()));
    body = calendar() + `<div class="stats"><div><b>${ss.filter(s => s.date >= wk).length}</b><span>w tym tygodniu</span></div><div><b>${ss.filter(s => s.date >= addDays(iso(), -29)).length}</b><span>ostatnie 30 dni</span></div><div><b>${ss.length}</b><span>łącznie</span></div></div>
      ${ss.length ? `<div class="list">${ss.map(s => `<button class="row" data-a="go" data-s="session" data-id="${s.id}"><div class="grow"><b>${esc(s.dayName)}</b><span class="muted">${dateLong(s.date)} · ${clock(s.end - s.start)} · ${big(sessVol(s))} kg</span></div>${s.prs?.length ? `<span class="pill">rekord</span>` : ''}${ic('chev', 18)}</button>`).join('')}</div>` : `<div class="empty small">Brak zapisanych treningów.</div>`}`;
  } else {
    const keys = Object.keys(p.tracker).sort(), w = keys.filter(k => p.tracker[k].weight).slice(-60).map(k => ({ x: dateShort(k), y: p.tracker[k].weight }));
    const last7 = Array.from({ length: 7 }, (_, i) => p.tracker[addDays(iso(), -i)]).filter(Boolean), avg = k => { const v = last7.map(x => x[k]).filter(Boolean); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
    const wAvg = (from, to) => { const v = []; for (let i = from; i < to; i++) { const x = p.tracker[addDays(iso(), -i)]?.weight; if (x) v.push(x); } return v.length >= 2 ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const a1 = wAvg(0, 7), a0 = wAvg(7, 14), dw = a1 && a0 ? a1 - a0 : null;
    const trend = dw === null ? `<p class="muted small">Waż się codziennie rano. Gdy zbierze się kilka pomiarów z dwóch kolejnych tygodni, zobaczysz tu średnią tygodniową i tempo zmian.</p>`
      : `<div class="tip"><b>Średnia tygodniowa: ${fmt(Math.round(a1 * 10) / 10)} kg (${dw >= 0 ? '+' : ''}${fmt(Math.round(dw * 100) / 100)} kg)</b>${dw < .1 ? 'Poniżej celu 0,15–0,3 kg na tydzień. Jeśli tak jest przez 3 tygodnie, dodaj 100–150 kcal.' : dw > .35 ? 'Powyżej celu 0,15–0,3 kg na tydzień. Jeśli tak jest przez 3 tygodnie (po pierwszych 2 tygodniach kreatyny), odejmij 100–150 kcal.' : 'W celu 0,15–0,3 kg na tydzień. Kalorie bez zmian.'}</div>`;
    body = `<article class="card"><div class="card-h"><h3>Waga ciała</h3><span class="muted">${w.length ? fmt(w.at(-1).y) + ' kg' : ''}</span></div>${chart(w, 'kg')}${trend}</article>
      <h3 class="sec">Średnio z ostatnich 7 dni</h3><div class="stats four"><div><b>${big(avg('kcal'))}</b><span>kcal</span></div><div><b>${fmt(Math.round(avg('water') / 100) / 10)}</b><span>l wody</span></div><div><b>${fmt(Math.round(avg('sleep') * 10) / 10)}</b><span>h snu</span></div><div><b>${last7.filter(x => x.creatine).length}/7</b><span>kreatyna</span></div></div>`;
  }
  return `${large('Postępy', 'Historia i wykresy')}${segs(seg, [['ex', 'Ćwiczenia'], ['ses', 'Kalendarz'], ['body', 'Ciało']], 'pSeg')}${body}`;
};
// ---- kalendarz miesiąca ----
let calM = null;
const hasData = t => t && (t.creatine || t.water || t.kcal || t.protein || t.weight || t.sleep);
function calendar() {
  const p = P(), today = iso(), m = calM || today.slice(0, 7), first = m + '-01', off = dow(first), n = new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
  const cells = Array.from({ length: n }, (_, i) => { const d = m + '-' + String(i + 1).padStart(2, '0'), done = p.sessions.some(s => s.date === d), planned = d > today && p.plan.days.some(x => x.dow?.includes(dow(d)));
    return `<button class="cd ${done ? 'done' : ''} ${d === today ? 'today' : ''} ${d > today ? 'fut' : ''}" data-a="go" data-s="date" data-id="${d}" aria-label="${dateLong(d)}"><b>${i + 1}</b><i class="${done ? '' : hasData(p.tracker[d]) ? 'tr' : planned ? 'pl' : ''}"></i></button>`; }).join('');
  return `<article class="card cal"><div class="cal-h"><button data-a="calNav" data-by="-1" aria-label="Poprzedni miesiąc">${ic('back', 20)}</button><h3>${new Date(first + 'T12:00').toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</h3><button data-a="calNav" data-by="1" aria-label="Następny miesiąc">${ic('chev', 20)}</button></div>
    <div class="cal-g">${DOW.map(l => `<span>${l}</span>`).join('')}${'<em></em>'.repeat(off)}${cells}</div>
    <p class="muted small cal-l"><i class="k done"></i>trening <i class="k tr"></i>wpis w dzienniku <i class="k pl"></i>zaplanowany</p></article>`;
}
A.calNav = d => { const m = calM || iso().slice(0, 7), x = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + +d.by, 1); calM = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'); render(); };

// ---- podgląd wybranego dnia ----
screens.date = q => {
  const d = q.id, p = P(), today = iso(), ss = p.sessions.filter(s => s.date === d).sort((a, b) => a.start - b.start), t = p.tracker[d], planned = p.plan.days.filter(x => x.dow?.includes(dow(d)));
  const sess = ss.map(s => `<h3 class="sec exercises">${esc(s.dayName)}<small>${new Date(s.start).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</small></h3>
    <div class="stats"><div><b>${clock(s.end - s.start)}</b><span>czas</span></div><div><b>${sessSets(s)}</b><span>serie</span></div><div><b>${big(sessVol(s))}</b><span>kg łącznie</span></div></div>
    <div class="list">${s.entries.map(e => `<button class="row" data-a="go" data-s="exercise" data-id="${esc(e.name.trim().toLowerCase())}"><div class="grow"><b>${esc(e.name)}</b><span class="muted">${e.sets.map(x => `${fmt(x.w)} × ${x.r}`).join('  ·  ')}</span></div>${ic('chev', 18)}</button>`).join('')}
    <button class="row add" data-a="go" data-s="session" data-id="${s.id}">Szczegóły treningu</button></div>`).join('');
  const none = d > today ? (planned.length ? '' : `<div class="empty small">Na ten dzień nic nie zaplanowano.</div>`) : ss.length ? '' : `<div class="empty small">${d === today ? 'Dziś jeszcze bez treningu.' : 'Tego dnia nie zapisano treningu.'}</div>`;
  const plan = planned.length && !ss.length ? `<h3 class="sec">${d >= today ? 'W planie' : 'W planie było'}</h3><div class="list">${planned.map(x => `<button class="row" data-a="go" data-s="day" data-id="${x.id}"><div class="grow"><b>${esc(x.name)}</b><span class="muted">${x.exercises.length} ćw. · ${x.exercises.reduce((a, e) => a + (+e.sets || 0), 0)} serii</span></div>${ic('chev', 18)}</button>`).join('')}</div>` : '';
  const v = (x, u) => x ? fmt(x) + (u ? ' ' + u : '') : '—';
  const journal = d > today ? '' : `<h3 class="sec">Dziennik</h3>${hasData(t) ? `<div class="stats six"><div><b>${t.creatine ? 'tak' : '—'}</b><span>kreatyna</span></div><div><b>${v(t.water / 1000, 'l')}</b><span>woda</span></div><div><b>${t.kcal ? big(t.kcal) : '—'}</b><span>kcal</span></div><div><b>${v(t.protein, 'g')}</b><span>białko</span></div><div><b>${v(t.weight, 'kg')}</b><span>waga</span></div><div><b>${v(t.sleep, 'h')}</b><span>sen</span></div></div>` : `<div class="empty small">Brak wpisów w dzienniku.</div>`}
    <button class="btn ghost" data-a="tOpen" data-d="${d}">${hasData(t) ? 'Popraw dziennik tego dnia' : 'Uzupełnij dziennik tego dnia'}</button>`;
  return `${navbar(d === today ? 'Dziś' : dateShort(d))}
  <div class="dswitch"><button data-a="dateGo" data-d="${addDays(d, -1)}" aria-label="Poprzedni dzień">${ic('back', 22)}</button><p>${dateLong(d)}<small>${new Date(d + 'T12:00').getFullYear()}</small></p><button data-a="dateGo" data-d="${addDays(d, 1)}" aria-label="Następny dzień">${ic('chev', 22)}</button></div>
  ${sess}${none}${plan}${journal}`;
};
A.dateGo = d => { cur().p.id = d.d; render(); };
A.tOpen = d => { tDate = d.d === iso() ? null : d.d; setTab('tracker'); };

screens.exercise = q => {
  const h = history(q.id), name = exerciseKeys().find(x => x.key === q.id)?.name || q.id;
  if (!h.length) return navbar(name) + `<div class="empty">Brak zapisanych serii.</div>`;
  const body = h.every(x => !x.top), m = body && metric !== 'vol' ? 'reps' : metric, U = { top: 'kg', e1: 'kg', vol: 'kg', reps: 'powt.' };
  const best = Math.max(...h.map(x => x[m])), l = h.at(-1), f = h[0];
  return `${navbar(name)}
  ${segs(metric, [['top', body ? 'Powtórzenia' : 'Ciężar'], ['e1', 'Szac. 1RM'], ['vol', 'Objętość']].filter(x => !(body && x[0] === 'e1')), 'pMetric')}
  <article class="card"><p class="bign">${m === 'vol' ? big(l[m]) : fmt(l[m])}<small> ${U[m]}</small></p><span class="muted">ostatnio, ${dateShort(l.date)}${h.length > 1 ? ` · ${l[m] - f[m] >= 0 ? '+' : ''}${fmt(l[m] - f[m])} od początku` : ''}</span>${chart(h.map(x => ({ x: dateShort(x.date), y: x[m] })), U[m])}</article>
  <div class="stats"><div><b>${m === 'vol' ? big(best) : fmt(best)}</b><span>rekord</span></div><div><b>${h.length}</b><span>treningów</span></div><div><b>${h.reduce((t, x) => t + x.sets.length, 0)}</b><span>serii</span></div></div>
  <h3 class="sec">Historia</h3><div class="list">${h.slice().reverse().map(x => `<div class="row"><div class="grow"><b>${dateLong(x.date)}</b><span class="muted">${x.sets.map(s => `${fmt(s.w)} × ${s.r}`).join('  ·  ')}</span></div></div>`).join('')}</div>
  ${m === 'e1' ? `<p class="muted small foot">Szacowany maksymalny ciężar na jedno powtórzenie liczony wzorem Epleya: ciężar × (1 + powtórzenia / 30).</p>` : ''}`;
};
screens.session = q => {
  const s = P().sessions.find(x => x.id === q.id); if (!s) return navbar('Trening') + `<div class="empty">Trening usunięty.</div>`;
  return `${navbar(s.dayName)}<p class="lead">${dateLong(s.date)}</p>
  <div class="stats"><div><b>${clock(s.end - s.start)}</b><span>czas</span></div><div><b>${sessSets(s)}</b><span>serie</span></div><div><b>${big(sessVol(s))}</b><span>kg łącznie</span></div></div>
  <div class="list">${s.entries.map(e => `<div class="row"><div class="grow"><b>${esc(e.name)}</b><span class="muted">${e.sets.map(x => `${fmt(x.w)} × ${x.r}`).join('  ·  ')}</span></div></div>`).join('')}</div>
  <button class="btn danger ghost" data-a="delSession">Usuń ten trening z historii</button>`;
};
A.delSession = () => confirmSheet('Usunąć trening?', 'Serie z tego treningu znikną z historii i wykresów.', 'Usuń trening', () => { const id = cur().p.id; P().sessions = P().sessions.filter(x => x.id !== id); save(); back(); });
