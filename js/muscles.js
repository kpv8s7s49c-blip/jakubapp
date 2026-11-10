// muscles.js — partie mięśniowe: nazwy, domyślne przypisania do animacji i mapa ciała (przód / tył)
import { esc } from './ui.js';
export const MUSCLES = {
  chest: 'Klatka', back: 'Najszersze grzbietu', traps: 'Góra pleców', lower: 'Prostowniki grzbietu', delts: 'Barki', rdelts: 'Tył barków',
  biceps: 'Biceps', triceps: 'Triceps', forearms: 'Przedramiona', abs: 'Brzuch', obliques: 'Skośne brzucha',
  glutes: 'Pośladki', quads: 'Czworogłowe', hams: 'Dwugłowe uda', calves: 'Łydki',
};
const M = (p, s = '') => ({ p: p.split(' ').filter(Boolean), s: s.split(' ').filter(Boolean) });
const BY_ANIM = {
  squat: M('quads glutes', 'hams lower abs'), deadlift: M('hams glutes lower', 'back traps quads forearms'), rdl: M('hams glutes', 'lower forearms'),
  bench: M('chest', 'triceps delts'), row: M('back traps', 'biceps rdelts lower'), lunge: M('quads glutes', 'hams'), hipthrust: M('glutes', 'hams'),
  pushup: M('chest', 'triceps delts abs'), plank: M('abs', 'obliques'), crunch: M('abs'), curl: M('biceps', 'forearms'), pushdown: M('triceps'),
  legpress: M('quads', 'glutes'), legext: M('quads'), legcurl: M('hams', 'calves'), calf: M('calves'), dip: M('chest triceps', 'delts'),
  cablerow: M('back', 'traps biceps rdelts'), legraise: M('abs', 'obliques'), ohp: M('delts', 'triceps traps'), pullup: M('back', 'biceps forearms'),
  latpulldown: M('back', 'biceps rdelts'), lateral: M('delts'), bend: M('', 'hams'), run: M('', 'quads calves'), bike: M('', 'quads calves glutes'),
  hacksquat: M('quads', 'glutes'), inclinepress: M('chest', 'delts triceps'), csrow: M('back traps', 'biceps rdelts'), seatedlegcurl: M('hams'),
  cablelateral: M('delts'), inclinecurl: M('biceps', 'forearms'), ohtriceps: M('triceps'), bulgarian: M('quads glutes', 'hams'),
  seatedpress: M('delts', 'triceps'), reversefly: M('rdelts', 'traps'), fly: M('chest', 'delts'), pallof: M('obliques abs'),
  legpress45: M('quads', 'glutes hams'), dbrow: M('back', 'biceps rdelts traps'), seatedlateral: M('delts'), preacher: M('biceps', 'forearms'),
  calfpress: M('calves'), curlup: M('abs'), sidebridge: M('obliques', 'abs'), birddog: M('lower glutes', 'abs'),
};
export const defaultMuscles = anim => BY_ANIM[anim] || { p: [], s: [] };
export const musclesOf = x => (x.muscles && (x.muscles.p?.length || x.muscles.s?.length)) ? x.muscles : defaultMuscles(x.anim);
const LIB_MAP = { abdominals: 'abs', hamstrings: 'hams', calves: 'calves', quadriceps: 'quads', glutes: 'glutes', chest: 'chest', lats: 'back', 'middle back': 'traps', 'lower back': 'lower', traps: 'traps', shoulders: 'delts', biceps: 'biceps', triceps: 'triceps', forearms: 'forearms' };
export const fromLib = (prim = [], sec = []) => { const p = [...new Set(prim.map(m => LIB_MAP[m]).filter(Boolean))]; return { p, s: [...new Set(sec.map(m => LIB_MAP[m]).filter(Boolean))].filter(m => !p.includes(m)) }; };

export const musLine = x => { const m = musclesOf(x); return m.p.length ? `<span class="mus-l">${m.p.map(k => MUSCLES[k]).join(', ')}</span>` : ''; };
export const musChips = x => { const m = musclesOf(x); if (!m.p.length && !m.s.length) return '';
  return `<div class="mus">${m.p.map(k => `<span class="p">${esc(MUSCLES[k])}</span>`).join('')}${m.s.map(k => `<span>${esc(MUSCLES[k])}</span>`).join('')}</div>`; };

// Mapa ciała: proste kształty. [mięsień | '', typ, parametry]; e = elipsa (cx, cy, rx, ry, obrót), r = prostokąt (x, y, w, h, promień)
const sym = (k, cx, dx, cy, rx, ry, rot = 0) => [[k, 'e', cx - dx, cy, rx, ry, rot], [k, 'e', cx + dx, cy, rx, ry, -rot]];
const FRONT = c => [['', 'e', c, 21, 10, 11], ['', 'r', c - 4, 30, 8, 9, 3], ...sym('delts', c, 20, 47, 8, 7.5), ['chest', 'r', c - 14.5, 42, 14, 17, 6], ['chest', 'r', c + .5, 42, 14, 17, 6],
  ['abs', 'r', c - 8.5, 61, 17, 31, 6], ['obliques', 'r', c - 15, 61, 5.5, 27, 2.7], ['obliques', 'r', c + 9.5, 61, 5.5, 27, 2.7],
  ...sym('biceps', c, 24.5, 66, 5.5, 11.5, 8), ...sym('forearms', c, 29.5, 92, 4.6, 12.5, 6), ...sym('', c, 32, 109, 4, 4.5), ['', 'r', c - 14, 93, 28, 10, 5],
  ...sym('quads', c, 8.5, 125, 8, 22, 3), ...sym('', c, 9.5, 168, 5.5, 17)];
const BACK = c => [['', 'e', c, 21, 10, 11], ['traps', 'r', c - 10, 33, 20, 17, 7], ...sym('rdelts', c, 20, 47, 8, 7.5), ['back', 'r', c - 14.5, 52, 14, 25, 6], ['back', 'r', c + .5, 52, 14, 25, 6],
  ['lower', 'r', c - 7.5, 79, 15, 14, 5], ...sym('triceps', c, 24.5, 66, 5.5, 11.5, 8), ...sym('forearms', c, 29.5, 92, 4.6, 12.5, 6), ...sym('', c, 32, 109, 4, 4.5),
  ...sym('glutes', c, 7.5, 101, 8.5, 9.5), ...sym('hams', c, 8.5, 130, 7.6, 18, 3), ...sym('calves', c, 9.5, 167, 6.2, 16)];
const SHAPES = [...FRONT(52), ...BACK(148)];
export function bodyMap(x, cls = '') {
  const m = musclesOf(x); if (!m.p.length && !m.s.length) return '';
  const shape = ([k, t, a, b, c, d, e]) => { const cl = m.p.includes(k) ? 'p' : m.s.includes(k) ? 's' : k ? 'm' : 'n';
    return t === 'e' ? `<ellipse class="${cl}" cx="${a}" cy="${b}" rx="${c}" ry="${d}"${e ? ` transform="rotate(${e} ${a} ${b})"` : ''}/>` : `<rect class="${cl}" x="${a}" y="${b}" width="${c}" height="${d}" rx="${e}"/>`; };
  return `<svg class="bmap ${cls}" viewBox="0 0 200 200" role="img" aria-label="Pracujące mięśnie: ${esc(m.p.concat(m.s).map(k => MUSCLES[k]).join(', '))}">${SHAPES.map(shape).join('')}<text x="52" y="197">przód</text><text x="148" y="197">tył</text></svg>`;
}
