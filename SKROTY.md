# Skrót „Silownia Zdrowie”: dane z aplikacji do Apple Zdrowie i Bevel

Aplikacja nie może sama pisać do Apple Zdrowie, bo Apple nie daje stronom internetowym takiego dostępu. Robi to za nią skrót w aplikacji **Skróty**. Układasz go raz, zajmuje to około 10 minut.

**Dlaczego nie ma gotowego pliku do pobrania:** iPhone przyjmuje tylko skróty podpisane przez Apple, a taki podpis powstaje wyłącznie na Twoim urządzeniu albo przez Twoje konto iCloud. Pliku przygotowanego gdzie indziej telefon nie zaimportuje.

**Uwaga:** tej instrukcji nie dało się sprawdzić na fizycznym iPhonie. Nazwy akcji podaję po polsku i po angielsku. W Twojej wersji systemu mogą brzmieć nieco inaczej, więc szukaj ich w polu wyszukiwania akcji po pierwszym słowie.

## Jak to działa

1. W aplikacji dotykasz **Wyślij dzisiejszy dziennik do Apple Zdrowie** (na dole Dziennika albo w zakładce Więcej).
2. Aplikacja kopiuje dane do schowka i otwiera skrót.
3. Skrót czyta schowek i zapisuje wartości w Zdrowiu.
4. Bevel pobiera je ze Zdrowia przy następnej synchronizacji.

Co trafia do Zdrowia:

| Z aplikacji | Rodzaj danych w Zdrowiu | Jednostka |
|---|---|---|
| Waga ciała | Waga (Weight) | kg |
| Woda | Woda (Water) | ml |
| Kalorie | Energia z pożywienia (Dietary Energy) | kcal |
| Białko | Białko (Protein) | g |
| Trening (opcjonalnie) | Trening siłowy | minuty |

Co nie trafia: kreatyna (Zdrowie nie ma dla niej rodzaju danych), sen (dokładniej mierzy go zegarek) i poszczególne serie z kilogramami (Zdrowie ich nie przechowuje).

Aplikacja wysyła tylko to, co przybyło od poprzedniej wysyłki z danego dnia. Możesz więc wysyłać kilka razy dziennie i nic się nie zdubluje.

## Część 1: ułożenie skrótu

Otwórz aplikację **Skróty**, dotknij **+** w prawym górnym rogu. Dotknij nazwy na górze, wybierz **Zmień nazwę** i wpisz dokładnie:

```
Silownia Zdrowie
```

Nazwa musi być bez polskich znaków i z jedną spacją, bo po niej aplikacja znajduje skrót.

Teraz dodawaj akcje po kolei. Każdą znajdziesz, wpisując jej nazwę w pole **Szukaj akcji** na dole.

### Początek (2 akcje)

1. **Pobierz schowek** (Get Clipboard).
2. **Pobierz słownik z danych wejściowych** (Get Dictionary from Input). Powinna sama podpiąć się pod schowek, czyli wyglądać tak: „Pobierz słownik z: Schowek”.

### Waga (4 akcje)

3. **Pobierz wartość słownika** (Get Dictionary Value). Ustaw: Pobierz **Wartość** dla klucza `waga` w **Słownik**.
4. **Jeśli** (If). Ustaw: Jeśli **Wartość słownika** **ma dowolną wartość** (has any value). Skróty dodadzą same „W przeciwnym razie” i „Zakończ Jeśli”.
5. **Zarejestruj próbkę zdrowia** (Log Health Sample). Przeciągnij ją między „Jeśli” a „W przeciwnym razie”. Ustaw: Rodzaj **Waga**, Wartość: dotknij pola i wybierz zmienną **Wartość słownika**, jednostka **kg**. Datę zostaw bez zmian (bieżąca).
6. Usuń „W przeciwnym razie” (dotknij i wybierz Usuń), jeśli Skróty na to pozwalają. Jeśli nie, zostaw puste, nic nie szkodzi.

### Woda, kalorie, białko (po 3 akcje)

Powtórz kroki 3–5 trzy razy, **pod „Zakończ Jeśli”** poprzedniego bloku. Zmieniasz tylko klucz, rodzaj i jednostkę:

| Klucz w kroku 3 | Rodzaj w kroku 5 | Jednostka |
|---|---|---|
| `woda` | Woda (Water) | ml |
| `kcal` | Energia z pożywienia (Dietary Energy) | kcal |
| `bialko` | Białko (Protein) | g |

Ważne przy każdym powtórzeniu:

- W kroku 3 akcja ma czytać ze **Słownika** (wynik akcji 2), a nie z poprzedniej wartości. Jeśli podpięła się pod coś innego, dotknij niebieskiego pola i wybierz **Słownik**.
- W krokach 4 i 5 wybieraj **najnowszą** „Wartość słownika”, czyli tę z akcji tuż powyżej.
- Klucze wpisuj małymi literami i bez polskich znaków, dokładnie jak w tabeli.

Najszybciej: przytrzymaj gotowy blok „Pobierz wartość słownika”, wybierz **Powiel** i popraw klucz. Tak samo możesz powielać pozostałe akcje.

### Zakończenie (opcjonalnie, 1 akcja)

Na samym dole dodaj **Pokaż powiadomienie** (Show Notification) z tekstem „Zapisano w Zdrowiu”. Dzięki temu widzisz, że skrót doszedł do końca.

Dotknij **Gotowe**.

## Część 2: pierwsze uruchomienie

1. W aplikacji Siłownia wpisz coś w Dzienniku (na przykład wagę i szklankę wody).
2. Dotknij **Wyślij dzisiejszy dziennik do Apple Zdrowie**, a potem **Uruchom skrót**.
3. Skróty zapytają o zgodę na dostęp do schowka i na zapis każdego rodzaju danych w Zdrowiu. Wybierz **Zawsze zezwalaj**.
4. Otwórz aplikację **Zdrowie → Przeglądaj** i sprawdź, czy pojawiła się waga (Pomiary ciała) oraz woda, energia i białko (Odżywianie).
5. Wróć do aplikacji Siłownia, dotykając jej ikony.

**Jeśli przycisk „Uruchom skrót” nic nie robi:** dane i tak są już w schowku. Otwórz aplikację Skróty, dotknij skrótu „Silownia Zdrowie”, wróć do Siłowni i wybierz **Oznacz jako wysłane**. Dla wygody dodaj skrót do ekranu początkowego (przytrzymaj skrót → Udostępnij → Do ekranu początkowego).

## Część 3: Bevel

1. Otwórz **Zdrowie**, dotknij swojego zdjęcia w rogu, potem **Aplikacje** i **Bevel**.
2. Włącz odczyt dla: Waga, Woda, Energia z pożywienia, Białko (oraz Treningi, jeśli z nich korzystasz).
3. Otwórz Bevel i odśwież dane.

Nie mam pewności, które z tych danych Bevel faktycznie pokazuje w swoich widokach. Jeśli któregoś nie widać mimo włączonej zgody, dane są w Zdrowiu, a Bevel po prostu ich nie używa.

## Część 4 (opcjonalnie): treningi

**Pomiń tę część, jeśli nagrywasz trening na Apple Watch.** Zegarek zapisuje go w Zdrowiu sam, z tętnem i kaloriami, a drugi zapis z aplikacji dałby w Bevel dwa treningi.

Jeśli trenujesz bez zegarka:

1. W skrócie „Silownia Zdrowie” dodaj na dole kolejny blok: **Pobierz wartość słownika** dla klucza `trening_min` (ze Słownika), potem **Jeśli … ma dowolną wartość**, a w środku **Zarejestruj trening** (Log Workout).
2. W „Zarejestruj trening” ustaw rodzaj **Tradycyjny trening siłowy** (Traditional Strength Training). Rozwiń akcję strzałką i w polu **Czas trwania** wybierz zmienną **Wartość słownika** z jednostką **minuty**.
3. W aplikacji włącz **Więcej → Apple Zdrowie → Wysyłaj też treningi**.
4. Po zapisaniu treningu na ekranie podsumowania pojawi się przycisk **Wyślij trening do Apple Zdrowie**.

Trening zapisze się z chwilą uruchomienia skrótu jako porą, więc wysyłaj go zaraz po zakończeniu.

## Najczęstsze problemy

- **Skrót kończy się błędem przy słowniku:** schowek nie zawiera danych z aplikacji. Najpierw dotknij przycisku wysyłki w Siłowni, dopiero potem uruchom skrót.
- **W Zdrowiu nic się nie pojawia:** sprawdź pisownię kluczy (`waga`, `woda`, `kcal`, `bialko`) i to, czy każda akcja „Pobierz wartość słownika” czyta ze Słownika.
- **Wartości zapisały się podwójnie:** użyto opcji „Wyślij dzisiejsze dane jeszcze raz” po udanej wysyłce. Nadmiarowe wpisy usuniesz w Zdrowiu: wejdź w dany rodzaj danych → Pokaż wszystkie dane → Edycja.
- **Skrót pyta o zgodę za każdym razem:** przy pytaniu wybierz „Zawsze zezwalaj”.
