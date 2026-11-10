// figures.js — własne animacje techniki (SVG). Każda animacja to dwie pozy, między którymi
// postać płynnie przechodzi. Układ: 200×200, podłoga na y=180. Autor: ten projekt (brak cudzych zasobów).
const parse = s => { const o = {}; s.trim().split(/\s+/).forEach(t => { const [k, v] = t.split(':'); o[k] = v.split(',').map(Number); }); return o; };
const STAND = 'h:101,42 n:100,60 p:100,108 k:100,144 f:100,180 e:101,86 w:103,112';
const FRONT = 'h:100,40 n:100,58 sl:84,62 sr:116,62 p:100,110 pl:92,110 pr:108,110 kl:90,145 kr:110,145 fl:88,180 fr:112,180 el:80,88 wl:78,114 er:120,88 wr:122,114';

const D = (n, a, b, eq = [], v = 'side') => ({ n, v, a, b, eq });
const RAW = {
  squat: D('Przysiad', 'h:102,40 n:100,58 p:100,108 k:102,144 f:100,180 e:109,76 w:98,60', 'h:108,84 n:102,100 p:80,142 k:114,146 e:108,118 w:99,102', [['plate', 'w', 14]]),
  deadlift: D('Martwy ciąg', 'h:124,92 n:114,106 p:78,134 k:110,150 f:100,180 e:114,134 w:114,160', STAND + ' e:102,86 w:104,112', [['plate', 'w', 18]]),
  rdl: D('Rumuński martwy ciąg', STAND, 'h:138,88 n:125,93 p:84,116 k:98,147 e:124,119 w:122,144', [['plate', 'w', 14]]),
  bench: D('Wyciskanie leżąc', 'h:50,128 n:66,132 p:114,134 k:146,138 f:150,180 e:66,105 w:66,80', 'e:86,148 w:74,122', [['R', 38, 140, 86, 7], ['L', 50, 147, 50, 180], ['L', 112, 147, 112, 180], ['plate', 'w', 15]]),
  row: D('Wiosłowanie w opadzie', 'h:134,90 n:122,98 p:82,122 k:106,150 f:100,180 e:123,124 w:122,150', 'e:103,106 w:114,128', [['plate', 'w', 14]]),
  lunge: D('Wykroki', 'h:100,44 n:100,62 p:100,112 k:122,142 f:134,180 k2:84,146 f2:60,174 e:100,88 w:100,114', 'h:100,64 n:100,82 p:100,132 k:133,146 k2:90,167 e:100,108 w:100,134', [['db', 'w']]),
  hipthrust: D('Hip thrust', 'h:46,122 n:62,128 p:100,158 k:128,140 f:134,180 e:82,146 w:100,152', 'p:110,131 k:140,140 e:86,124 w:108,126', [['R', 30, 132, 34, 48], ['plate', 'p', 14]]),
  pushup: D('Pompki', 'h:143,120 n:128,128 p:85,150 k:54,166 f:24,180 e:129,154 w:130,180', 'h:143,156 n:128,162 p:84,168 k:54,174 e:108,150', []),
  plank: D('Deska', 'h:139,138 n:124,146 p:80,156 k:50,168 f:22,180 e:124,177 w:148,177', 'n:124,144 p:80,153 h:139,136', []),
  crunch: D('Brzuszki', 'h:38,168 n:54,172 p:100,174 k:126,148 f:150,177 e:50,156 w:40,160', 'h:52,134 n:62,150 e:66,134 w:56,130', []),
  curl: D('Uginanie ramion', STAND + ' e:100,88 w:102,114', 'w:113,65', [['db', 'w']]),
  pushdown: D('Prostowanie ramion na wyciągu', 'h:109,42 n:104,60 p:98,108 k:100,144 f:98,180 e:108,88 w:127,74', 'w:113,114', [['L', 154, 14, 154, 180], ['L', 154, 18, 140, 18], ['cable', 140, 18, 'w']]),
  legpress: D('Suwnica', 'h:48,88 n:52,106 p:70,150 k:100,124 f:122,148 e:62,134 w:76,152', 'k:107,146 f:142,148', [['L', 60, 156, 42, 108], ['L', 44, 164, 92, 164], ['pad', 'f']]),
  legext: D('Prostowanie nóg', 'h:78,62 n:78,80 p:80,128 k:116,128 f:116,164 e:78,106 w:88,126', 'f:151,122', [['R', 68, 134, 50, 7], ['L', 72, 141, 72, 180], ['L', 112, 141, 112, 180], ['L', 68, 134, 64, 84], ['pad', 'f']]),
  legcurl: D('Uginanie nóg leżąc', 'h:150,128 n:136,132 p:90,134 k:56,136 f:22,138 e:140,146 w:152,140', 'f:62,102', [['R', 44, 142, 108, 7], ['L', 56, 149, 56, 180], ['L', 140, 149, 140, 180], ['pad', 'f']]),
  calf: D('Wspięcia na palce', STAND, 'h:101,34 n:100,52 p:100,100 k:100,136 e:101,78 w:103,104', [['R', 84, 180, 34, 6]]),
  dip: D('Pompki na poręczach', 'h:102,38 n:100,56 p:98,104 k:104,136 f:86,160 e:100,84 w:100,110', 'h:113,74 n:106,90 p:98,136 k:106,164 f:88,178 e:84,92', [['L', 72, 112, 132, 112], ['L', 132, 112, 132, 180]]),
  cablerow: D('Wiosłowanie siedząc', 'h:80,86 n:76,104 p:70,150 k:104,138 f:136,156 e:100,116 w:126,122', 'h:66,85 n:66,103 e:54,124 w:80,126', [['L', 50, 158, 110, 158], ['L', 141, 140, 141, 172], ['L', 156, 100, 156, 180], ['cable', 156, 124, 'w']]),
  legraise: D('Unoszenie nóg w zwisie', 'h:105,54 n:100,68 p:100,116 k:100,150 f:100,178 e:100,42 w:100,16', 'k:133,110 f:162,104', [['L', 60, 16, 140, 16]]),
  ohp: D('Wyciskanie nad głowę', FRONT + ' el:74,86 wl:76,58 er:126,86 wr:124,58', 'el:76,38 wl:78,10 er:124,38 wr:122,10', [['barF', 22, 1]], 'front'),
  pullup: D('Podciąganie', 'h:100,56 n:100,70 sl:84,72 sr:116,72 p:100,122 pl:92,122 pr:108,122 kl:92,152 kr:108,152 fl:92,178 fr:108,178 el:76,46 er:124,46 wl:68,20 wr:132,20', 'h:100,22 n:100,36 sl:84,38 sr:116,38 p:100,88 pl:92,88 pr:108,88 kl:92,118 kr:108,118 fl:92,144 fr:108,144 el:62,54 er:138,54', [['L', 44, 20, 156, 20]], 'front'),
  latpulldown: D('Ściąganie drążka', 'h:100,70 n:100,88 sl:84,92 sr:116,92 p:100,140 pl:90,140 pr:110,140 kl:86,152 kr:114,152 fl:84,180 fr:116,180 el:74,66 er:126,66 wl:64,42 wr:136,42', 'el:66,112 er:134,112 wl:70,84 wr:130,84', [['R', 78, 148, 44, 7], ['cableM', 100, 6], ['barF', 8, 0]], 'front'),
  lateral: D('Wznosy bokiem', FRONT, 'el:58,66 wl:32,64 er:142,66 wr:168,64', [['db', 'wl'], ['db', 'wr']], 'front'),
  armopen: D('Krążenia / otwarcie ramion', FRONT, 'el:58,64 wl:32,58 er:142,64 wr:168,58', [], 'front'),
  jacks: D('Pajacyki', FRONT, 'el:64,46 wl:52,22 er:136,46 wr:148,22 kl:80,144 fl:66,178 kr:120,144 fr:134,178', [], 'front'),
  bend: D('Skłon w przód', STAND, 'h:134,160 n:126,146 p:94,108 k:98,144 e:122,160 w:116,177', []),
  run: D('Bieg / cardio', 'h:108,42 n:104,60 p:100,108 k:120,134 f:110,166 k2:92,142 f2:70,160 e:92,84 w:112,96', 'k:92,142 f:70,160 k2:120,134 f2:110,166 e:116,84 w:124,62', []),
  // --- ruchy z planu hipertroficznego ---
  hacksquat: D('Hack squat', 'h:76,51 n:82,68 p:102,112 k:120,142 f:132,174 e:96,86 w:90,64', 'h:90,82 n:96,99 p:116,143 k:148,140 e:110,117 w:104,95', [['L', 62, 36, 124, 172], ['B', 122, 182, 150, 170], ['db', 'n']]),
  inclinepress: D('Wyciskanie hantli na skosie', 'h:56,98 n:70,110 p:112,134 k:146,132 f:150,176 e:71,84 w:72,58', 'e:86,128 w:82,102', [['B', 58, 120, 108, 148], ['B', 108, 148, 128, 148], ['L', 72, 130, 72, 180], ['L', 120, 150, 120, 180], ['db', 'w']]),
  csrow: D('Wiosłowanie z podparciem klatki', 'h:126,100 n:112,112 p:72,140 k:46,164 f:20,180 e:114,138 w:116,164', 'e:94,106 w:110,128', [['B', 78, 149, 118, 121], ['L', 112, 128, 112, 180], ['L', 84, 148, 84, 180], ['db', 'w']]),
  seatedlegcurl: D('Uginanie nóg siedząc', 'h:78,62 n:78,80 p:80,128 k:116,128 f:152,124 e:78,106 w:88,126', 'f:104,160', [['R', 68, 134, 50, 7], ['L', 72, 141, 72, 180], ['L', 112, 141, 112, 180], ['L', 68, 134, 64, 84], ['B', 98, 116, 120, 116], ['pad', 'f', 0, 15, -7, 0]]),
  cablelateral: D('Wznosy bokiem na wyciągu', FRONT, 'er:142,66 wr:168,64', [['L', 26, 40, 26, 180], ['cable', 26, 174, 'wr'], ['db', 'wr']], 'front'),
  inclinecurl: D('Uginanie ramion na ławce skośnej', 'h:68,76 n:76,92 p:100,134 k:136,134 f:138,176 e:76,119 w:78,145', 'w:93,98', [['B', 64, 94, 92, 146], ['B', 92, 147, 116, 147], ['L', 104, 150, 104, 180], ['db', 'w']]),
  ohtriceps: D('Prostowanie ramion nad głową', 'h:90,68 n:88,86 p:90,134 k:126,134 f:128,176 e:96,60 w:72,50', 'w:104,35', [['L', 36, 60, 36, 180], ['B', 78, 86, 78, 136], ['B', 78, 141, 112, 141], ['L', 96, 144, 96, 180], ['cable', 36, 150, 'w']]),
  bulgarian: D('Przysiad bułgarski', 'h:104,44 n:102,62 p:100,112 k:120,144 f:128,180 k2:82,144 f2:52,136 e:102,88 w:102,114', 'h:108,68 n:104,86 p:98,134 k:132,146 k2:76,164 e:104,112 w:104,138', [['R', 34, 140, 34, 8], ['L', 40, 148, 40, 180], ['L', 62, 148, 62, 180], ['db', 'w']]),
  seatedpress: D('Wyciskanie siedząc z oparciem', 'h:100,70 n:100,88 sl:84,92 sr:116,92 p:100,140 pl:90,140 pr:110,140 kl:86,152 kr:114,152 fl:84,180 fr:116,180 el:70,112 wl:68,86 er:130,112 wr:132,86', 'el:74,66 wl:80,40 er:126,66 wr:120,40', [['R', 82, 76, 36, 66], ['R', 78, 148, 44, 7], ['db', 'wl'], ['db', 'wr']], 'front'),
  reversefly: D('Odwrotne rozpiętki', 'h:100,70 n:100,88 sl:84,92 sr:116,92 p:100,140 pl:90,140 pr:110,140 kl:86,152 kr:114,152 fl:84,180 fr:116,180 el:88,104 wl:95,96 er:112,104 wr:105,96', 'el:58,92 wl:32,90 er:142,92 wr:168,90', [['R', 78, 148, 44, 7], ['L', 100, 150, 100, 180], ['pad', 'wl', 0, 12, 0, 0], ['pad', 'wr', 0, 12, 0, 0]], 'front'),
  fly: D('Rozpiętki na wyciągu', FRONT + ' el:60,74 wl:36,60 er:140,74 wr:164,60', 'el:78,96 wl:96,114 er:122,96 wr:104,114', [['L', 12, 20, 12, 180], ['L', 188, 20, 188, 180], ['cable', 12, 26, 'wl'], ['cable', 188, 26, 'wr'], ['db', 'wl'], ['db', 'wr']], 'front'),
  pallof: D('Pallof press', 'h:102,42 n:100,60 p:98,108 k:104,144 f:100,180 e:103,86 w:112,70', 'e:124,70 w:150,68', [['db', 'w']]),
  legpress45: D('Leg press 45°', 'h:30,106 n:40,122 p:72,158 k:98,134 f:122,108 e:56,146 w:72,160', 'k:66,123 f:101,129', [['B', 66, 165, 34, 129], ['B', 66, 167, 88, 167], ['L', 100, 174, 166, 108], ['pad', 'f', 12, 12, 4, -4]]),
  dbrow: D('Wiosłowanie jednorącz', 'h:134,102 n:118,108 p:70,112 k:74,146 f:70,180 k2:74,138 f2:44,134 e2:119,122 w2:120,138 e:118,134 w:118,160', 'e:102,98 w:112,122', [['R', 40, 140, 96, 8], ['L', 52, 148, 52, 180], ['L', 126, 148, 126, 180], ['db', 'w']]),
  seatedlateral: D('Wznosy bokiem siedząc', 'h:100,70 n:100,88 sl:84,92 sr:116,92 p:100,140 pl:90,140 pr:110,140 kl:86,152 kr:114,152 fl:84,180 fr:116,180 el:78,118 wl:76,144 er:122,118 wr:124,144', 'el:58,96 wl:32,92 er:142,96 wr:168,92', [['R', 78, 148, 44, 7], ['db', 'wl'], ['db', 'wr']], 'front'),
  preacher: D('Uginanie na modlitewniku', 'h:90,72 n:82,88 p:70,134 k:104,134 f:106,176 e:106,104 w:128,118', 'w:110,78', [['B', 84, 99, 106, 115], ['L', 98, 112, 98, 180], ['B', 58, 141, 86, 141], ['L', 72, 144, 72, 180], ['plate', 'w', 8]]),
  calfpress: D('Wspięcia na leg pressie', 'h:30,106 n:40,122 p:72,158 k:96,132 f:118,112 e:56,146 w:72,160', 'k:100,130 f:127,103', [['B', 66, 165, 34, 129], ['B', 66, 167, 88, 167], ['L', 100, 174, 166, 108], ['pad', 'f', 12, 12, 4, -4]]),
  bike: D('Rower / orbitrek', 'h:116,56 n:106,70 p:84,112 k:116,128 f:116,156 k2:112,116 f2:92,144 e:122,86 w:136,92', 'k:112,116 f:92,144 k2:116,128 f2:116,156', [['L', 84, 118, 102, 150], ['L', 102, 150, 134, 150], ['L', 138, 92, 134, 150], ['B', 74, 116, 94, 116], ['B', 66, 182, 152, 182], ['L', 102, 150, 102, 180]]),
  curlup: D('Curl-up McGilla', 'h:40,170 n:56,172 p:102,174 k:126,150 f:146,176 k2:138,174 f2:172,175 e:76,178 w:96,177', 'h:45,157 n:59,165', []),
  sidebridge: D('Side bridge', 'h:44,142 n:56,152 p:100,175 k:132,177 f:164,178 e:56,178 w:82,178', 'h:44,146 p:103,163 k:138,171', []),
  birddog: D('Bird dog', 'h:142,130 n:126,138 p:78,140 k:78,176 f:44,178 k2:78,176 f2:44,178 e:127,160 w:126,180 e2:127,160 w2:126,180', 'k:44,142 f:10,144 e2:152,134 w2:178,132', []),
};
export const ANIMS = {};
for (const [k, d] of Object.entries(RAW)) { const a = parse(d.a); ANIMS[k] = { ...d, a, b: { ...a, ...parse(d.b) } }; }
export const ANIM_LIST = Object.entries(ANIMS).map(([key, d]) => ({ key, name: d.n }));

const RULES = [
  ['hacksquat', /hack|pendulum|belt squat/], ['inclinepress', /skos|skośn.*wycisk|wycisk.*skośn/], ['csrow', /podparciem klatki|t-bar/], ['seatedlegcurl', /uginanie n[oó]g siedz/],
  ['cablelateral', /wznosy.*wyci[aą]g/], ['seatedlateral', /wznosy.*siedz/], ['inclinecurl', /uginanie ramion.*skośn/], ['ohtriceps', /nad g[lł]ow[aą].*wyci[aą]g|prostowanie ramion nad/],
  ['bulgarian', /bułgar/], ['seatedpress', /wyciskanie siedz/], ['reversefly', /odwrotne rozpi/], ['fly', /rozpi[eę]tki|pec deck/], ['pallof', /pallof/], ['legpress45', /leg press 45/],
  ['calfpress', /wspi[eę]cia.*(leg press|suwnic)/], ['dbrow', /jednor[aą]cz/], ['preacher', /modlitewnik|bayesian/], ['bike', /rower|orbitrek/], ['curlup', /curl-?up/], ['sidebridge', /side bridge|deska bokiem/], ['birddog', /bird ?dog/],
  ['hipthrust', /hip thrust|unoszenie bioder|mostek/], ['legpress', /suwnic|leg press|wypychanie/], ['legext', /prostowanie n[oó]g|wyprost.* n[oó]g|leg ext/],
  ['legcurl', /uginanie n[oó]g|leg curl/], ['calf', /łyd|wspięci|calf/], ['lunge', /wykrok|zakrok|bułgar|lunge|split/], ['squat', /przysiad|squat/],
  ['rdl', /rumu[nń]|rdl|dzień dobry/], ['deadlift', /martwy|deadlift/], ['pullup', /podci[aą]g|pull.?up|chin/], ['latpulldown', /ści[aą]ganie|lat pull/],
  ['cablerow', /siedz.*wios|wios.*siedz|seated row/], ['row', /wios[lł]|row/], ['dip', /por[eę]cz|dip/], ['pushup', /pomp/],
  ['ohp', /nad g[lł]ow|żołnier|ohp|overhead|arnold/], ['bench', /wycisk|bench/], ['lateral', /wznos|odwodzenie|lateral/],
  ['pushdown', /triceps|prostowanie ramion|pushdown/], ['legraise', /unoszenie (n[oó]g|kolan)|leg raise/], ['curl', /uginanie|biceps|curl/],
  ['plank', /desk|plank/], ['crunch', /brzusz|spięci|crunch/], ['jacks', /pajac/], ['run', /bieg|bieżni|rower|orbitrek|cardio|skakank|marsz/],
  ['bend', /skłon|dwugłow/], ['armopen', /kr[aą]żeni|klatk|ramion/],
];
export function guessAnim(name) { const s = String(name || '').toLowerCase(); for (const [k, re] of RULES) if (re.test(s)) return k; return ''; }

export function figure(key, cls = '') {
  if (!ANIMS[key]) return `<div class="fig none ${cls}"><span>brak animacji</span></div>`;
  return `<svg class="fig ${cls}" data-k="${key}" viewBox="0 0 200 200" aria-label="${ANIMS[key].n}"></svg>`;
}

const NS = 'http://www.w3.org/2000/svg';
const el = (svg, tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); svg.appendChild(e); return e; };
function build(svg, d) {
  svg.innerHTML = '';
  const r = { chains: [], eq: [] };
  const floor = el(svg, 'line', 'st'); floor.setAttribute('x1', 14); floor.setAttribute('x2', 186); floor.setAttribute('y1', 186); floor.setAttribute('y2', 186);
  for (const q of d.eq) {
    if (q[0] === 'L') { const e = el(svg, 'line', 'st'); ['x1', 'y1', 'x2', 'y2'].forEach((a, i) => e.setAttribute(a, q[i + 1])); }
    if (q[0] === 'B') { const e = el(svg, 'line', 'st stb'); ['x1', 'y1', 'x2', 'y2'].forEach((a, i) => e.setAttribute(a, q[i + 1])); }
    if (q[0] === 'R') { const e = el(svg, 'rect', 'stf'); ['x', 'y', 'width', 'height'].forEach((a, i) => e.setAttribute(a, q[i + 1])); e.setAttribute('rx', 3); }
  }
  const chain = (pts, cls) => { if (pts.every(p => d.a[p])) r.chains.push({ pts, e: el(svg, 'polyline', cls) }); };
  if (d.v === 'front') {
    chain(['pl', 'kl', 'fl'], 'b'); chain(['pr', 'kr', 'fr'], 'b'); chain(['n', 'p'], 'b t'); chain(['sl', 'sr'], 'b'); chain(['pl', 'pr'], 'b');
    r.head = el(svg, 'circle', 'hd'); chain(['sl', 'el', 'wl'], 'b'); chain(['sr', 'er', 'wr'], 'b');
  } else {
    chain(['p', 'k2', 'f2'], 'b far'); chain(['n', 'e2', 'w2'], 'b far'); chain(['n', 'p'], 'b t'); r.head = el(svg, 'circle', 'hd'); chain(['p', 'k', 'f'], 'b'); chain(['n', 'e', 'w'], 'b');
  }
  r.head.setAttribute('r', 10.5);
  for (const q of d.eq) {
    if (q[0] === 'plate') r.eq.push({ q, e: el(svg, 'circle', 'eq'), c: el(svg, 'circle', 'eqf') });
    if (q[0] === 'db') r.eq.push({ q, e: el(svg, 'circle', 'eqf') });
    if (q[0] === 'pad' || q[0] === 'cable' || q[0] === 'cableM') r.eq.push({ q, e: el(svg, 'line', q[0] === 'pad' ? 'eq thick' : 'eq thin') });
    if (q[0] === 'barF') r.eq.push({ q, e: el(svg, 'line', 'eq'), l: el(svg, 'line', 'eq thick'), r: el(svg, 'line', 'eq thick') });
  }
  svg._r = r;
}
const set = (e, o) => { for (const k in o) e.setAttribute(k, o[k]); };
function update(svg, d, t) {
  const r = svg._r, P = k => { const a = d.a[k], b = d.b[k]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  for (const c of r.chains) c.e.setAttribute('points', c.pts.map(p => P(p).map(v => v.toFixed(1)).join(',')).join(' '));
  const h = P('h'); set(r.head, { cx: h[0], cy: h[1] });
  for (const x of r.eq) {
    const q = x.q;
    if (q[0] === 'plate') { const p = P(q[1]); set(x.e, { cx: p[0], cy: p[1], r: q[2] }); set(x.c, { cx: p[0], cy: p[1], r: 3 }); }
    else if (q[0] === 'db') { const p = P(q[1]); set(x.e, { cx: p[0], cy: p[1], r: 6.5 }); }
    else if (q[0] === 'pad') { const p = P(q[1]), dx = q[2] ?? 0, dy = q[3] ?? 17, ox = q[4] ?? 6, oy = q[5] ?? 0; set(x.e, { x1: p[0] + ox - dx, y1: p[1] + oy - dy, x2: p[0] + ox + dx, y2: p[1] + oy + dy }); }
    else if (q[0] === 'cable') { const p = P(q[3]); set(x.e, { x1: q[1], y1: q[2], x2: p[0], y2: p[1] }); }
    else {
      const a = P('wl'), b = P('wr'), y = (a[1] + b[1]) / 2;
      if (q[0] === 'cableM') set(x.e, { x1: q[1], y1: q[2], x2: 100, y2: y });
      else { set(x.e, { x1: a[0] - q[1], y1: y, x2: b[0] + q[1], y2: y }); const hgt = q[2] ? 13 : 0;
        set(x.l, { x1: a[0] - q[1] + 4, x2: a[0] - q[1] + 4, y1: y - hgt, y2: y + hgt }); set(x.r, { x1: b[0] + q[1] - 4, x2: b[0] + q[1] - 4, y1: y - hgt, y2: y + hgt }); }
    }
  }
}
const PERIOD = 2800;
function tick(now) {
  const figs = document.querySelectorAll('svg.fig');
  if (figs.length) {
    const ph = (now % PERIOD) / PERIOD; let u = ph < .42 ? ph / .42 : ph < .5 ? 1 : ph < .92 ? 1 - (ph - .5) / .42 : 0;
    u = u * u * (3 - 2 * u);
    if (typeof window.__figT === 'number') u = window.__figT; // do testów: zatrzymanie w wybranej fazie
    for (const svg of figs) { const d = ANIMS[svg.dataset.k]; if (!d) continue; if (!svg._r) build(svg, d); update(svg, d, u); }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
