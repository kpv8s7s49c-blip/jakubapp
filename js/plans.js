// plans.js — gotowe plany do wczytania jednym dotknięciem (Plan → Wczytaj gotowy plan).
// Treść pochodzi z planu użytkownika: hipertrofia przy bólu lędźwi, full body na maszynach i z podparciem tułowia.
// Ciężar startowy to 0: ustalasz go na pierwszym treningu, a aplikacja zapamiętuje ostatnie wartości.
const COMPOUND = ['hacksquat', 'inclinepress', 'csrow', 'bulgarian', 'latpulldown', 'seatedpress', 'bench', 'legpress45', 'dbrow'];
// opt = true: ćwiczenie opcjonalne, które można pominąć przy braku czasu (dobór opisany w INSTRUKCJA.md)
const ex = (name, reps, rir, rest, anim, desc) => (sets, optional = false) => ({ name, sets, reps, rir, rest, anim, desc, weight: 0, compound: COMPOUND.includes(anim), optional });
const TEMPO = ' Opuszczaj ciężar 2–3 s, bez odbijania.';
const X = {
  hack: ex('Hack squat', '6–10', '2', 180, 'hacksquat', 'Plecy i biodra dociśnięte do oparcia, stopy na szerokość barków. Schodź tak nisko, jak pozwala neutralna pozycja lędźwi. Zamienniki: pendulum, belt squat, Smith z nogami wysuniętymi.' + TEMPO),
  incline: ex('Wyciskanie hantli na ławce skośnej 30°', '8–12', '1–2', 150, 'inclinepress', 'Łopatki ściągnięte, stopy na podłodze. Hantle opuszczaj do linii klatki i wyciskaj pionowo.' + TEMPO),
  csrow: ex('Wiosłowanie z podparciem klatki', '8–12', '1–2', 120, 'csrow', 'Klatka cały czas na podparciu (T-bar lub maszyna). Ciągnij łokcie do tyłu i ściągaj łopatki. Tułów nie odrywa się od poduszki.' + TEMPO),
  slegcurl: ex('Uginanie nóg siedząc', '10–15', '0–1', 90, 'seatedlegcurl', 'Biodra dociśnięte do siedziska, wałek nad udami. Uginaj do końca i wracaj powoli do pełnego wyprostu. W ostatniej serii możesz dołożyć 2–4 połówki w rozciągnięciu.'),
  cablelat: ex('Wznosy bokiem na wyciągu', '12–20', '0–1', 60, 'cablelateral', 'Wyciąg dolny, linka przed lub za ciałem. Unoś ramię bokiem do wysokości barku, łokieć lekko ugięty. Druga ręka trzyma słupek.'),
  inclinecurl: ex('Uginanie ramion hantlami na ławce skośnej', '10–15', '0–1', 60, 'inclinecurl', 'Superseria z prostowaniem ramion nad głową: wykonuj naprzemiennie, przerwa po obu ćwiczeniach. Plecy oparte, ramiona zwisają za tułowiem, łokcie nieruchomo.'),
  ohtri: ex('Prostowanie ramion nad głową na wyciągu', '10–15', '0–1', 60, 'ohtriceps', 'Superseria z uginaniem ramion. Siedząc z oparciem lub w wykroku, nie w przeprostowanym staniu. Łokcie blisko głowy, pełne rozciągnięcie na dole.'),
  bulgarian: ex('Przysiad bułgarski', '8–12 na nogę', '2', 120, 'bulgarian', 'Tylna stopa na ławce, hantle w dłoniach lub suwnica Smitha. Tułów lekko pochylony, lędźwie neutralne. Przednie kolano w linii stopy.' + TEMPO),
  latpull: ex('Ściąganie drążka do klatki', '8–12', '1–2', 120, 'latpulldown', 'Uda zablokowane pod wałkami. Ciągnij łokcie w dół do boków, drążek do górnej części klatki. Bez odchylania i bujania tułowiem.' + TEMPO),
  seatedpress: ex('Wyciskanie siedząc z oparciem', '8–12', '1–2', 120, 'seatedpress', 'Maszyna lub hantle, oparcie ustawione na ok. 75–85°. Plecy przylegają do oparcia, bez przeprostu w lędźwiach.' + TEMPO),
  bench: ex('Wyciskanie na ławce płaskiej', '6–10', '2', 150, 'bench', 'Sztanga lub maszyna. Umiarkowany łuk, stopy na podłodze, łopatki ściągnięte.' + TEMPO),
  hipthrust: ex('Hip thrust na maszynie lub mostek', '8–12', '1–2', 120, 'hipthrust', 'W górnej pozycji tylne pochylenie miednicy i broda lekko przy klatce. Nie przeprostowuj lędźwi.'),
  legext: ex('Prostowanie nóg na maszynie', '10–15', '0–1', 90, 'legext', 'Plecy oparte, pełny wyprost i kontrolowany powrót.'),
  reversefly: ex('Odwrotne rozpiętki na maszynie', '12–20', '0–1', 60, 'reversefly', 'Klatka oparta o poduszkę. Odwodź ramiona szerokim łukiem, bez szarpania tułowiem.'),
  pallof: ex('Pallof press', '10 na stronę', '', 45, 'pallof', 'Stań bokiem do wyciągu, uchwyt przy mostku. Wypchnij ręce przed siebie i wróć, nie pozwalając tułowiowi się obrócić.'),
  legpress: ex('Leg press 45°', '10–15', '2', 150, 'legpress45', 'Stopy wyżej na platformie. Schodź tylko tak nisko, jak długo kość krzyżowa przylega do oparcia. Bez podwijania miednicy.' + TEMPO),
  fly: ex('Rozpiętki na wyciągu lub pec deck', '10–15', '0–1', 90, 'fly', 'Łokcie lekko ugięte, szeroki łuk. Pełne rozciągnięcie klatki na początku ruchu.'),
  dbrow: ex('Wiosłowanie jednorącz z podparciem', '8–12', '1–2', 105, 'dbrow', 'Kolano i ręka na ławce, plecy płaskie. Ciągnij łokieć do biodra. Zamiennik: wiosłowanie siedząc na wyciągu z nieruchomym tułowiem, bez bujania.' + TEMPO),
  llegcurl: ex('Uginanie nóg leżąc', '10–15', '0–1', 90, 'legcurl', 'Biodra dociśnięte do ławki. Uginaj do końca i opuszczaj powoli.'),
  seatedlat: ex('Wznosy bokiem z hantlami siedząc', '12–20', '0–1', 60, 'seatedlateral', 'Siedząc, tułów pionowo. Unoś ramiona bokiem do wysokości barków.'),
  preacher: ex('Uginanie na modlitewniku lub bayesian curl', '10–15', '0–1', 60, 'preacher', 'Superseria z prostowaniem ramion na wyciągu. Ramię oparte, pełny wyprost na dole bez szarpania.'),
  pushdown: ex('Prostowanie ramion na wyciągu', '10–15', '0–1', 60, 'pushdown', 'Superseria z uginaniem ramion. Łokcie przy tułowiu, pełny wyprost na dole.'),
  calf: ex('Wspięcia na palce na leg pressie', '10–15', '0–1', 60, 'calfpress', 'Nogi prawie proste, pracują tylko stawy skokowe. Po ostatnim pełnym powtórzeniu dołóż połówki w rozciągnięciu.'),
};
const warm = first => [
  { name: 'Rower lub orbitrek', detail: '5 min', anim: 'bike', desc: 'Spokojne tempo, żeby podnieść tętno.' },
  { name: 'Curl-up McGilla', detail: '3 × 8–10 s', anim: 'curlup', desc: 'Jedna noga ugięta, dłonie pod lędźwiami. Unieś tylko głowę i łopatki, lędźwie pozostają neutralne.' },
  { name: 'Side bridge', detail: '3 × 8–10 s na stronę', anim: 'sidebridge', desc: 'Podpór bokiem na przedramieniu, ciało w jednej linii.' },
  { name: 'Bird dog', detail: '3 × 8–10 s na stronę', anim: 'birddog', desc: 'W klęku podpartym wyprostuj przeciwną rękę i nogę. Miednica nieruchomo.' },
  { name: 'Serie rozgrzewkowe', detail: '1–2 lżejsze serie', anim: first, desc: 'Przed pierwszym ćwiczeniem każdej partii. Zakończ każdą serię treningu, gdy tracisz neutralną pozycję lędźwi albo pojawia się ból ostry lub promieniujący.' },
];
const GOALS = { kcal: 2800, protein: 140, sleep: 8 };

export const PLANS = {
  h3: { name: 'Hipertrofia 3 dni (A/B/C)', program: true, info: 'Full body, ok. 65–80 min, poniedziałek, środa, piątek. Zalecany wariant.', goals: GOALS, days: [
    { name: 'Dzień A', weekdays: ['pn'], warmup: warm('hacksquat'), stretch: [],
      exercises: [X.hack(3), X.incline(3), X.csrow(3), X.slegcurl(3), X.cablelat(3), X.inclinecurl(2, true), X.ohtri(2, true)] },
    { name: 'Dzień B', weekdays: ['sr'], warmup: warm('bulgarian'), stretch: [],
      exercises: [X.bulgarian(3), X.latpull(3), X.seatedpress(3), X.bench(3), X.hipthrust(2), X.legext(2, true), X.reversefly(2, true), X.pallof(2, true)] },
    { name: 'Dzień C', weekdays: ['pt'], warmup: warm('legpress45'), stretch: [],
      exercises: [X.legpress(3), X.fly(3), X.dbrow(3), X.llegcurl(3), X.seatedlat(3), X.preacher(3), X.pushdown(3), X.calf(3, true)] },
  ] },
  h2: { name: 'Hipertrofia 2 dni', program: true, info: 'Full body, ok. 70–80 min, poniedziałek i czwartek. Mniejsza objętość tygodniowa.', goals: GOALS, days: [
    { name: 'Dzień 1', weekdays: ['pn'], warmup: warm('hacksquat'), stretch: [],
      exercises: [X.hack(3), X.incline(3), X.csrow(3), X.slegcurl(3), X.seatedpress(2), X.cablelat(3), X.inclinecurl(2), X.ohtri(2)] },
    { name: 'Dzień 2', weekdays: ['cz'], warmup: warm('legpress45'), stretch: [],
      exercises: [{ ...X.legpress(3), name: 'Leg press 45° lub przysiad bułgarski', reps: '8–15' }, X.bench(3), X.latpull(3), X.hipthrust(2), X.legext(2, true), X.fly(2), X.seatedlat(3), X.preacher(2), X.pushdown(2), X.pallof(2, true)] },
  ] },
};
