# Siłownia: instrukcja

Osobista aplikacja treningowa na iPhone'a. Działa bez App Store, bez opłat i bez internetu (po pierwszym uruchomieniu). Wszystkie dane zostają na telefonie.

## 1. Czy da się zainstalować aplikację bez App Store?

Tak. Realne drogi wyglądają tak:

| Sposób | Koszt | Potrzebny Mac | Jak długo działa | Dla laika |
|---|---|---|---|---|
| **Aplikacja webowa (PWA) dodana do ekranu początkowego** | 0 zł | nie | bez limitu | tak |
| Natywna aplikacja przez Xcode z darmowym Apple ID | 0 zł | tak | 7 dni, potem trzeba instalować od nowa z kabla | nie |
| Natywna aplikacja z płatnym kontem Apple Developer | 99 USD rocznie | tak | 1 rok, potem odnowienie | nie |
| TestFlight | 99 USD rocznie | tak | każda wersja wygasa po 90 dniach | nie |
| AltStore / SideStore | 0 zł | komputer w tej samej sieci Wi-Fi | odświeżanie co 7 dni | średnio |
| Alternatywne sklepy w UE | 99 USD rocznie plus wymogi Apple | tak | bez limitu | nie |

**Wybrałem PWA.** To jedyna opcja, która jest jednocześnie darmowa, bezterminowa i nie wymaga Maca ani kabla. Ikona na ekranie początkowym otwiera aplikację na pełnym ekranie, bez paska Safari, a dane zapisują się trwale w pamięci telefonu. Wersja natywna z darmowym kontem przestawałaby działać co tydzień, a to dyskwalifikuje ją w aplikacji, której używasz kilka razy w tygodniu przez lata.

Ograniczenia PWA, o których warto wiedzieć:

- Sygnał końca przerwy słychać tylko wtedy, gdy aplikacja jest otwarta na ekranie. Podczas treningu aplikacja prosi telefon, żeby nie wygaszał ekranu.
- iPhone nie udostępnia stronom wibracji, więc koniec przerwy sygnalizuje dźwięk i komunikat.
- Usunięcie ikony z ekranu początkowego usuwa dane aplikacji. Przed usunięciem zrób kopię zapasową (punkt 6).
- Dane nie synchronizują się między telefonami. Dwa profile na jednym telefonie działają od razu. Jeśli Twoja dziewczyna chce mieć aplikację na swoim telefonie, instaluje ją u siebie tym samym adresem i ma tam własne dane.

## 2. Co jest w paczce

```
silownia/
├── index.html              strona startowa
├── styles.css              wygląd
├── manifest.webmanifest    nazwa i ikona aplikacji
├── sw.js                   działanie offline
├── js/
│   ├── app.js              ekrany: Dziś, Plan, edytor, profile, kopie
│   ├── workout.js          trening na żywo, timer przerw
│   ├── stats.js            Dziennik i Postępy
│   ├── figures.js          animacje ćwiczeń
│   ├── plans.js            gotowe plany (hipertrofia 3 dni i 2 dni)
│   ├── muscles.js          partie mięśniowe i mapa ciała
│   ├── program.js          etapy 6-miesięczne i progresja podwójna
│   ├── store.js            zapis danych w telefonie
│   ├── ui.js, core.js      elementy wspólne
├── icons/                  ikony
├── plan-szablon.json       wzór pliku z planem
├── podglad.html            podgląd na komputerze (dwuklik)
├── SKROTY.md               skrót do Apple Zdrowie (i dalej do Bevel)
└── INSTRUKCJA.md           ten plik
```

Aplikacja nie korzysta z żadnych zewnętrznych bibliotek ani serwerów. Nie trzeba niczego kompilować.

## 3. Instalacja krok po kroku

Aplikacja musi leżeć pod adresem internetowym z kłódką (https), żeby iPhone pozwolił ją zainstalować. Użyjemy darmowego GitHub Pages. Robisz to raz, na dowolnym komputerze (Windows lub Mac), zajmuje około 10 minut.

Uwaga o prywatności: na GitHubie znajdzie się tylko kod aplikacji, czyli te same pliki, które masz w paczce. Twoje treningi, waga i dziennik nigdy tam nie trafiają, bo zapisują się wyłącznie w telefonie.

### Część A: wgranie plików (komputer)

1. Rozpakuj plik `silownia.zip`. Powstanie folder `silownia`.
2. Wejdź na **github.com** i załóż darmowe konto (przycisk „Sign up”). Zapamiętaj swoją nazwę użytkownika.
3. Po zalogowaniu kliknij **+** w prawym górnym rogu i wybierz **New repository**.
4. W polu „Repository name” wpisz `silownia`. Zostaw zaznaczone **Public**. Kliknij **Create repository**.
5. Na następnej stronie kliknij link **uploading an existing file**.
6. Otwórz folder `silownia` na komputerze, zaznacz **całą jego zawartość** (Ctrl+A, na Macu Cmd+A) i przeciągnij do okna przeglądarki. Ważne: przeciągasz zawartość folderu, a nie sam folder, tak aby `index.html` znalazł się na najwyższym poziomie. Foldery `js` i `icons` przeciągnij razem z resztą.
7. Poczekaj, aż wszystkie pliki się wgrają, i kliknij zielony przycisk **Commit changes**.
8. Kliknij **Settings** (górne menu repozytorium), a następnie **Pages** w menu po lewej.
9. W sekcji „Build and deployment” ustaw „Source” na **Deploy from a branch**, w polu „Branch” wybierz **main** oraz **/ (root)** i kliknij **Save**.
10. Odczekaj 1–2 minuty i odśwież stronę. Na górze pojawi się adres w postaci `https://TWOJA-NAZWA.github.io/silownia/`. To adres Twojej aplikacji.

### Część B: instalacja na iPhonie

1. Otwórz ten adres w **Safari** (koniecznie Safari, nie Chrome).
2. Dotknij przycisku **Udostępnij** (kwadrat ze strzałką w górę).
3. Przewiń listę i wybierz **Do ekranu początkowego**.
4. Jeśli widzisz przełącznik „Otwórz jako aplikację internetową”, zostaw go włączony. Dotknij **Dodaj**.
5. Od teraz uruchamiaj aplikację **zawsze z ikony** na ekranie początkowym. Aplikacja z ikony i strona w Safari mają osobne dane.
6. Pierwsze uruchomienie zrób z dostępem do internetu. Potem aplikacja działa także w trybie samolotowym.

### Aktualizacja w przyszłości

Jeśli zmienisz jakiś plik, wgraj go ponownie w repozytorium (przycisk „Add file”, potem „Upload files”). W pliku `sw.js` zwiększ wtedy numer w nazwie `silownia-v9` (na przykład na `silownia-v10`) i też go wgraj. Na telefonie otwórz aplikację, zamknij ją i otwórz ponownie. Dane zostają nienaruszone.

## 4. Jak korzystać

Jeśli masz już zainstalowaną starszą wersję: wgraj do repozytorium całą zawartość nowej paczki (pliki się nadpiszą), otwórz aplikację dwa razy, a potem wybierz **Plan → Wczytaj gotowy plan**.

- **Dziś**: tydzień w skrócie, dzisiejszy trening, szybkie odhaczenie kreatyny i wody. Kółko z inicjałem w rogu przełącza profil.
- **Plan**: dni treningowe. Każdy dzień ma trzy sekcje: rozgrzewka, ćwiczenia, rozciąganie.
- **Trening**: dotknij „Rozpocznij trening”. Przy każdej serii ustaw kilogramy i powtórzenia (przyciski plus i minus albo wpisanie liczby) i dotknij znaczka ✓. Startuje wtedy odliczanie przerwy. Aplikacja podpowiada ciężar z poprzedniego treningu. Trening można zwinąć strzałką i wrócić do niego z ekranu Dziś, nic nie przepada nawet po zamknięciu aplikacji.
- **Dziennik**: kreatyna, woda, kalorie, białko, waga ciała i sen dla każdego dnia.
- **Postępy**: wykres każdego ćwiczenia (ciężar, szacowany 1RM, objętość), kalendarz treningów, waga ciała.
- **Kalendarz**: w zakładce Postępy → Kalendarz każdy dzień miesiąca jest klikalny, strzałki zmieniają miesiąc. Klikalne są też dni w pasku tygodnia na ekranie Dziś. Po dotknięciu dnia widzisz zapisany trening z seriami, wpisy z dziennika i to, co było w planie. Strzałkami przechodzisz dzień po dniu, a przyciskiem pod dziennikiem poprawisz wpisy z tamtego dnia.
- **Partie mięśniowe**: przy każdym ćwiczeniu widać główne partie, a po rozwinięciu sylwetkę z przodu i z tyłu. Kolor akcentu oznacza partie główne, jaśniejszy odcień pomocnicze. Przypisanie zmienisz w edycji ćwiczenia.
- **Tło dnia i ekranu Dziś**: własne zdjęcie w tle ustawisz w edycji dnia (Tło dnia → Z telefonu) oraz w Więcej → Tło ekranu Dziś. Zdjęcia zapisują się tylko w telefonie i trafiają do kopii zapasowej. Nie są częścią plików aplikacji, więc nie trafiają do internetu.
- **Więcej**: profile, cele dzienne, motyw, kopia zapasowa.
- **Apple Zdrowie i Bevel**: wysyłkę dziennika do Zdrowia opisuje osobny plik `SKROTY.md`.

## 5. Jak dodać własny plan treningowy

### Twój plan jest już w aplikacji

Plan hipertroficzny (full body przy bólu lędźwi) jest wbudowany w dwóch wariantach:

- **Hipertrofia 3 dni (A/B/C)**: poniedziałek, środa, piątek. Zalecany.
- **Hipertrofia 2 dni**: poniedziałek i czwartek.

Przy pierwszym uruchomieniu zostaw zaznaczone „Wczytaj mój plan”, a wariant 3-dniowy wczyta się sam. W każdej chwili możesz też wejść w **Plan → Wczytaj gotowy plan** i wybrać wariant (zastąpić obecny plan albo dodać do niego). Wczytanie ustawia cele dzienne z planu: 2800 kcal, 140 g białka, 8 h snu. Historia treningów zostaje.

Co warto wiedzieć:

- **Ciężary startują od 0 kg**, bo plan ich nie podaje. Ustaw je na pierwszym treningu, a aplikacja podpowie je następnym razem.
- **RIR** (zapas powtórzeń) widać przy każdym ćwiczeniu obok serii i powtórzeń.
- **Rozgrzewka** zawiera rower lub orbitrek, Big 3 McGilla i serie rozgrzewkowe.
- **Rozciąganie jest puste**, bo plan go nie przewiduje. Dodasz je w edycji dnia, jeśli zechcesz.
- **Superserie** (biceps z tricepsem) są opisane w ćwiczeniu. Timer liczy wtedy krótką przerwę 60 s.
- Dni tygodnia zmienisz w edycji dnia, na przykład na wtorek, czwartek i sobotę.

### Zasady z planu, które aplikacja prowadzi sama

- **Progresja podwójna.** Przy każdym ćwiczeniu w trakcie treningu jest ramka „Progresja”. Dopóki nie zrobisz górnej granicy powtórzeń we wszystkich seriach, aplikacja każe zostać przy ciężarze i dokładać powtórzenia. Gdy ostatnio wszystkie serie doszły do górnej granicy, proponuje dołożenie 2,5–5% i powrót do dolnej granicy, z przyciskiem ustawiającym nowy ciężar. Proponowany krok to 1 kg przy ciężarach poniżej 40 kg i 2,5 kg powyżej. Dopasuj go do sprzętu na swojej siłowni.
- **Etapy 6-miesięczne.** Na ekranie Dziś i na górze treningu widać bieżący tydzień i etap (wprowadzenie, blok 1, deload, blok 2, deload, blok 3, ewaluacja) razem z docelowym RIR. Tydzień 1 zaczyna się w poniedziałek tygodnia, w którym wczytałeś plan. Datę zmienisz w **Więcej → Program 6-miesięczny**, tam też program wyłączysz.
- **Liczba serii w etapach.** W tygodniach 1–2 aplikacja sama odejmuje jedną serię w ćwiczeniach wielostawowych. W tygodniach deload (8, 15, 23) tnie serie o połowę. Serię zawsze możesz dodać przyciskiem w trakcie treningu.
- **Bloki 2 i 3.** Aplikacja przypomina o dołożeniu po 1 serii na priorytetowe partie, ale nie robi tego sama, bo plan zostawia wybór partii Tobie. Liczbę serii zmieniasz w edycji ćwiczenia.
- **Trend wagi.** W **Postępy → Ciało** jest średnia tygodniowa i porównanie z poprzednim tygodniem, z podpowiedzią z planu (cel 0,15–0,3 kg na tydzień, korekta o 100–150 kcal).

### Ćwiczenia opcjonalne

Ćwiczenia z kółkiem i napisem „opcjonalne” możesz pominąć, gdy brakuje czasu. W trakcie treningu mają przycisk **Pomiń to ćwiczenie dziś**, a pasek postępu przestaje je liczyć.

Plan nie wskazuje wprost, co wolno odpuścić. Wybór wynika z jego zasad: zostają ćwiczenia wielostawowe i objętość partii priorytetowych, a każda partia ma nadal dostać co najmniej ok. 4 serie frakcyjne tygodniowo.

| Dzień | Opcjonalne | Dlaczego |
|---|---|---|
| A | Uginanie ramion na ławce skośnej, prostowanie ramion nad głową | Ramiona dostają serie bezpośrednie w dniu C i pośrednie przy wyciskaniach i wiosłowaniach |
| B | Prostowanie nóg, odwrotne rozpiętki, Pallof press | Czworogłowe mają 9 serii w ćwiczeniach wielostawowych, tył barków pracuje przy wiosłowaniach, tułów ma Big 3 w rozgrzewce |
| C | Wspięcia na palce | Łydki nie są partią priorytetową, a wariant 2-dniowy z planu w ogóle ich nie zawiera |

Uginanie nóg (siedząc i leżąc) nie jest opcjonalne, bo dwugłowe uda mają w planie tylko 6 serii tygodniowo. Nie pomijaj ćwiczeń na ramiona w dniu A i w dniu C w tym samym tygodniu. Oznaczenie zmienisz w edycji ćwiczenia przełącznikiem „Ćwiczenie opcjonalne”.

Poniżej opis, jak plan zmieniać lub wprowadzić zupełnie inny.

### Sposób 1: edytor w aplikacji (najprostszy)

1. Zakładka **Plan → Dodaj dzień treningowy**.
2. Wpisz nazwę dnia i zaznacz dni tygodnia.
3. W każdej sekcji dotknij **Dodaj** i uzupełnij pola: nazwa, serie, powtórzenia, ciężar, przerwa, opis.
4. Animacja dobiera się sama po nazwie (na przykład „przysiad”, „wyciskanie”, „martwy ciąg”). Możesz ją zmienić przyciskiem **Wybierz animację** albo pobrać zdjęcia przyciskiem **Zdjęcia z biblioteki**.
5. Kolejność zmieniasz strzałkami. Na koniec dotknij **Gotowe**.

### Sposób 2: plik z planem

Wygodne przy dłuższym planie pisanym na komputerze.

1. Otwórz `plan-szablon.json` w Notatniku i wpisz swój plan według wzoru:

```json
{
  "days": [
    {
      "name": "Push",
      "weekdays": ["pn", "czw"],
      "warmup":    [{ "name": "Rowerek", "detail": "5 min", "desc": "Spokojne tempo." }],
      "exercises": [{ "name": "Wyciskanie sztangi leżąc", "desc": "Łopatki ściągnięte.", "sets": 4, "reps": "8-10", "rir": "1-2", "weight": 60, "rest": 120 }],
      "stretch":   [{ "name": "Rozciąganie klatki", "detail": "30 s", "desc": "" }]
    }
  ]
}
```

2. Znaczenie pól: `weekdays` to dni tygodnia (`pn`, `wt`, `sr`, `cz`, `pt`, `so`, `nd`), `sets` serie, `reps` powtórzenia (może być zakres lub czas, na przykład `"45 s"`), `rir` zapas powtórzeń (opcjonalnie), `optional` ćwiczenie opcjonalne (`true` lub `false`), `compound` ćwiczenie wielostawowe (`true` lub `false`), `weight` ciężar w kg (0 oznacza brak ustalonego ciężaru lub masę ciała), `rest` przerwa w sekundach.
3. Pole `anim` jest opcjonalne. Bez niego animacja dobierze się po nazwie. Dostępne wartości: `squat`, `deadlift`, `rdl`, `bench`, `row`, `lunge`, `hipthrust`, `pushup`, `plank`, `crunch`, `curl`, `pushdown`, `legpress`, `legext`, `legcurl`, `calf`, `dip`, `cablerow`, `legraise`, `ohp`, `pullup`, `latpulldown`, `lateral`, `armopen`, `jacks`, `bend`, `run`, `hacksquat`, `inclinepress`, `csrow`, `seatedlegcurl`, `cablelateral`, `inclinecurl`, `ohtriceps`, `bulgarian`, `seatedpress`, `reversefly`, `fly`, `pallof`, `legpress45`, `dbrow`, `seatedlateral`, `preacher`, `calfpress`, `bike`, `curlup`, `sidebridge`, `birddog`.
4. Prześlij plik na telefon (AirDrop, e-mail, iCloud) albo skopiuj jego treść.
5. W aplikacji: **Plan → Importuj plan**, wklej treść lub wybierz plik, a potem **Zastąp cały plan** albo **Dodaj do obecnego planu**.

Każdy profil ma własny plan, więc import wykonujesz osobno dla siebie i dla dziewczyny (po przełączeniu profilu).

Najprościej: wyślij mi swój plan zwykłym tekstem, a przygotuję gotowy plik do importu.

## 6. Kopia zapasowa

1. **Więcej → Zapisz kopię zapasową**.
2. Otworzy się systemowe okno udostępniania. Wybierz **Zachowaj w Plikach** (najlepiej w iCloud Drive) albo wyślij plik do siebie e-mailem.
3. Plik `silownia-kopia-DATA.json` zawiera wszystko: oba profile, plany, historię, dziennik i pobrane zdjęcia.

Przywracanie: **Więcej → Przywróć z kopii** i wskazanie pliku. Ta sama opcja jest na ekranie powitalnym, więc w ten sposób przeniesiesz dane na nowy telefon.

Aplikacja przypomina o kopii, gdy ostatnia ma ponad dwa tygodnie. Rób ją zawsze przed usunięciem ikony i przed wymianą telefonu.

## 7. Animacje ćwiczeń: skąd pochodzą

- **Animowane postaci** (48 ruchów, w tym wszystkie ćwiczenia z Twojego planu) narysowałem specjalnie dla tej aplikacji jako grafikę wektorową. Są jej częścią, działają offline i nie wymagają żadnej licencji.
- **Zdjęcia z biblioteki** pochodzą z projektu *free-exercise-db* (github.com/yuhonas/free-exercise-db), udostępnionego jako domena publiczna na licencji Unlicense. Biblioteka zawiera ponad 800 ćwiczeń, każde z dwiema klatkami (pozycja początkowa i końcowa), które aplikacja wyświetla na przemian. Nazwy w wyszukiwarce są po angielsku. Zdjęcia pobierają się raz i zostają w telefonie.

Animacje pokazują ogólny tor ruchu. Nie zastępują instruktażu trenera, zwłaszcza przy dużych ciężarach.

## 8. Najczęstsze problemy

- **Nie widzę „Do ekranu początkowego”**: otwórz adres w Safari, nie w innej przeglądarce ani w oknie komunikatora.
- **Pusta strona po wgraniu plików**: plik `index.html` nie leży na najwyższym poziomie repozytorium. Wgraj zawartość folderu jeszcze raz zgodnie z krokiem A6.
- **Adres pokazuje błąd 404**: GitHub Pages potrzebuje czasem kilku minut po pierwszym włączeniu.
- **Nie słychać sygnału przerwy**: sprawdź przełącznik w **Więcej** oraz boczny przełącznik wyciszenia w telefonie.
