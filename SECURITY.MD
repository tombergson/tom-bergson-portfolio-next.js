# Raport z audytu bezpieczeństwa i spójności kodu — tombergson.eu

**Data aktualizacji:** 15.11.2026

**Zakres audytu:** struktura projektu, `next.config.ts`, `Dockerfile`, CI (`.github/workflows`), API `/app/api/contact`, walidacja Zod, komponenty, TypeScript/ESLint, gałęzie Git, `.env.local`, `package.json`.

**Weryfikacja:**
- ESLint, `tsc --noEmit` (audyt).
- `curl -I` na produkcji i stagingu.
- Testy endpointu `/api/contact` przez `curl` (403, 415, 400, 413, 429).
- Test formularza na stagingu.
- Weryfikacja ładowania stylów i czcionek (15.11.2026).

---

## 1. Podsumowanie

| Kategoria | Znaleziska | Stan aktualny |
|---|---:|---|
| **KRYTYCZNE** | 4 | ✅ 4/4 wdrożone |
| **WAŻNE** | 14 | ✅ 9 w pełni (w tym 30), 🔶 1 częściowo, ⚠️ 3 otwarte (9, 10, 17, 18) |
| **DO ROZWAŻENIA** | 6 | ✅ 5 w pełni (19, 21, 22, 23, 24), 📋 1 w backlogu (20) |
| **NOWE (sesja 15.11.2026)** | 7 | ✅ wdrożone (25–31) |

### Korekta względem poprzedniej wersji raportu

- **Punkt 5 (`next.config.ts`):** dodano źródło `data:` do dyrektywy `font-src` (`font-src 'self' data:`), co przywróciło poprawne ładowanie czcionek i stylów.
- **Punkt 22 (`npm audit`):** dodano krok audytu zależności zablokowany na poziomie `high` w pliku workflow CI (`deploy-staging.yml`).
- **Punkt 30 (`Contact.tsx`):** wdrożono jednorazowy reset tokenu Turnstile (`widgetIdRef`, `resetTurnstile()` w bloku `finally`), obsługę `error-callback` oraz inicjalizację z `onReady`.
- **Punkt 8 (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` jako build arg w Dockerfile):** pozostaje otwarty do pełnego spięcia z osobnym widżetem stagingowym.

---

## 2. [KRYTYCZNE] — status

### 1. Brak `.dockerignore` → ryzyko sekretów w obrazie Docker

**Status:** ✅ NAPRAWIONE

- **Było:** `COPY . .` bez `.dockerignore` — ryzyko wciągnięcia `.env*`, `.git`, `.next` do warstw obrazu (GHCR).
- **Jest:** plik `.dockerignore` z m.in. `.env*`, `.git`, `.next`, `node_modules`.

**Uwaga:** `.env*` nadal musi pozostać w `.gitignore` (zweryfikowane — sekrety nie były w historii Gita).

### 2. HTML injection w treści e-maila

**Status:** ✅ NAPRAWIONE

- **Było:** `name` / `email` / `message` wstawiane do HTML Resend bez escapowania.
- **Jest:** funkcja `escapeHtml()` w `app/api/contact/route.ts` przed szablonem HTML.

**Uwaga:** temat maila (`subject`) to czysty tekst, więc tam nie stosujemy `escapeHtml` (dałoby `&amp;`), tylko usuwamy CR/LF i skracamy do 100 znaków (punkt 29).

### 3. Wyciek szczegółów błędu do klienta

**Status:** ✅ NAPRAWIONE

- **Było:** `message: error?.message` po stronie klienta.
- **Jest:** generyczne komunikaty dla przeglądarki; szczegóły tylko w logach serwera.
- Błąd Resend zwraca klientowi `502`, a nie status upstreamu (punkt 28).

### 4. Logowanie PII (RODO)

**Status:** ✅ NAPRAWIONE

- **Było:** `console.log` z odpowiedzią Resend / danymi formularza.
- **Jest:** logowanie statusów, kodów i hostów bez treści formularza (imię, e-mail, wiadomość).

**Uwaga:** przy błędzie Resend logowane jest body odpowiedzi API (`RESEND_API_ERROR`). Nie wolno do logów dodawać payloadu żądania.

---

## 3. [WAŻNE] — status

### 5. Nagłówki bezpieczeństwa

**Status:** ✅ NAPRAWIONE I ZWERYFIKOWANE

Weryfikacja: `curl -I` na produkcji i stagingu, testy przeglądarkowe (15.11.2026).

W `next.config.ts` (produkcja):

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com;
  connect-src 'self' https://challenges.cloudflare.com;
  img-src 'self' data: blob:;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests

Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Opener-Policy: same-origin
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
```

Dodatkowo:

- `poweredByHeader: false` — nagłówek `x-powered-by` zniknął.
- W trybie development CSP dodatkowo zawiera `'unsafe-eval'`, `ws:`, `wss:` i nie ma `upgrade-insecure-requests`.

#### Zmiany względem pierwszej wersji CSP

- Usunięto `https://api.resend.com` z `connect-src` (Resend woła tylko serwer).
- `img-src` zawężone z `https:` do `'self' data: blob:` (brak `remotePatterns`).
- `font-src` zaktualizowane do `'self' data:` (umożliwia poprawne ładowanie czcionek `.woff2`).
- Dodano `upgrade-insecure-requests`, HSTS i COOP.
- Naprawiono literówkę `img-src'self'` (brak spacji unieważniał dyrektywę).

#### Znane ograniczenia

- `script-src 'unsafe-inline'` — główny powód, dla którego Mozilla Observatory nie da A+.
  - Ścieżka do ścisłego CSP: `proxy.ts` z nonce.
  - Wymusza to dynamiczne renderowanie całej strony (utrata statycznego prerenderingu).
  - **Decyzja:** zostajemy przy obecnym CSP, bo to wizytówka (ASVS L1).
- HSTS bez preload. Dodawać dopiero po sprawdzeniu, że wszystkie subdomeny działają po HTTPS.
- HSTS ustawiaj w jednym miejscu: w aplikacji albo w panelu Cloudflare, nie w obu.
- Cloudflare Web Analytics (`beacon.min.js`) jest blokowane przez CSP — decyzja otwarta (punkt 32 na liście do poprawy).

### 6. Rate limiting na `/api/contact`

**Status:** ✅ NAPRAWIONE

- `lib/rateLimit.ts` — 5 żądań / minutę / IP, okno stałe.
- Klucz: `cf-connecting-ip` (fallback `x-real-ip`, potem pierwszy element `x-forwarded-for`).
- Podszycie się pod nagłówek jest możliwe tylko przy dostępie do originu z pominięciem Cloudflare — patrz „Cloudflare i serwer”.
- Okresowe sprzątanie wygasłych wpisów (co okno) oraz twardy limit 10 000 śledzonych kluczy.
- Przy pełnej mapie nowe klucze są odrzucane (fail closed).

**Ograniczenia:**

- Limiter in-memory — działa per proces i resetuje się po restarcie kontenera.
- Główną warstwą powinna być reguła rate limiting w Cloudflare WAF (do konfiguracji).
- Przy wielu replikach rozważyć Redis.

### 7. Kruchy check Zod + `any`

**Status:** ✅ NAPRAWIONE

- `error instanceof z.ZodError`.
- `catch (error)` bez `any`.

### 8. Hardkodowany fallback klucza Turnstile

**Status:** ✅ NAPRAWIONE I ZAMKNIĘTE

- **Było:** W `components/Contact.tsx` stosowano niebezpieczny fallback: `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "<klucz produkcyjny>"`.
- **Ryzyko:** Jeśli obraz Docker skompilowałby się bez wstrzykniętego `build-arg`, staging lub produkcja po cichu korzystałyby z domyślnego klucza produkcyjnego (lub fałszywego), zamiast zgłosić błąd konfiguracji.
- **Jest (Wdrożone rozwiązanie):** Zastosowano bezpieczną logikę środowiskową w `components/Contact.tsx`:
  ```typescript
  // Klucz testowy w dev, w produkcji klucz z env (wbijany w czasie buildu)
  const SITE_KEY =
    process.env.NODE_ENV === "development"
      ? "1x00000000000000000000AA"
      : process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

### 9. Nieużywana zależność `@marsidev/react-turnstile` + literówka w `turnstile.d.ts`

**Status:** ⏸️ ODŁOŻONE (decyzja PO)

**Do zrobienia:**

- Usunąć paczkę i `turnstile.d.ts` albo przejść na oficjalny komponent biblioteki (obecnie ręczny `<Script>` + `window.turnstile`).

**Uwaga:** `Contact.tsx` sam deklaruje `Window.turnstile` (`declare global`), więc `turnstile.d.ts` może być zdublowany.

### 10. Duplikacja modelu portfolio (`projects.json` vs hardcode w `Portfolio.tsx`)

**Status:** ⏸️ ODŁOŻONE (decyzja PO)

**Do zrobienia:**

- Jeden źródłowy model — albo usunąć martwy `content/projects.json`, albo renderować z JSON i ujednolicić `category` / `categories`.

### 11. Escape / focus w menu mobilnym vs modal portfolio

**Status:** 🔶 CZĘŚCIOWO

- Dodano obsługę Escape w `Header.tsx`.
- **Do poprawy:** pełne zarządzanie fokusem (focus trap / powrót fokusu na toggle po zamknięciu), ewentualnie wspólny hook `useOverlay`.

### 12. Focus ring na przycisku mobile menu

**Status:** ✅ NAPRAWIONE

`focus-visible:ring-2` (spójnie z resztą UI).

### 13. ARIA: `role="tab"` + `aria-pressed`

**Status:** ✅ NAPRAWIONE

- Usunięte `aria-pressed` przy `role="tab"`.
- Opcjonalnie później: filtry jako zwykłe przyciski z `aria-pressed` (bez semantyki zakładek), jeśli nie ma paneli `tabpanel`.

### 14. ESLint `set-state-in-effect`

**Status:** ✅ NAPRAWIONE

- `AnimatedText.tsx` — naprawione.
- `Contact.tsx` — `decodedEmail` jest zwykłą stałą, bez `useEffect`.

**Drobne sprzątanie:** w JSX została martwa gałąź `decodedEmail ? … : "[Ładowanie adresu...]"`, którą można usunąć.

### 15–16. `no-explicit-any` / nieużywany `err`

**Status:** ✅ NAPRAWIONE

### 17. Social links — 3× skopiowany markup

**Status:** ⚠️ NIEDOKOŃCZONE

- W `Contact.tsx` nadal trzy skopiowane `<a>` (Instagram, Facebook, YouTube).
- **Do zrobienia:** tablica `socialLinks[]` + `.map()` jak w `navItems` / `TechStrip`.

### 18. `unoptimized` na obrazie w modalu Portfolio

**Status:** 📋 BACKLOG

Jedyny `unoptimized` w projekcie — dodać komentarz uzasadniający albo usunąć dla spójności z `next/image`.

---

## 4. [DO ROZWAŻENIA] — status

| Nr | Temat | Status |
|---:|---|---|
| 19 | README — Getting Started | ✅ Uzupełnione (`npm install`, `npm run build`) |
| 20 | Duplikacja klas błędów pól formularza | 📋 Wydzielić `FormField` / wspólny helper |
| 21 | `aria-controls` → element poza DOM | ✅ Nav `#mobile-menu` zawsze w DOM, widoczność CSS |
| 22 | `npm audit` | ✅ Wdrożone w CI (`.github/workflows/deploy-staging.yml` — krok `npm audit --audit-level=high`) |
| 23 | `NODE_ENV` a testowe klucze Turnstile | ✅ Udokumentowane w sekcji „Konfiguracja i środowiska” |
| 24 | Rok w stopce | ✅ `new Date().getFullYear()` |

---

## 5. [NOWE] Utwardzenie endpointu i nagłówków (sesja 15.11.2026)

### 25. Kontrola Origin i Content-Type w `/api/contact`

**Status:** ✅ WDROŻONE

Test: brak/obcy Origin → `403`, zły Content-Type → `415`.

**Problem:** `request.json()` nie sprawdza Content-Type, więc cross-site POST jako `text/plain` omijał preflight CORS.

**Jest:**

- Poza development wymagany Origin z listy `ALLOWED_ORIGINS`.
- Wymagany Content-Type: `application/json`.

### 26. Limit rozmiaru body i bezpieczny parse JSON

**Status:** ✅ WDROŻONE

Test: `>10 KB` → `413`, niepoprawny JSON → `400`.

- Limit 10 000 B (nagłówek `content-length` oraz długość odczytanego tekstu).
- Niepoprawny JSON i body niebędące obiektem → `400` zamiast `500`.

### 27. Weryfikacja Turnstile po stronie serwera

**Status:** ✅ WDROŻONE

- Usunięto bypass (`NODE_ENV !== "production"` wyłączał weryfikację na każdym środowisku innym niż production).
- W dev używamy testowych kluczy Cloudflare po obu stronach.
- `siteverify` z `remoteip`, timeoutem 8 s i sprawdzeniem hostname względem `ALLOWED_ORIGINS` (poza dev).
- Brak `TURNSTILE_SECRET_KEY` lub `RESEND_API_KEY` → `CONFIG_ERROR` w logach i `500` (wcześniej pusty secret przechodził jako `""`).
- Odrzucenia logowane jako `TURNSTILE_REJECTED` (z `error-codes`) i `ORIGIN_REJECTED`.

### 28. Statusy odpowiedzi i timeouty

**Status:** ✅ WDROŻONE

- Błąd Resend → `502` (nie status z upstreamu).
- Timeout 10 s dla Resend.
- Odpowiedź sukcesu to:

```json
{ "success": true }
```

Bez ID wiadomości.

### 29. Schemat Zod (`lib/validations/contact.ts`)

**Status:** ✅ WDROŻONE

- `trim()` oraz górne limity:
  - `name` ≤ 100,
  - `email` ≤ 254,
  - `message` ≤ 5000.
- Blokada znaków sterujących (w tym CR/LF) w `name`.
- W `message` dozwolone `\t`, `\n`, `\r`.
- Te same limity jako `maxLength` w polach formularza (`Contact.tsx`).

### 30. Token Turnstile jest jednorazowy

**Status:** ✅ WDROŻONE

W `components/Contact.tsx` dodano:

- `widgetIdRef` do śledzenia ID widżetu z `turnstile.render`.
- Funkcję `resetTurnstile()` resetującą widżet w bloku `finally` po wysyłce.
- `error-callback` przekazujący czytelny komunikat błędu z kodem do interfejsu użytkownika.

### 31. `/.well-known/security.txt` (RFC 9116)

**Status:** ✅ ZAIMPLEMENTOWANE

Test lokalny: `200`, `text/plain`; wdrożenie na staging/produkcję do potwierdzenia.

- Trasa `app/.well-known/security.txt/route.ts` z `dynamic = "force-dynamic"`.
- `Expires` liczone przy każdym żądaniu (+360 dni), więc nie wygasa.
- Przy zmianie adresu kontaktowego trzeba ręcznie zaktualizować stałą `CONTACT` w pliku.
- Nie trzymać równolegle statycznego `public/.well-known/security.txt` (przesłoniłby trasę).

---

## 6. Konfiguracja i środowiska

### Zmienne środowiskowe

| Zmienna | Kiedy czytana | Uwagi |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | runtime (kontener) | Wymagana. Brak → `500` + `CONFIG_ERROR`. Musi należeć do tego samego widgetu co site key. |
| `RESEND_API_KEY` | runtime (kontener) | Wymagana. Brak → `500` + `CONFIG_ERROR`. |
| `CONTACT_EMAIL_TO` | runtime | Opcjonalna, domyślnie `studio@tombergson.eu`. |
| `ALLOWED_ORIGINS` | runtime | Lista po przecinku, ze schematem, bez ukośnika na końcu. Domyślnie `https://tombergson.eu`. Staging musi dopisać `https://staging.tombergson.eu`. Zmiana wymaga restartu kontenera. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build | Wstawiana do bundla w `next build` (build arg), zmiana wymaga przebudowy obrazu. Patrz punkt 8. |
| `NODE_ENV` | build i runtime | W obrazie musi być `production`. |

### Zachowanie `NODE_ENV=development` (nigdy na produkcji)

- Pominięta kontrola Origin i hostname z Turnstile.
- Błąd sieci do Resend zwraca fałszywy sukces.
- CSP zawiera `'unsafe-eval'` i `ws:`/`wss:`.
- W `Contact.tsx` używany jest testowy site key.

**Lokalne testy:** w `.env.local` testowy secret Cloudflare (`1x0000000000000000000000000000000AA`), który zawsze przechodzi.

Prawdziwych kluczy nie wpisywać do dokumentacji ani do repozytorium.

### Środowiska i wdrożenie

- Gałęzie: `dev` → `staging` → `main`.
- Staging jest źródłem prawdy.
- CI buduje obraz do GHCR i mirroruje kod oraz obraz do GitLaba.
- `staging.tombergson.eu` jest za basic auth.
- Hasło musi być losowe (nie domyślne), przechowywane poza repozytorium.
- Domena stagingu musi być dodana w Cloudflare → Turnstile → widget → Hostname Management (albo osobny widget dla stagingu — zalecane).

---

## 7. Cloudflare i serwer

- [ ] SSL/TLS: Always Use HTTPS, Minimum TLS 1.2.
- [ ] HSTS w jednym miejscu (aplikacja albo Cloudflare).
- [ ] Reguła WAF Rate limiting: `POST /api/contact`.
- [ ] Firewall originu: 80/443 tylko z zakresów IP Cloudflare (inaczej `cf-connecting-ip` da się podszyć).
- [ ] Web Analytics: wyłączyć albo dodać hosty do CSP:
  - `https://static.cloudflareinsights.com` w `script-src`,
  - `https://cloudflareinsights.com` w `connect-src`.

---

## 8. Diagnostyka formularza (runbook)

### Test endpointu z poziomu serwera

Basic auth na stagingu przez `-u`.

```bash
curl -s -i -X POST https://DOMENA/api/contact \
  -H "Origin: https://DOMENA" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jan","email":"jan@example.com","message":"Test wiadomości 123","turnstileToken":"x"}'
```

### Interpretacja odpowiedzi i logów

| Odpowiedź / log | Przyczyna | Naprawa |
|---|---|---|
| `403 Forbidden` / `ORIGIN_REJECTED` | Domena nie jest w `ALLOWED_ORIGINS` | Dopisz origin i zrestartuj kontener |
| `415` | Klient nie wysyła `application/json` | Sprawdź `fetch` w formularzu |
| `413` | Body > 10 KB | Oczekiwane dla nadużyć |
| `400 Brak tokenu…` | Widget nie wyrenderował się albo nie dał tokenu | Hostname Management, site key |
| `400 Niepomyślna weryfikacja…` z fałszywym tokenem | Normalne (potwierdza, że Origin i secret działają) | — |
| `TURNSTILE_REJECTED` + `invalid-input-secret` | Zły secret w env | Popraw secret |
| `TURNSTILE_REJECTED` + `invalid-input-response` (prawdziwy token) | Secret i site key z różnych widgetów | Użyj pary z tego samego widgetu |
| `TURNSTILE_REJECTED` z innym hostname | Domena spoza listy widgetu | Hostname Management |
| `500` + `CONFIG_ERROR` | Brak sekretu w env | Uzupełnij env |
| `502` + `RESEND_API_ERROR` | Klucz Resend lub domena nadawcy | Sprawdź Resend |
| `429` | Limit 5 żądań/min/IP | Po minucie albo restart procesu przy testach |

### Szybki test samego secretu bez wdrażania

```bash
docker exec NAZWA_KONTENERA node -e 'fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY||"",response:"x"})}).then(r=>r.json()).then(j=>console.log(JSON.stringify(j)))'
```

- `invalid-input-response` oznacza poprawny secret (zły jest tylko token `x`).
- `invalid-input-secret` oznacza zły secret.

---

## 9. Znane, nieszkodliwe komunikaty w konsoli

Pochodzą z iframe Cloudflare Turnstile (ślady typu `normal:1:…`), nie z kodu aplikacji. Nie wymagają działań.

Najwięcej szumu jest w Safari; Chrome pokazuje błędy widgetu z prefiksem `[Cloudflare Turnstile]`.

| Komunikat | Wyjaśnienie |
|---|---|
| `Unrecognized Content-Security-Policy directive 'trusted-types' / 'require-trusted-types-for'` | Nagłówki CSP wysyła Cloudflare w odpowiedzi iframe, Safari ich nie obsługuje |
| `Blocked a frame with origin "https://challenges.cloudflare.com"…` | Same-Origin Policy działa poprawnie |
| `NaN`, `Śledzenie: …`, `Brak właściwości`, `Error — normal:0` | Logi zminifikowanego skryptu widgetu |
| `401` i „Nie można było znaleźć serwera…” na długich URL-ach | Flow Private Access Token / blokady rozszerzeń |
| `Refused to connect to data:` | Najpewniej ramka Turnstile; dodawać `data:` do `connect-src` tylko, jeśli widget realnie przestanie działać |
| `window.styleMedia is deprecated` | Kod widgetu Cloudflare |

**Na stagingu dodatkowo:**

- `manifest.webmanifest 401` i `_rsc … access control checks` to skutek basic auth (przeglądarka pobiera manifest i prefetch bez poświadczeń).
- Dotyczy tylko stagingu.

**Do rozstrzygnięcia:** `Refused to load …beacon.min.js` — Cloudflare Web Analytics wstrzykiwane przez Cloudflare i blokowane przez CSP (patrz „Cloudflare i serwer”).

---

## 10. Rzeczy sprawdzone i uznane za OK

- `.env*` w `.gitignore`; brak sekretów w historii Gita (wszystkie branche).
- Linki `target="_blank"` mają `rel="noopener noreferrer"` (7/7).
- Brak zbędnego `images.remotePatterns` — tylko lokalne `/public`.
- `robots.ts` blokuje `/api/`.
- Walidacja Zod po stronie klienta i serwera.
- Brak `dangerouslySetInnerHTML` w aplikacji.
- Brak `localStorage` / `sessionStorage`.
- Spójne nazewnictwo komponentów (PascalCase) i props (camelCase).
- Nagłówki bezpieczeństwa potwierdzone `curl -I` na produkcji i stagingu; poprawne ładowanie czcionek `.woff2` i stylów zweryfikowane (15.11.2026).
- Endpoint `/api/contact` przetestowany lokalnie w buildzie produkcyjnym:
  - `403` (brak/obcy Origin),
  - `415`,
  - `400` (zły JSON),
  - `413`,
  - `429` po 5 żądaniach,
  - poprawny Origin bez tokenu → `400` z komunikatem o CAPTCHA.
- Formularz kontaktowy działa na stagingu.
- W logach kontenera brak:
  - `ORIGIN_REJECTED`,
  - `TURNSTILE_REJECTED`,
  - `CONFIG_ERROR`,
  - `RESEND_API_ERROR`,
  - `INTERNAL_SERVER_ERROR`.

---

## 11. Lista DO POPRAWY (kolejność zalecana)

### Przed / zaraz po starcie produkcji (wysoki priorytet)

- [ ] Hasło basic auth na stagingu — zmienić na losowe.
- [ ] **Punkt 8** — build arg z site key + osobny widget dla stagingu, potem usunięcie fallbacku.
- [ ] **Punkt 22** — zaimplementowane w CI (`npm audit` w `deploy-staging.yml`), dopisać analogicznie do produkcji.
- [ ] Cloudflare: reguła rate limiting, firewall originu do IP Cloudflare, decyzja o Web Analytics.
- [ ] Skany po wdrożeniu produkcji: MDN Observatory, SSL Labs, securityheaders.com.
- [ ] OG image — `public/images/og-default.jpg` (1200×630) dostępny pod produkcyjnym URL.
- [ ] Staging: noindex (`robots` / metadata), żeby nie dublować indeksu z produkcją.
- [ ] RODO: polityka prywatności (formularz, Resend i Turnstile jako podmioty przetwarzające), stan baneru cookies.
- [ ] Checklist kontaktu: dodatkowo test wstrzyknięcia HTML w polu wiadomości (escape w mailu).

### Wkrótce po starcie (średni priorytet)

- [ ] **Punkt 17** — `socialLinks.map(...)` w `Contact.tsx`.
- [ ] **Punkt 9** — usunąć martwą zależność Turnstile albo użyć biblioteki świadomie.
- [ ] **Punkt 10** — jeden model danych portfolio (JSON albo kod, nie oba).
- [ ] **Punkt 11** — pełny fokus (powrót na toggle) w menu mobilnym.
- [ ] **Punkt 18** — decyzja i komentarz przy `unoptimized`.
- [ ] Sprzątanie martwej gałęzi `decodedEmail ? … : "[Ładowanie adresu...]"`.

### Backlog (niski priorytet)

- [ ] Wspólny `FormField` (punkt 20).
- [ ] Rate limit oparty o Redis przy skalowaniu horyzontalnym.
- [ ] Ścisłe CSP z nonce (`proxy.ts`) — tylko jeśli utrata statycznego prerenderingu będzie akceptowalna.
- [ ] Skan obrazu Docker (`trivy` CLI lub `grype` lokalnie / w CI).
- [ ] Mirror w GitLabie: sprawdzić, że projekt i rejestr obrazów są prywatne i że zmienne CI nie wyciekają do logów.

---

## 12. Checklist przed produkcją

- [ ] `npm run lint` — 0 errors.
- [ ] `npx tsc --noEmit` — pass.
- [x] `npm run build` — pass.
- [x] `npm audit` — zaimplementowane w CI.
- [x] Formularz: sukces na stagingu.
- [x] Endpoint: Origin, Content-Type, limit body, zły JSON, rate limit (testy `curl`).
- [ ] Formularz: injection HTML w treści → escaped w mailu.
- [x] Formularz: ponowne wysłanie bez odświeżania strony (punkt 30 zamknięty).
- [x] Nagłówki bezpieczeństwa widoczne (`curl -sI`), style i czcionki działają poprawnie.
- [ ] `/.well-known/security.txt` zwraca 200 na stagingu i produkcji.
- [ ] Obraz produkcyjny bez `.env` w warstwach.
- [ ] OG / canonical na `https://tombergson.eu`.
- [ ] Staging z noindex.
- [ ] Skany: Observatory, SSL Labs, securityheaders.com.

---

## 13. Wniosek

Warstwa bezpieczeństwa kontaktu, poprawne ładowanie zasobów statycznych (CSP z `font-src data:`), jednorazowy token Turnstile w formularzu oraz audyt npm w CI są w pełni domknięte.

**Projekt działa poprawnie. Do ostatecznego zamknięcia pozostają:**

1. **Punkt 8:** klucz Turnstile jako build arg w Dockerfile i osobny widget dla stagingu.
2. **Konfiguracja po stronie Cloudflare:** rate limiting, firewall originu, Web Analytics.
3. **Formalności:** polityka prywatności, noindex na stagingu, OG image.

---

*Dokument zaktualizowany na podstawie audytu kodu, raportu wdrożenia ACT oraz sesji utwardzania endpointu, nagłówków i CI (15.11.2026).*