# Raport z audytu bezpieczeństwa i spójności kodu — tombergson.eu

**Zakres:** struktura projektu, `next.config.ts`, `Dockerfile`, CI (`.github/workflows`), API `/app/api/contact`, walidacja Zod, komponenty, TS/ESLint, gałęzie git, `.env.local`, `package.json`.
**Weryfikacja:** `eslint`, `tsc --noEmit` (audyt); `curl -I` na produkcji i stagingu, testy endpointu `/api/contact` przez `curl` (403, 415, 400, 413, 429), test formularza na stagingu (15.11.2026).
**Data aktualizacji:** 15.11.2026

---

## Podsumowanie

| Kategoria | Znaleziska | Stan aktualny |
|-----------|------------|---------------|
| KRYTYCZNE | 4 | ✅ 4/4 wdrożone |
| WAŻNE | 14 | ✅ 8 w pełni, 🔶 1 częściowo, ⚠️ 5 otwartych (8, 9, 10, 17, 18) |
| DO ROZWAŻENIA | 6 | ✅ 4 (19, 21, 23, 24), 📋 2 w backlogu (20, 22) |
| NOWE (sesja 15.11.2026) | 7 | ✅ wdrożone (25–31) |

**Korekta względem poprzedniej wersji raportu:**

- Punkt 8 był oznaczony jako naprawiony, ale w `components/Contact.tsx` nadal jest twardy fallback klucza Turnstile. Status zmieniony na **otwarty**.
- Punkt 14 (`Contact.tsx`) jest już zamknięty: `decodedEmail` to zwykła stała, bez `useEffect`.
- Data aktualizacji poprzedniej wersji (15.09.2026) była literówką.

---

## [KRYTYCZNE] — status

### 1. Brak `.dockerignore` → ryzyko sekretów w obrazie Docker
**Status: ✅ NAPRAWIONE**

- **Było:** `COPY . .` bez `.dockerignore` — ryzyko wciągnięcia `.env*`, `.git`, `.next` do warstw obrazu (GHCR).
- **Jest:** plik `.dockerignore` z m.in. `.env*`, `.git`, `.next`, `node_modules`.
- **Uwaga:** `.env*` nadal musi pozostać w `.gitignore` (zweryfikowane — sekrety nie były w historii gita).

### 2. HTML injection w treści e-maila
**Status: ✅ NAPRAWIONE**

- **Było:** `name` / `email` / `message` wstawiane do HTML Resend bez escapowania.
- **Jest:** funkcja `escapeHtml()` w `app/api/contact/route.ts` przed szablonem HTML.
- **Uwaga:** temat maila (`subject`) to czysty tekst, więc tam **nie** stosujemy `escapeHtml` (dałoby `&amp;`), tylko usuwamy CR/LF i skracamy do 100 znaków (punkt 29).

### 3. Wyciek szczegółów błędu do klienta
**Status: ✅ NAPRAWIONE**

- **Było:** `message: error?.message` po stronie klienta.
- **Jest:** generyczne komunikaty dla przeglądarki; szczegóły tylko w logach serwera. Błąd Resend zwraca klientowi `502`, a nie status upstreamu (punkt 28).

### 4. Logowanie PII (RODO)
**Status: ✅ NAPRAWIONE**

- **Było:** `console.log` z odpowiedzią Resend / danymi formularza.
- **Jest:** logowanie statusów, kodów i hostów bez treści formularza (imię, e-mail, wiadomość).
- **Uwaga:** przy błędzie Resend logowane jest body odpowiedzi API (`RESEND_API_ERROR`). Nie wolno do logów dodawać payloadu żądania.

---

## [WAŻNE] — status

### 5. Nagłówki bezpieczeństwa
**Status: ✅ NAPRAWIONE I ZWERYFIKOWANE** (`curl -I` na produkcji i stagingu, 15.11.2026)

W `next.config.ts` (produkcja):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Opener-Policy: same-origin
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
```

Dodatkowo `poweredByHeader: false` (nagłówek `x-powered-by` zniknął).

W trybie `development` CSP dodatkowo zawiera `'unsafe-eval'`, `ws:`, `wss:` i nie ma `upgrade-insecure-requests`.

**Zmiany względem pierwszej wersji CSP:**

- usunięto `https://api.resend.com` z `connect-src` (Resend woła tylko serwer),
- `img-src` zawężone z `https:` do `'self' data: blob:` (brak `remotePatterns`),
- `font-src` bez `data:`,
- dodano `upgrade-insecure-requests`, HSTS i COOP,
- naprawiono literówkę `img-src'self'` (brak spacji unieważniał dyrektywę).

**Znane ograniczenia:**

- `script-src 'unsafe-inline'` — główny powód, dla którego Mozilla Observatory nie da A+. Ścieżka do ścisłego CSP: `proxy.ts` z nonce, ale wymusza to dynamiczne renderowanie całej strony (utrata statycznego prerenderingu). Decyzja: zostajemy przy obecnym CSP, bo to wizytówka (ASVS L1).
- HSTS bez `preload`. Dodawać dopiero po sprawdzeniu, że wszystkie subdomeny działają po HTTPS.
- HSTS ustawiaj w jednym miejscu: w aplikacji **albo** w panelu Cloudflare, nie w obu.
- Cloudflare Web Analytics (`beacon.min.js`) jest blokowane przez CSP — decyzja otwarta (punkt 32 na liście do poprawy).

### 6. Rate limiting na `/api/contact`
**Status: ✅ NAPRAWIONE**

- `lib/rateLimit.ts` — **5 żądań / minutę / IP**, okno stałe.
- Klucz: `cf-connecting-ip` (fallback `x-real-ip`, potem pierwszy element `x-forwarded-for`). Podszycie się pod nagłówek jest możliwe tylko przy dostępie do originu z pominięciem Cloudflare — patrz „Cloudflare i serwer".
- Okresowe sprzątanie wygasłych wpisów (co okno) oraz twardy limit **10 000** śledzonych kluczy; przy pełnej mapie nowe klucze są odrzucane (fail closed).
- **Ograniczenie:** limiter in-memory — działa per proces i resetuje się po restarcie kontenera. Główną warstwą powinna być reguła rate limiting w Cloudflare WAF (do konfiguracji). Przy wielu replikach rozważyć Redis.

### 7. Kruchy check Zod + `any`
**Status: ✅ NAPRAWIONE**

- `error instanceof z.ZodError`, `catch (error)` bez `any`.

### 8. Hardkodowany fallback klucza Turnstile
**Status: ⚠️ OTWARTE** (poprzednio błędnie oznaczone jako naprawione)

- **Jest:** w `components/Contact.tsx` site key to `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "<klucz produkcyjny>"`. W dev używany jest klucz testowy Cloudflare.
- **Skutek:** `NEXT_PUBLIC_*` jest wstawiane do bundla w czasie `next build`. Jeśli obraz nie dostaje klucza jako build arg, staging po cichu używa widgetu produkcyjnego.
- **Do zrobienia:**
  1. `ARG` + `ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY` w `Dockerfile` przed `npm run build`, `build-args` w workflow (osobny sekret dla stagingu i produkcji),
  2. osobny widget Turnstile dla `staging.tombergson.eu`,
  3. usunąć fallback z kodu (brak klucza = widoczny błąd, nie cicha podmiana).

### 9. Nieużywana zależność `@marsidev/react-turnstile` + literówka w `turnstile.d.ts`
**Status: ⏸️ ODŁOŻONE (decyzja PO)**

- **Do zrobienia:** usunąć paczkę i `turnstile.d.ts` **albo** przejść na oficjalny komponent biblioteki (obecnie ręczny `<Script>` + `window.turnstile`).
- **Uwaga:** `Contact.tsx` sam deklaruje `Window.turnstile` (`declare global`), więc `turnstile.d.ts` może być zdublowany.

### 10. Duplikacja modelu portfolio (`projects.json` vs hardcode w `Portfolio.tsx`)
**Status: ⏸️ ODŁOŻONE (decyzja PO)**

- **Do zrobienia:** jeden źródłowy model — albo usunąć martwy `content/projects.json`, albo render z JSON i ujednolicić `category` / `categories`.

### 11. Escape / focus w menu mobilnym vs modal portfolio
**Status: 🔶 CZĘŚCIOWO**

- Dodano obsługę **Escape** w `Header.tsx`.
- **Do poprawy:** pełne zarządzanie fokusem (focus trap / powrót fokusu na toggle po zamknięciu), ewentualnie wspólny hook `useOverlay`.

### 12. Focus ring na przycisku mobile menu
**Status: ✅ NAPRAWIONE**

- `focus-visible:ring-2` (spójnie z resztą UI).

### 13. ARIA: `role="tab"` + `aria-pressed`
**Status: ✅ NAPRAWIONE**

- Usunięte `aria-pressed` przy `role="tab"`.
- **Opcjonalnie później:** filtry jako zwykłe przyciski z `aria-pressed` (bez semantyki zakładek), jeśli nie ma paneli `tabpanel`.

### 14. ESLint `set-state-in-effect`
**Status: ✅ NAPRAWIONE**

- `AnimatedText.tsx` — naprawione.
- `Contact.tsx` — `decodedEmail` jest zwykłą stałą, bez `useEffect`.
- **Drobne sprzątanie:** w JSX została martwa gałąź `decodedEmail ? … : "[Ładowanie adresu...]"`, którą można usunąć.

### 15–16. `no-explicit-any` / nieużywany `err`
**Status: ✅ NAPRAWIONE**

### 17. Social links — 3× skopiowany markup
**Status: ⚠️ NIEDOKOŃCZONE**

- W `Contact.tsx` nadal trzy skopiowane `<a>` (Instagram, Facebook, YouTube).
- **Do zrobienia:** tablica `socialLinks[]` + `.map()` jak w `navItems` / `TechStrip`.

### 18. `unoptimized` na obrazie w modalu Portfolio
**Status: 📋 BACKLOG**

- Jedyny `unoptimized` w projekcie — dodać komentarz uzasadniający albo usunąć dla spójności z `next/image`.

---

## [DO ROZWAŻENIA] — status

| # | Temat | Status |
|---|--------|--------|
| **19** | README — Getting Started | ✅ Uzupełnione (`npm install`, `npm run build`) |
| **20** | Duplikacja klas błędów pól formularza | 📋 Wydzielić `FormField` / wspólny helper |
| **21** | `aria-controls` → element poza DOM | ✅ Nav `#mobile-menu` zawsze w DOM, widoczność CSS |
| **22** | `npm audit` | 📋 Uruchomić lokalnie i dodać krok w CI (blokada przy `high`/`critical`) |
| **23** | `NODE_ENV` a testowe klucze Turnstile | ✅ Udokumentowane w sekcji „Konfiguracja i środowiska" |
| **24** | Rok w stopce | ✅ `new Date().getFullYear()` |

---

## [NOWE] Utwardzenie endpointu i nagłówków (sesja 15.11.2026)

### 25. Kontrola `Origin` i `Content-Type` w `/api/contact`
**Status: ✅ WDROŻONE** (test: brak/obcy `Origin` → 403, zły `Content-Type` → 415)

- **Problem:** `request.json()` nie sprawdza `Content-Type`, więc cross-site POST jako `text/plain` omijał preflight CORS.
- **Jest:** poza `development` wymagany `Origin` z listy `ALLOWED_ORIGINS`; wymagany `Content-Type: application/json`.

### 26. Limit rozmiaru body i bezpieczny parse JSON
**Status: ✅ WDROŻONE** (test: >10 KB → 413, niepoprawny JSON → 400)

- Limit 10 000 B (nagłówek `content-length` oraz długość odczytanego tekstu), niepoprawny JSON i body niebędące obiektem → 400 zamiast 500.

### 27. Weryfikacja Turnstile po stronie serwera
**Status: ✅ WDROŻONE**

- Usunięto bypass (`NODE_ENV !== "production"` wyłączał weryfikację na każdym środowisku innym niż `production`). W dev używamy testowych kluczy Cloudflare po obu stronach.
- `siteverify` z `remoteip`, timeoutem 8 s i sprawdzeniem `hostname` względem `ALLOWED_ORIGINS` (poza dev).
- Brak `TURNSTILE_SECRET_KEY` lub `RESEND_API_KEY` → `CONFIG_ERROR` w logach i 500 (wcześniej pusty secret przechodził jako `""`).
- Odrzucenia logowane jako `TURNSTILE_REJECTED` (z `error-codes`) i `ORIGIN_REJECTED`.

### 28. Statusy odpowiedzi i timeouty
**Status: ✅ WDROŻONE**

- Błąd Resend → `502` (nie status z upstreamu), timeout 10 s dla Resend.
- Odpowiedź sukcesu to `{ "success": true }` bez ID wiadomości.

### 29. Schemat Zod (`lib/validations/contact.ts`)
**Status: ✅ WDROŻONE**

- `trim()` oraz górne limity: `name` ≤ 100, `email` ≤ 254, `message` ≤ 5000.
- Blokada znaków sterujących (w tym CR/LF) w `name`; w `message` dozwolone `\t`, `\n`, `\r`.
- Te same limity jako `maxLength` w polach formularza (`Contact.tsx`).

### 30. Token Turnstile jest jednorazowy
**Status: ⚠️ DO WDROŻENIA / ZWERYFIKOWANIA**

- **Problem:** `Contact.tsx` nie resetuje widgetu po wysyłce. Po udanej wysyłce przycisk pozostaje zablokowany do przeładowania strony, a po błędzie serwera ponowna próba używa zużytego tokenu.
- `error-callback` połyka kod błędu widgetu, więc użytkownik nie widzi przyczyny.
- **Do zrobienia:** zapisywać ID widgetu z `turnstile.render`, wywoływać `turnstile.reset(id)` w `finally` po wysyłce, pokazywać komunikat z kodem błędu widgetu, użyć `onReady` zamiast `onLoad`. Gotowa wersja pliku została przygotowana osobno.

### 31. `/.well-known/security.txt` (RFC 9116)
**Status: ✅ ZAIMPLEMENTOWANE** (test lokalny: 200, `text/plain`; wdrożenie na staging/produkcję do potwierdzenia)

- Trasa `app/.well-known/security.txt/route.ts` z `dynamic = "force-dynamic"`; `Expires` liczone przy każdym żądaniu (+360 dni), więc nie wygasa.
- Przy zmianie adresu kontaktowego trzeba ręcznie zaktualizować stałą `CONTACT` w pliku.
- Nie trzymać równolegle statycznego `public/.well-known/security.txt` (przesłoniłby trasę).

---

## Konfiguracja i środowiska

### Zmienne środowiskowe

| Zmienna | Kiedy czytana | Uwagi |
|---------|---------------|-------|
| `TURNSTILE_SECRET_KEY` | runtime (kontener) | Wymagana. Brak → 500 + `CONFIG_ERROR`. Musi należeć do tego samego widgetu co site key. |
| `RESEND_API_KEY` | runtime (kontener) | Wymagana. Brak → 500 + `CONFIG_ERROR`. |
| `CONTACT_EMAIL_TO` | runtime | Opcjonalna, domyślnie `studio@tombergson.eu`. |
| `ALLOWED_ORIGINS` | runtime | Lista po przecinku, **ze schematem, bez ukośnika na końcu**. Domyślnie `https://tombergson.eu`. Staging musi dopisać `https://staging.tombergson.eu`. Zmiana wymaga restartu kontenera. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **build** | Wstawiana do bundla w `next build` (build arg), zmiana wymaga przebudowy obrazu. Patrz punkt 8. |
| `NODE_ENV` | build i runtime | W obrazie musi być `production`. |

### Zachowanie `NODE_ENV=development` (nigdy na produkcji)

- Pominięta kontrola `Origin` i `hostname` z Turnstile.
- Błąd sieci do Resend zwraca fałszywy sukces.
- CSP zawiera `'unsafe-eval'` i `ws:`/`wss:`.
- W `Contact.tsx` używany jest testowy site key.

Lokalne testy: w `.env.local` testowy secret Cloudflare (`1x0000000000000000000000000000000AA`), który zawsze przechodzi. Prawdziwych kluczy nie wpisywać do dokumentacji ani do repozytorium.

### Środowiska i wdrożenie

- Gałęzie: `dev` → `staging` → `main`. Staging jest źródłem prawdy; CI buduje obraz do GHCR i mirroruje kod oraz obraz do GitLaba.
- `staging.tombergson.eu` jest za basic auth. **Hasło musi być losowe** (nie domyślne), przechowywane poza repozytorium.
- Domena stagingu musi być dodana w Cloudflare → Turnstile → widget → Hostname Management (albo osobny widget dla stagingu — zalecane).

### Cloudflare i serwer

- [ ] SSL/TLS: Always Use HTTPS, Minimum TLS 1.2
- [ ] HSTS w jednym miejscu (aplikacja albo Cloudflare)
- [ ] Reguła WAF Rate limiting: `POST /api/contact`
- [ ] Firewall originu: 80/443 tylko z zakresów IP Cloudflare (inaczej `cf-connecting-ip` da się podszyć)
- [ ] Web Analytics: wyłączyć albo dodać hosty do CSP (`https://static.cloudflareinsights.com` w `script-src`, `https://cloudflareinsights.com` w `connect-src`)

---

## Diagnostyka formularza (runbook)

Test endpointu z poziomu serwera (basic auth na stagingu przez `-u`):

```bash
curl -s -i -X POST https://DOMENA/api/contact \
  -H "Origin: https://DOMENA" -H "Content-Type: application/json" \
  -d '{"name":"Jan","email":"jan@example.com","message":"Test wiadomości 123","turnstileToken":"x"}'
```

| Odpowiedź / log | Przyczyna | Naprawa |
|-----------------|-----------|---------|
| `403 Forbidden.` / `ORIGIN_REJECTED` | Domena nie jest w `ALLOWED_ORIGINS` | Dopisz origin i zrestartuj kontener |
| `415` | Klient nie wysyła `application/json` | Sprawdź `fetch` w formularzu |
| `413` | Body > 10 KB | Oczekiwane dla nadużyć |
| `400 Brak tokenu…` | Widget nie wyrenderował się albo nie dał tokenu | Hostname Management, site key |
| `400 Niepomyślna weryfikacja…` z fałszywym tokenem | **Normalne** (potwierdza, że Origin i secret działają) | — |
| `TURNSTILE_REJECTED` + `invalid-input-secret` | Zły secret w env | Popraw secret |
| `TURNSTILE_REJECTED` + `invalid-input-response` (prawdziwy token) | Secret i site key z różnych widgetów | Użyj pary z tego samego widgetu |
| `TURNSTILE_REJECTED` z innym `hostname` | Domena spoza listy widgetu | Hostname Management |
| `500` + `CONFIG_ERROR` | Brak sekretu w env | Uzupełnij env |
| `502` + `RESEND_API_ERROR` | Klucz Resend lub domena nadawcy | Sprawdź Resend |
| `429` | Limit 5 żądań/min/IP | Po minucie albo restart procesu przy testach |

Szybki test samego secretu bez wdrażania:

```bash
docker exec NAZWA_KONTENERA node -e 'fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY||"",response:"x"})}).then(r=>r.json()).then(j=>console.log(JSON.stringify(j)))'
```

`invalid-input-response` oznacza poprawny secret (zły jest tylko token `x`); `invalid-input-secret` oznacza zły secret.

---

## Znane, nieszkodliwe komunikaty w konsoli

Pochodzą z iframe Cloudflare Turnstile (ślady typu `normal:1:…`), nie z kodu aplikacji. **Nie wymagają działań.** Najwięcej szumu jest w Safari; Chrome pokazuje błędy widgetu z prefiksem `[Cloudflare Turnstile]`.

| Komunikat | Wyjaśnienie |
|-----------|-------------|
| `Unrecognized Content-Security-Policy directive 'trusted-types'` / `'require-trusted-types-for'` | Nagłówki CSP wysyła Cloudflare w odpowiedzi iframe, Safari ich nie obsługuje |
| `Blocked a frame with origin "https://challenges.cloudflare.com"…` | Same-Origin Policy działa poprawnie |
| `NaN`, `Śledzenie: …`, `Brak właściwości`, `Error — normal:0` | Logi zminifikowanego skryptu widgetu |
| `401` i `Nie można było znaleźć serwera…` na długich URL-ach | Flow Private Access Token / blokady rozszerzeń |
| `Refused to connect to data:` | Najpewniej ramka Turnstile; dodawać `data:` do `connect-src` tylko, jeśli widget realnie przestanie działać |
| `window.styleMedia is deprecated` | Kod widgetu Cloudflare |

Na **stagingu** dodatkowo: `manifest.webmanifest` 401 i `_rsc … access control checks` to skutek basic auth (przeglądarka pobiera manifest i prefetch bez poświadczeń). Dotyczy tylko stagingu.

Do rozstrzygnięcia: `Refused to load …beacon.min.js` — Cloudflare Web Analytics wstrzykiwane przez Cloudflare i blokowane przez CSP (patrz „Cloudflare i serwer").

---

## Rzeczy sprawdzone i uznane za OK

- `.env*` w `.gitignore`; brak sekretów w historii gita (wszystkie branche).
- Linki `target="_blank"` mają `rel="noopener noreferrer"` (7/7).
- Brak zbędnego `images.remotePatterns` — tylko lokalne `/public`.
- `robots.ts` blokuje `/api/`.
- Walidacja Zod po stronie klienta i serwera.
- Brak `dangerouslySetInnerHTML` w aplikacji.
- Brak `localStorage` / `sessionStorage`.
- Spójne nazewnictwo komponentów (PascalCase) i props (camelCase).
- Nagłówki bezpieczeństwa potwierdzone `curl -I` na produkcji i stagingu (15.11.2026).
- Endpoint `/api/contact` przetestowany lokalnie w buildzie produkcyjnym: 403 (brak/obcy Origin), 415, 400 (zły JSON), 413, 429 po 5 żądaniach; poprawny Origin bez tokenu → 400 z komunikatem o CAPTCHA.
- Formularz kontaktowy działa na stagingu; w logach kontenera brak `ORIGIN_REJECTED`, `TURNSTILE_REJECTED`, `CONFIG_ERROR`, `RESEND_API_ERROR`, `INTERNAL_SERVER_ERROR`.

---

## Lista DO POPRAWY (kolejność zalecana)

### Przed / zaraz po starcie produkcji (wysoki priorytet)

1. **Hasło basic auth na stagingu** — zmienić na losowe.
2. **Punkt 30** — reset widgetu Turnstile po wysyłce i widoczne błędy widgetu w `Contact.tsx`.
3. **Punkt 8** — build arg z site key + osobny widget dla stagingu, potem usunięcie fallbacku.
4. **Punkt 22** — `npm audit` lokalnie i krok w CI (blokada przy `high`/`critical`).
5. **Cloudflare:** reguła rate limiting, firewall originu do IP Cloudflare, decyzja o Web Analytics.
6. **Skany po wdrożeniu produkcji:** MDN Observatory, SSL Labs, securityheaders.com.
7. **OG image** — `public/images/og-default.jpg` (1200×630) dostępny pod produkcyjnym URL.
8. **Staging:** `noindex` (robots / metadata), żeby nie dublować indeksu z produkcją.
9. **RODO:** polityka prywatności (formularz, Resend i Turnstile jako podmioty przetwarzające), stan baneru cookies.
10. **Checklist kontaktu:** dodatkowo test wstrzyknięcia HTML w polu wiadomości (escape w mailu).

### Wkrótce po starcie (średni)

11. **Punkt 17** — `socialLinks.map(...)` w `Contact.tsx`.
12. **Punkt 9** — usunąć martwą zależność Turnstile albo użyć biblioteki świadomie.
13. **Punkt 10** — jeden model danych portfolio (JSON **albo** kod, nie oba).
14. **Punkt 11** — pełny fokus (powrót na toggle) w menu mobilnym.
15. **Punkt 18** — decyzja i komentarz przy `unoptimized`.
16. Sprzątanie martwej gałęzi `decodedEmail ? … : "[Ładowanie adresu...]"`.

### Backlog (niski)

17. Wspólny `FormField` (punkt 20).
18. Rate limit oparty o Redis przy skalowaniu horyzontalnym.
19. Ścisłe CSP z nonce (`proxy.ts`) — tylko jeśli utrata statycznego prerenderingu będzie akceptowalna.
20. Skan obrazu Docker (`trivy` / `grype`) w CI.
21. Mirror w GitLabie: sprawdzić, że projekt i rejestr obrazów są prywatne i że zmienne CI nie wyciekają do logów.

---

## Checklist przed produkcją

- [ ] `npm run lint` — 0 errors
- [ ] `npx tsc --noEmit` — pass
- [x] `npm run build` — pass
- [ ] `npm audit` — przejrzany wynik
- [x] Formularz: sukces na stagingu
- [x] Endpoint: Origin, Content-Type, limit body, zły JSON, rate limit (testy `curl`)
- [ ] Formularz: injection HTML w treści → escaped w mailu
- [ ] Formularz: ponowne wysłanie bez odświeżania strony (po wdrożeniu punktu 30)
- [x] Nagłówki bezpieczeństwa widoczne (`curl -sI`) na stagingu i produkcji
- [ ] `/.well-known/security.txt` zwraca 200 na stagingu i produkcji
- [ ] Obraz produkcyjny **bez** `.env` w warstwach
- [ ] OG / canonical na `https://tombergson.eu`
- [ ] Staging z `noindex`
- [ ] Skany: Observatory, SSL Labs, securityheaders.com

---

## Wniosek

Warstwa bezpieczeństwa kontaktu, nagłówków i builda Docker jest domknięta (punkty 1–7 i 25–29), a nagłówki i działanie formularza zostały zweryfikowane na stagingu i produkcji. Projekt jest na produkcji; do domknięcia zostają:

1. punkt 30 (reset tokenu Turnstile) i punkt 8 (klucz Turnstile w buildzie, osobny widget dla stagingu),
2. `npm audit` i krok w CI,
3. konfiguracja po stronie Cloudflare (rate limiting, firewall originu, Web Analytics),
4. formalności: polityka prywatności, `noindex` na stagingu, OG image.

Punkty 9 i 10 (zależność Turnstile, model portfolio) nie blokują niczego, ale warto je ogarnąć wkrótce, żeby nie rosły jako dług techniczny.

---

*Dokument zaktualizowany na podstawie audytu kodu, raportu wdrożenia ACT oraz sesji utwardzania endpointu i nagłówków (15.11.2026).*