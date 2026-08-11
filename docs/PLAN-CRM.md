# Kapitello — plan projektu: backend + prosty CRM

**Wersja:** 1.0 · 11.08.2026
**Rola wykonawcza:** agent implementujący (dalej: *wykonawca*)
**Rola nadzorcza:** agent główny — recenzja każdego etapu przed przejściem dalej

---

## 1. Cel

Klient (firma OZE, 1–2 osoby nietechniczne) ma samodzielnie dodawać na stronę:

- **Realizacje** — zdjęcie + tytuł + tag + lokalizacja
- **Aktualności** — zdjęcie + tytuł + krótki tekst + data

Bez proszenia programisty, bez dotykania kodu, z telefonu lub laptopa.

## 2. Stan wyjściowy

| Element | Stan |
|---|---|
| Strona | statyczny HTML/CSS/JS, **bez build stepu** (`index.html`, `styles.css`, `script.js`) |
| Hosting | Netlify, site ID `25753fd8-39fa-4bc7-b726-d6d7018efc04` |
| Repo | `github.com/Pioos/kapitello`, branch roboczy `kapitello_ver2_maj` |
| Node | v24.13.0, npm 11.6.2 |
| Design system | zmienne CSS w `styles.css` — złoto `#C9A45C`, szampan `#E8D5A8`, tło `#080603` |
| Zdjęcia | `assets/` — obecnie wgrywane ręcznie |

## 3. Stack — decyzja

**Wybór: Netlify Functions + Netlify Blobs.** Bez osobnego serwera, bez bazy SQL, bez frameworka frontendowego.

| Warstwa | Technologia | Dlaczego |
|---|---|---|
| API | Netlify Functions (Node 24, ESM) | serverless, w tym samym repo i deployu co strona, darmowy tier wystarcza |
| Zdjęcia | Netlify Blobs | wbudowane, brak konfiguracji S3, nie puchnie repo |
| Skalowanie obrazów | Netlify Image CDN (`/.netlify/images`) | miniatury bez własnego przetwarzania |
| Dane | Netlify Blobs, jeden JSON na kolekcję | dziesiątki–setki wpisów, zero kosztu utrzymania bazy |
| Auth | hasło admina → JWT w cookie `httpOnly` `Secure` `SameSite=Strict` | jeden użytkownik, nie potrzeba systemu kont |
| Panel | vanilla HTML/CSS/JS pod `/admin` | zgodne z zasadą „bez build stepu", ta sama paleta co strona |

**Rozważona alternatywa:** Decap CMS (git-based). Odrzucona — wymaga Netlify Identity (wygaszane) albo własnego OAuth brokera, a zdjęcia lądują w repo. Jeśli własne API okaże się przerostem formy, wracamy do tego wariantu.

**Znany kompromis (do świadomej akceptacji):** treści dogrywane są po stronie klienta (`fetch` w przeglądarce), więc nie ma ich w źródle HTML. Dla Realizacji to bez znaczenia. Dla Aktualności — Google renderuje JS, ale indeksuje wolniej. Ścieżka wyjścia, jeśli SEO bloga stanie się priorytetem: build hook przy zapisie + generowanie statycznych podstron. **Nie robimy tego w tej fazie.**

## 4. Model danych

Jeden blob store `content`, dwa klucze: `realizacje.json`, `aktualnosci.json`.

```jsonc
// realizacje.json
{
  "updatedAt": "2026-08-11T10:00:00Z",
  "items": [
    {
      "id": "rl_01J...",            // ULID
      "title": "Instalacja dachowa",
      "tag": "Dom jednorodzinny",
      "location": "Powiat zduńskowolski",
      "power": "10 kWp",            // opcjonalne
      "image": "img_01J....jpg",    // klucz w store `media`
      "alt": "Panele na dachu budynku gospodarczego",
      "order": 1,
      "published": true,
      "createdAt": "2026-08-11T10:00:00Z"
    }
  ]
}
```

```jsonc
// aktualnosci.json — items[]
{
  "id": "ak_01J...",
  "title": "Rusza Mój Prąd 7.0",
  "excerpt": "Maks. 300 znaków, wyświetlane na kafelku.",
  "body": "Pełny tekst, markdown-lite: akapity + pogrubienia.",
  "image": "img_01J....jpg",
  "alt": "…",
  "date": "2026-08-11",
  "published": true,
  "createdAt": "…"
}
```

Store `media`: klucz = `img_<ULID>.<ext>`, metadata `{ width, height, mime, size, uploadedAt }`.

## 5. API

Wszystko pod `/api/*` (rewrite z `netlify.toml` na `/.netlify/functions/*`).

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | `/api/auth/login` | — | `{password}` → ustawia cookie, rate limit 5 prób / 15 min / IP |
| POST | `/api/auth/logout` | ✅ | czyści cookie |
| GET | `/api/auth/me` | ✅ | sprawdzenie sesji przez panel |
| GET | `/api/content/:collection` | — | **publiczne**, zwraca tylko `published: true`, `Cache-Control: max-age=60` |
| GET | `/api/admin/:collection` | ✅ | wszystko, łącznie z szkicami |
| POST | `/api/admin/:collection` | ✅ | nowy wpis |
| PATCH | `/api/admin/:collection/:id` | ✅ | edycja / publikacja / zmiana kolejności |
| DELETE | `/api/admin/:collection/:id` | ✅ | usunięcie wpisu + jego zdjęcia |
| POST | `/api/admin/media` | ✅ | upload, `multipart/form-data`, maks. 10 MB |
| GET | `/api/media/:key` | — | serwuje obraz (albo redirect do Image CDN) |

`:collection` ∈ `{realizacje, aktualnosci}` — twarda whitelista, nie interpolacja.

**Zapis konkurencyjny:** odczyt–modyfikacja–zapis całego JSON-a. Przy jednym użytkowniku to bezpieczne; wykonawca dokłada `If-Match` na `updatedAt` i zwraca `409`, gdy ktoś zapisał w międzyczasie.

## 6. Panel `/admin`

Jedna strona, trzy widoki (logowanie / lista / formularz). Ma wyglądać jak reszta serwisu — te same zmienne CSS, DM Sans/Space Grotesk, złote akcenty.

Wymagania funkcjonalne:

1. Logowanie hasłem, komunikat błędu po polsku
2. Lista wpisów z miniaturą, statusem (`opublikowany` / `szkic`) i przyciskami edytuj/usuń
3. Formularz: zdjęcie (drag & drop + `<input type=file>`), tytuł, tag/lokalizacja lub tekst, przełącznik publikacji
4. **Podgląd zdjęcia przed wysłaniem** + informacja o rozmiarze pliku
5. Zmiana kolejności realizacji (strzałki góra/dół — wystarczą, bez drag & drop)
6. Potwierdzenie przed usunięciem
7. Działa na telefonie (klient robi zdjęcia w terenie)

Obrazy: kompresja po stronie przeglądarki przed uploadem (canvas → JPEG, maks. 1600 px, jakość 0.82). Zdjęcie z telefonu ma 4 MB, do bloba trafia ~300 kB.

## 7. Bezpieczeństwo — wymagania nienegocjowalne

1. Hasło **wyłącznie** w zmiennej środowiskowej Netlify (`ADMIN_PASSWORD_HASH`, bcrypt/argon2). Nigdy w repo.
2. `JWT_SECRET` też ze zmiennej środowiskowej, min. 32 bajty losowe.
3. Cookie: `httpOnly`, `Secure`, `SameSite=Strict`, TTL 8 h.
4. Każdy endpoint `/api/admin/*` weryfikuje token **na wejściu**, przed jakąkolwiek logiką.
5. Upload: whitelista MIME (`image/jpeg|png|webp`), weryfikacja magic bytes, nie samego nagłówka; limit 10 MB; nazwa pliku generowana po stronie serwera, nigdy z inputu użytkownika.
6. Walidacja długości pól (tytuł ≤ 120, excerpt ≤ 300, body ≤ 5000) i escapowanie przy renderowaniu — treści wstawiamy przez `textContent`, nie `innerHTML`.
7. Rate limit na `/api/auth/login`.
8. Brak logowania hasła/tokenu do konsoli.

## 8. Etapy i kryteria odbioru

Każdy etap = osobny commit + moja recenzja. Bez zielonego światła nie ruszamy dalej.

### M0 — szkielet (0,5 dnia)
`netlify.toml` z rewrite'ami, katalog `netlify/functions/`, `netlify dev` odpala stronę + funkcję `hello`.
**Odbiór:** `netlify dev` działa, strona bez zmian wizualnych, funkcja odpowiada.

### M1 — auth (0,5 dnia)
Login/logout/me, hash hasła w env, cookie, rate limit.
**Odbiór:** złe hasło → 401 bez wycieku informacji; dobre → cookie; `/api/admin/*` bez cookie → 401; 6. próba → 429.

### M2 — CRUD realizacji + upload (1,5 dnia)
Blobs, wszystkie endpointy, walidacja, kompresja po stronie klienta.
**Odbiór:** wgranie 4 MB zdjęcia z telefonu kończy się blobem < 500 kB; usunięcie wpisu kasuje też obraz; plik `.exe` przemianowany na `.jpg` zostaje odrzucony.

### M3 — panel `/admin` (1,5 dnia)
Pełny UI, responsywny, w palecie serwisu.
**Odbiór:** osoba nietechniczna dodaje realizację ze zdjęciem w < 2 min bez instrukcji; działa na 390 px.

### M4 — podpięcie pod stronę publiczną (1 dzień)
Sekcja Realizacje renderowana z `/api/content/realizacje`; stan pusty i stan błędu obsłużone (fallback: obecne 4 zdjęcia zaszyte w HTML).
**Odbiór:** API wyłączone → strona nadal wygląda poprawnie, bez pustej dziury i bez błędu w konsoli.

### M5 — Aktualności (1 dzień)
Druga kolekcja na tym samym mechanizmie, nowa sekcja na stronie + wpis w nawigacji.
**Odbiór:** dodanie aktualności pojawia się na stronie po odświeżeniu; kafelki nie rozjeżdżają się przy bardzo długim tytule.

### M6 — hardening i przekazanie (0,5 dnia)
Endpoint eksportu JSON (backup), krótka instrukcja dla klienta po polsku, zmienne środowiskowe ustawione w Netlify.
**Odbiór:** instrukcja ma ≤ 1 stronę i zawiera zrzuty ekranu; backup da się pobrać jednym kliknięciem.

**Razem: ~6,5 dnia roboczego agenta.**

## 9. Poza zakresem (świadomie)

Konta wielu użytkowników · role i uprawnienia · wersjonowanie treści · komentarze · newsletter · statystyki · pełny edytor WYSIWYG · generowanie statycznych podstron aktualności · i18n.

## 9a. ⚠️ RYZYKO KRYTYCZNE — docelowy hosting to home.pl

**Ustalenie z 11.08.2026:** strona ma docelowo stać na hostingu **home.pl**, gdzie klient ma już serwer. Przepięcie po sygnale od Piotra.

**To podważa fundament tego planu.** Cały stack z punktu 3 (Netlify Functions + Netlify Blobs) działa wyłącznie na Netlify. Na typowym współdzielonym hostingu home.pl jest PHP i MySQL, nie ma środowiska serverless ani Blobs. Przeniesienie plików przez FTP przeniesie stronę statyczną, ale **backend przestanie istnieć**.

**Do rozstrzygnięcia PRZED etapem M1** (nie zaczynać M1, dopóki nie ma decyzji):

| Wariant | Na czym stoi | Konsekwencje |
|---|---|---|
| **A. Domena na home.pl, strona i backend na Netlify** | rekordy DNS w panelu home.pl kierują na Netlify | plan zostaje bez zmian; klient płaci za hosting, którego nie używa pod tę stronę |
| **B. Wszystko na home.pl, backend w PHP + MySQL** | LAMP zamiast serverless | **plan do przepisania**: inne API, inne przechowywanie plików, inna autoryzacja (sesje PHP), inny model wdrożenia (FTP zamiast git). Etapy M1–M6 tracą aktualność |
| **C. Strona statyczna na home.pl, samo API na Netlify** | rozdzielenie warstw | wymaga CORS i osobnej domeny/subdomeny dla API; dwa miejsca do utrzymania |

**Rekomendacja: wariant A.** Netlify daje darmowy hosting statyczny z CDN, HTTPS, deploy z gita i funkcje serverless w jednym. Home.pl zostaje przy rejestracji domeny i poczcie. Jedyny koszt to zmiana rekordów DNS.

**Jeśli klient uprze się przy trzymaniu wszystkiego na swoim serwerze — wariant B i przepisanie planu od punktu 3.** Trzeba wtedy najpierw sprawdzić w panelu home.pl: wersję PHP, dostęp do MySQL, limit uploadu (`upload_max_filesize`), dostępność `mod_rewrite` i czy jest SSH/cron.

**Do sprawdzenia niezależnie od wariantu:** czy pakiet klienta w home.pl obsługuje Node.js (część planów tak, część nie) — to zmienia dostępne opcje.

### Rozpoznanie stanu faktycznego (11.08.2026)

```
kapitello.pl      → A 46.242.239.188 (home.pl), Server: Apache
www.kapitello.pl  → CNAME kapitello.pl
Treść             → WordPress z wtyczką „UnderConstructionPage" (strona w budowie)
MX                → preference 10, mail exchanger = kapitello.pl   ⚠️
```

**Wniosek 1 — na home.pl stoi WordPress.** To otwiera czwarty wariant: przerobić stronę na motyw WordPressa i wykorzystać wbudowany panel zamiast pisać własny CRM. Odrzucony — uzasadnienie w sekcji 9b.

**Wniosek 2 — ⚠️ MX WSKAZUJE NA GOŁĄ DOMENĘ.** Rekord pocztowy prowadzi do `kapitello.pl`, czyli podąża za rekordem A. **Zmiana A na Netlify skieruje pocztę na serwery Netlify, które nie obsługują SMTP — maile do `biuro@kapitello.pl` przestaną przychodzić i będą bezpowrotnie tracone.**

**Kolejność przepięcia jest nienegocjowalna:**

1. Najpierw w panelu home.pl zmienić MX z `kapitello.pl` na właściwy host pocztowy home.pl (zwykle `mail.home.pl` — do potwierdzenia w panelu klienta).
2. Odczekać na propagację i **zweryfikować wysyłkę oraz odbiór testowego maila**.
3. Dopiero wtedy zmienić rekord A / CNAME na Netlify.
4. Skopiować przy okazji rekordy SPF, DKIM i DMARC, jeśli istnieją.

Pominięcie kroku 1 oznacza utratę korespondencji firmowej. To najpoważniejsze ryzyko całego wdrożenia — poważniejsze niż cokolwiek w kodzie.

## 9b. Dlaczego nie WordPress (skoro już tam stoi)

| Kryterium | WordPress na home.pl | Statyczna strona + własny panel |
|---|---|---|
| Panel do treści | gotowy, zero pracy | do napisania (M1–M5) |
| Wydajność / Core Web Vitals | WP + PHP na współdzielonym hostingu = wolniej | pliki statyczne z CDN, bardzo szybko |
| Utrzymanie | aktualizacje rdzenia i wtyczek, kopie zapasowe, podatności | brak powierzchni ataku poza własnym API |
| Koszt SEO | wolniejsza strona utrudnia sprzedawaną usługę pozycjonowania | szybkość jest argumentem sprzedażowym |
| Obecny design | do przepisania na motyw PHP | zostaje bez zmian |

Decydujące: sprzedajemy klientowi pozycjonowanie. Stawianie strony na wolniejszym stosie, żeby zaoszczędzić kilka dni pracy nad panelem, podcina usługę, którą chcemy sprzedać. **Wariant A przyjęty.**

## 10. Zasady dla wykonawcy

1. **Zero build stepu na froncie.** Bez Reacta, bez Vite, bez Tailwinda. Panel to HTML + CSS + moduły ES.
2. **Zależności npm tylko dla funkcji**, minimum: `jsonwebtoken` (lub `jose`), `@netlify/blobs`, biblioteka do hasha. Każda kolejna — do akceptacji.
3. **Nie ruszać palety.** Kolory wyłącznie przez istniejące zmienne CSS z `styles.css`.
4. Cały interfejs i komunikaty błędów **po polsku**, z poprawnymi znakami diakrytycznymi.
5. Commit na etap, wiadomość po polsku, opis co i dlaczego.
6. **Nie commitować** `.env`, kluczy, hasła, plików z `assets/zdjecia/`.
7. Przy niejasności — pytanie do agenta głównego, nie zgadywanie.

## 11. Punkty kontrolne recenzenta

Przy każdym etapie sprawdzam: czy sekret nie wyciekł do repo · czy endpoint admina realnie weryfikuje token · czy walidacja jest po stronie serwera, nie tylko w formularzu · czy strona publiczna przeżywa brak API · czy panel działa na 390 px · czy nie doszły zależności spoza listy.

---

## Otwarte pytania do klienta

1. Ilu osobom dajemy dostęp do panelu? (plan zakłada jedno wspólne hasło)
2. Czy Aktualności mają mieć osobne podstrony (`/aktualnosci/tytul-wpisu`), czy wystarczy lista z rozwijanym tekstem?
3. Czy potwierdzają liczby ze strony: „250+ instalacji", „5 MW+", „8 lat doświadczenia"?
4. Moce instalacji (kWp) do opisów realizacji — czy podadzą realne dane?
