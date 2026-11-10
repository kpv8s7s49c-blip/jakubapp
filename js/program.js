// program.js — zasady z planu: etapy 6-miesięczne (tygodnie) i progresja podwójna
import { iso } from './store.js';

const PHASES = [
  [1, 2, 'intro', 'Wprowadzenie', 'W ćwiczeniach wielostawowych o 1 serię mniej, RIR 3. Cel: technika, tolerancja pleców i ustalenie ciężarów.'],
  [3, 7, 'block', 'Blok 1', 'Pełny plan. RIR 2 → 1, w izolacjach 1 → 0. Progresja podwójna co tydzień.'],
  [8, 8, 'deload', 'Deload', 'Około połowy serii, RIR 3–4. Tydzień na regenerację.'],
  [9, 14, 'block', 'Blok 2', 'Dołóż po 1 serii na 3–4 priorytetowe partie (klatka, plecy, barki, ramiona). RIR 2 → 1. Możesz rotować warianty, np. hack squat i belt squat.'],
  [15, 15, 'deload', 'Deload', 'Około połowy serii, RIR 3–4. Tydzień na regenerację.'],
  [16, 22, 'block', 'Blok 3', 'Kolejne +1 seria na wybrane partie, do ok. 16 serii frakcyjnych tygodniowo. RIR 2 → 0–1 w izolacjach. Oceń postępy i skoryguj dietę.'],
  [23, 23, 'deload', 'Deload i ewaluacja', 'Około połowy serii, RIR 3–4. Pomiary, zdjęcia i decyzja o kolejnym etapie.'],
];
export const TOTAL_WEEKS = 23;
export const EARLY_DELOAD = 'Zrób deload wcześniej, gdy siła spada przez 2 treningi z rzędu, sen się pogarsza albo plecy dają więcej sygnałów niż zwykle.';

// Bieżący etap programu dla profilu (albo null, gdy program jest wyłączony)
export function phase(p, date = iso()) {
  const start = p.program?.start; if (!start) return null;
  const week = Math.floor((Date.parse(date) - Date.parse(start)) / 6048e5) + 1;
  if (week < 1) return { week: 0, key: 'wait', title: 'Program jeszcze się nie zaczął', text: `Start: ${start}.` };
  if (week > TOTAL_WEEKS) return { week, key: 'done', title: 'Program ukończony', text: 'Minęły 23 tygodnie. Zrób pomiary i zdjęcia, oceń postępy i ustaw nową datę startu, jeśli zaczynasz kolejny cykl.' };
  const f = PHASES.find(x => week >= x[0] && week <= x[1]);
  return { week, key: f[2], title: f[3], text: f[4] };
}
// Liczba serii na dziś: wprowadzenie odejmuje serię w wielostawowych, deload tnie serie o połowę
export function setsFor(x, ph) {
  const n = Math.max(1, +x.sets || 1);
  if (ph?.key === 'intro' && x.compound) return Math.max(1, n - 1);
  if (ph?.key === 'deload') return Math.max(1, Math.ceil(n / 2));
  return n;
}
export function repRange(reps) {
  const m = String(reps).match(/(\d+)\s*[–-]\s*(\d+)/), lo = m ? +m[1] : parseInt(reps) || 0;
  return { lo, hi: m ? +m[2] : lo };
}
// Progresja podwójna: najpierw powtórzenia do górnej granicy we wszystkich seriach, potem +2,5–5% ciężaru i powrót do dolnej granicy
export function progression(x, last, ph) {
  const { lo, hi } = repRange(x.reps), f = n => String(Math.round(n * 100) / 100).replace('.', ',');
  if (ph?.key === 'deload') return { tip: 'Deload: zostaw ciężar z ostatniego treningu albo nieco go zmniejsz i kończ serie z dużym zapasem (RIR 3–4).' };
  if (!last) return { tip: `Pierwszy raz: dobierz ciężar, z którym mieścisz się w zakresie ${x.reps} powt.${x.rir ? ` z zapasem RIR ${ph?.key === 'intro' ? 3 : x.rir}` : ''}.` };
  const w = Math.max(...last.sets.map(s => s.w));
  if (hi && last.sets.length >= Math.min(2, +x.sets || 1) && last.sets.every(s => s.r >= hi)) {
    if (!w) return { tip: `Ostatnio wszystkie serie po ${hi} powt. Dołóż obciążenie albo utrudnij wariant i wróć do ${lo} powt.` };
    let up = w >= 40 ? Math.round(w * 1.05 / 2.5) * 2.5 : Math.round(w * 1.05); if (up <= w) up = w + (w >= 40 ? 2.5 : 1); // lżejsze ciężary: krok 1 kg, cięższe: 2,5 kg
    return { tip: `Ostatnio wszystkie serie po ${hi} powt. Czas dołożyć ciężar o 2,5–5% (z ${f(w)} na ok. ${f(w * 1.025)}–${f(w * 1.05)} kg) i wrócić do ${lo} powt.`, up, lo };
  }
  return { tip: hi > lo ? `Zostań przy ${f(w)} kg i celuj w więcej powtórzeń niż ostatnio. Ciężar dokładasz dopiero, gdy wszystkie serie dojdą do ${hi} powt.` : `Zostań przy tym ciężarze i utrzymaj ${lo} powt. w każdej serii.` };
}
