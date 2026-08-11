# Kapitello — SEO: audyt, frazy kluczowe, pozycjonowanie

**Wersja:** 1.0 · 11.08.2026
**Cel dokumentu:** podstawa oferty usługi pozycjonowania dla klienta + plan techniczny wdrożenia.

---

## 1. Stan obecny

**Jest:**

| Element | Ocena |
|---|---|
| `<title>`, meta description, canonical | ✅ napisane pod frazę lokalną |
| JSON-LD `LocalBusiness` (NAP, geo, godziny, areaServed) | ✅ poprawny |
| Open Graph + Twitter Card | ✅ |
| Mobile-first CSS, brak poziomego scrolla | ✅ zweryfikowane na 390 px |
| Jeden `<h1>` z frazą główną, sensowna hierarchia nagłówków | ✅ |
| `lang="pl"`, HTTPS | ✅ |

**Brakuje:**

| Brak | Skutek |
|---|---|
| `robots.txt`, `sitemap.xml` | wolniejsza i mniej przewidywalna indeksacja |
| Google Search Console i Analytics | **zero danych** — nie da się mierzyć efektu ani rozliczyć usługi |
| Wizytówka Google (Profil Firmy) | w lokalnym SEO to często ważniejsze niż sama strona |
| Podstrony usługowe | patrz punkt 2 — to jest główna bariera |
| Treści blogowe / poradnikowe | brak wejść na frazy informacyjne |
| Opisy `alt` przy zdjęciach realizacji | zdjęcia są tłami CSS, więc nie istnieją dla Google Images |
| Schema `FAQPage`, `Service`, `BreadcrumbList` | brak wyników rozszerzonych w SERP |
| Wewnętrzne linkowanie | jedna strona = brak struktury do przekazywania mocy |

## 2. Bariera strukturalna — one-pager

Strona to **jeden URL**. Google przypisuje do jednego adresu realistycznie 1–2 frazy główne. Dziesięć usług na jednej stronie konkuruje ze sobą o ten sam adres — to nazywa się kanibalizacją i jest głównym powodem, dla którego one-pagery nie rankują na frazy usługowe.

**Bez rozbicia na podstrony pozycjonowanie da efekt tylko na frazę „fotowoltaika Zduńska Wola" i warianty firmowe.** To trzeba klientowi powiedzieć wprost przy ofercie — inaczej rozliczenie z efektów skończy się sporem.

## 3. Mapa fraz kluczowych

Frazy wyprowadzone z profilu działalności (instalacje PV, magazyny energii, farmy PV, SROZE, dotacje) i zasięgu (Zduńska Wola + powiat, Sieradz, Łask, Łódź, Wieluń, Pabianice).

> ⚠️ **Wolumeny i trudność wymagają weryfikacji narzędziem** (Ahrefs / Senuto / Semstorm / Planer Google Ads). Poniższy podział to priorytetyzacja oparta na intencji i profilu firmy, nie na danych o liczbie wyszukań. Nie obiecuj klientowi liczb przed sprawdzeniem.

### Koszyk A — transakcyjne lokalne (priorytet 1, najwyższa konwersja)

| Fraza | Docelowy URL |
|---|---|
| fotowoltaika Zduńska Wola | `/` |
| panele fotowoltaiczne Zduńska Wola | `/` |
| montaż fotowoltaiki Zduńska Wola | `/fotowoltaika-dla-domu` |
| fotowoltaika Sieradz | `/fotowoltaika-sieradz` |
| fotowoltaika Łask | `/fotowoltaika-lask` |
| fotowoltaika powiat zduńskowolski | `/` |
| firma fotowoltaiczna Zduńska Wola | `/` |

### Koszyk B — usługowe (priorytet 2, budują ofertę)

| Fraza | Docelowy URL |
|---|---|
| magazyn energii do fotowoltaiki | `/magazyny-energii` |
| magazyn energii cena | `/magazyny-energii` |
| fotowoltaika dla firm | `/fotowoltaika-dla-firm` |
| farma fotowoltaiczna budowa | `/farmy-fotowoltaiczne` |
| dzierżawa gruntu pod fotowoltaikę | `/farmy-fotowoltaiczne` |
| fotowoltaika dla rolnika | `/fotowoltaika-dla-rolnictwa` |
| instalacja PV pod klucz | `/fotowoltaika-dla-domu` |

### Koszyk C — dotacyjne (priorytet 1 równorzędny — tu firma ma realną przewagę)

Klient obsługuje pięć programów. To rzadka kompetencja i frazy o wysokiej intencji.

| Fraza | Docelowy URL |
|---|---|
| dofinansowanie do fotowoltaiki | `/dotacje` |
| Mój Prąd wniosek pomoc | `/dotacje/moj-prad` |
| Czyste Powietrze wniosek pomoc | `/dotacje/czyste-powietrze` |
| Kredyt Ekologiczny FENG | `/dotacje/kredyt-ekologiczny` |
| Agroenergia dofinansowanie | `/dotacje/agroenergia` |
| premia termomodernizacyjna BGK | `/dotacje/bgk` |
| dotacje na magazyn energii | `/dotacje` |

### Koszyk D — informacyjne / blog (priorytet 3, długi ogon i budowa autorytetu)

| Fraza | Format |
|---|---|
| czy fotowoltaika się opłaca 2026 | artykuł + kalkulacja |
| ile kosztuje fotowoltaika na dom | artykuł z widełkami |
| net-billing jak działa | poradnik |
| czy magazyn energii się opłaca | artykuł porównawczy |
| ile paneli na dom 150 m2 | poradnik + kalkulator |
| fotowoltaika a podatek / formalności | poradnik |

**Świadomie odrzucone:** „nie płać za prąd", „darmowy prąd" — obietnice nie do obronienia, ryzyko reklamacji i słaba jakość ruchu. Obecne „Przestań płacić za prąd" w H1 zostawiam, bo działa jako hasło, ale nie budujemy na tym strategii fraz.

## 4. Zakres audytu SEO (produkt do sprzedaży)

**Audyt techniczny**
Indeksacja i pokrycie w GSC · robots/sitemap · Core Web Vitals (LCP, INL, CLS) na mobile i desktop · wagi i formaty obrazów · struktura nagłówków · dane strukturalne · canonical i duplikaty · błędy 404 i przekierowania · HTTPS i bezpieczeństwo nagłówków · poprawność wersji mobilnej.

**Audyt treści i fraz**
Mapa fraz z wolumenami · analiza kanibalizacji · luki treściowe względem 3–5 konkurentów lokalnych · ocena intencji na frazę · propozycja architektury URL.

**Audyt lokalny**
Profil Firmy w Google (kompletność, kategorie, zdjęcia, opinie) · spójność NAP w katalogach · widoczność w mapach na frazy z miastami.

**Audyt konkurencji**
3–5 firm PV z regionu: na co rankują, jaka struktura, jakie linki.

**Produkt końcowy:** raport z listą zadań uszeregowaną wg stosunku efektu do nakładu + harmonogram wdrożenia.

## 5. Pakiet pozycjonowania — propozycja etapów

| Etap | Zakres | Czas |
|---|---|---|
| **0. Fundament pomiarowy** | GSC, GA4, Profil Firmy w Google, robots.txt, sitemap.xml, weryfikacja indeksacji | tydzień 1 |
| **1. Naprawa techniczna** | wnioski z audytu: obrazy, CWV, dane strukturalne, `alt`, nagłówki | tydzień 2–3 |
| **2. Rozbudowa architektury** | 6–8 podstron usługowych + 5 podstron dotacyjnych wg mapy z pkt 3 | tydzień 3–8 |
| **3. Treści cykliczne** | 2–4 artykuły miesięcznie z koszyka D + aktualności z panelu CRM | ciągłe |
| **4. Lokalne i linkowanie** | katalogi branżowe, opinie, wzmianki lokalne, linkowanie wewnętrzne | ciągłe |
| **5. Raportowanie** | miesięczny raport: pozycje, ruch organiczny, zapytania z formularza | co miesiąc |

**Argument sprzedażowy:** panel CRM z etapu M5 planu backendu daje klientowi możliwość samodzielnego publikowania aktualności. Świeże treści to paliwo dla pozycjonowania — narzędzie i usługa sprzedają się razem.

## 6. Mierniki (do umowy)

Pozycje na 15–20 fraz z koszyków A i C · ruch organiczny w GSC (kliknięcia, wyświetlenia, CTR) · liczba zapytań z formularza i telefonów z wizytówki · liczba zaindeksowanych podstron.

**Nie obiecywać:** konkretnych pozycji w konkretnym terminie ani „pierwszego miejsca w Google". Rozliczenie na wzrost widoczności i liczbę zapytań, nie na pozycję.

## 7. Ryzyka i zastrzeżenia

1. **Bez GSC nie ma punktu odniesienia** — instalacja przed startem prac jest warunkiem sensownego rozliczenia.
2. **Wolumeny fraz niezweryfikowane** — patrz ostrzeżenie w pkt 3.
3. **Liczby na stronie** („250+ instalacji", „5 MW+", „8 lat") są niepotwierdzone przez klienta. Nieprawdziwe dane w treści to ryzyko wizerunkowe i prawne — potwierdzić przed startem kampanii.
4. **Hosting home.pl** — wydajność współdzielonego hostingu wpływa na Core Web Vitals. Zmierzyć TTFB po przepięciu; jeśli będzie słabo, rozważyć CDN przed domeną.
5. **Konkurencja w branży PV jest wysoka** na frazy ogólnokrajowe. Strategia stoi na frazach lokalnych i dotacyjnych — to trzeba klientowi powiedzieć wprost.

## 8. Szybkie wygrane (do zrobienia niezależnie od sprzedaży usługi)

1. `robots.txt` + `sitemap.xml` — 15 min
2. Podpięcie Google Search Console i weryfikacja domeny — 30 min
3. Zamiana teł CSS realizacji na `<img>` z `alt` i `loading="lazy"` — 1 h, odblokowuje Google Images
4. Schema `FAQPage` na sekcji dotacji — 1 h, szansa na wynik rozszerzony
5. Profil Firmy w Google: zdjęcia, kategorie, opis, prośba o opinie — po stronie klienta
