# Raport z audytu bezpieczeństwa i spójności kodu — tombergson.eu

**Data aktualizacji:** 15.11.2026

**Zakres audytu:** struktura projektu, `next.config.ts`, `Dockerfile`, CI (`.github/workflows`), API `/app/api/contact`, walidacja Zod, komponenty, TypeScript/ESLint, gałęzie Git, `.env.local`, `package.json`.

---

## Weryfikacja

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
| **WAŻNE** | 14 | ✅ 14 w pełni, 🔶 0 częściowo, ⚠️ 0 otwartych |
| **DO ROZWAŻENIA** | 6 | ✅ 5 w pełni (19, 21, 22, 23, 24), 📋 1 w backlogu (20) |
| **NOWE (sesja 15.11.2026)** | 7 | ✅ wdrożone (25–31) |

### Korekta względem poprzedniej wersji raportu

- **Punkt 5 (`next.config.ts`):** dodano źródło `data:` do dyrektywy `font-src` (`font-src 'self' data:`), co przywróciło poprawne ładowanie czcionek i stylów.
- **Punkt 8 (klucz Turnstile w Dockerfile):** wdrożono build arg z osobnego widgetu stagingowego / produkcyjnego i usunięto niebezpieczny hardkodowany fallback.
- **Punkty 9, 10, 17, 18:** całkowicie zamknięte:
  - usunięto nieużywaną paczkę `@marsidev/react-turnstile` oraz `turnstile.d.ts`,
  - zunifikowano model portfolio do `content/projects.json`,
  - wdrożono tablicę `socialLinks` z `.map()` w `Contact.tsx`,
  - dodano komentarz techniczny do `unoptimized` w modalu.
- **Punkty 11 i 12:** domknięto pełne zarządzanie fokusem i powrót na przycisk `toggle` w menu mobilnym oraz spójny focus ring.
- **Punkt 22 (`npm audit`):** dodano krok audytu zależności zablokowany na poziomie `high` w pliku workflow CI (`deploy-staging.yml`).
- **Punkt 30 (`Contact.tsx`):** wdrożono jednorazowy reset tokenu Turnstile (`widgetIdRef`, `resetTurnstile()` w bloku `finally`), obsługę `error-callback` oraz inicjalizację z `onReady`.

---

## 2. KRYTYCZNE — status

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

## 3. WAŻNE — status

### 5. Nagłówki bezpieczeństwa

**Status:** ✅ NAPRAWIONE I ZWERYFIKOWANE

**Weryfikacja:** `curl -I` na produkcji i stagingu, testy przeglądarkowe (15.11.2026).

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
- Podszycie się pod nagłówek jest możliwe tylko przy dostępie do originu z pominięciem Cloudflare — patrz sekcja „Cloudflare i serwer”.
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

- **Było:** w `components/Contact.tsx` stosowano niebezpieczny fallback z kluczem testowym/produkcyjnym w kodzie źródłowym.
- **Jest:** klucz jest wstrzykiwany w czasie buildu jako zmienna środowiskowa (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`), a kod korzysta z jawnego rozróżnienia na tryb development oraz produkcję bez wbudowanych tajnych kluczy produkcyjnych.

### 9. Nieużywana zależność `@marsidev/react-turnstile` + literówka w `turnstile.d.ts`

**Status:** ✅ NAPRAWIONE I ZAMKNIĘTE

- **Było:** projekt zawierał nieużywaną zewnętrzną paczkę `@marsidev/react-turnstile` oraz zbędny plik typów `turnstile.d.ts`.
- **Jest:** odinstalowano zbędną paczkę (`npm uninstall @marsidev/react-turnstile`) oraz usunięto zbędny plik typów. Kod korzysta w pełni z natywnej integracji opartej na `<Script>` i `window.turnstile`.

### 10. Duplikacja modelu portfolio (`projects.json` vs hardcode w `Portfolio.tsx`)

**Status:** ✅ NAPRAWIONE I ZAMKNIĘTE

- **Było:** dane projektów były zahardkodowane w `Portfolio.tsx` równolegle z plikiem `content/projects.json`.
- **Jest:** rozszerzono strukturę w `content/projects.json` do pełnego formatu projektowego, a `Portfolio.tsx` importuje dane bezpośrednio z tego pliku jako pojedynczego źródła prawdy.

### 11. Escape / focus w menu mobilnym vs modal portfolio

**Status:** ✅ NAPRAWIONE I ZAMKNIĘTE

- **Było:** menu mobilne zamykało się klawiszem Escape, ale brakowało pełnego powrotu fokusu na przycisk toggle.
- **Jest:** dodano referencję `menuButtonRef` oraz automatyczny powrót fokusu na przycisk otwierający menu przy każdym jego zamknięciu.

### 12. Focus ring na przycisku mobile menu

**Status:** ✅ NAPRAWIONE

- `focus-visible:ring-2` (spójnie z resztą UI).

### 13. ARIA: `role="tab"` + `aria-pressed`

**Status:** ✅ NAPRAWIONE

- Usunięte `aria-pressed` przy `role="tab"`.

### 14. ESLint `set-state-in-effect`

**Status:** ✅ NAPRAWIONE

- `AnimatedText.tsx` — naprawione.
- `Contact.tsx` — `decodedEmail` zdefiniowane jako stała statyczna.

### 15–16. `no-explicit-any` / nieużywany `err`

**Status:** ✅ NAPRAWIONE

### 17. Social links — 3× skopiowany markup

**Status:** ✅ NAPRAWIONE I ZAMKNIĘTE

- **Było:** trzykrotnie powtórzony markup tagów `<a>` dla social mediów w `Contact.tsx`.
- **Jest:** wydzielono statyczną tablicę `socialLinks` i wyrenderowano je dynamicznie za pomocą `.map()`.

### 18. `unoptimized` na obrazie w modalu Portfolio

**Status:** ✅ NAPRAWIONE I ZAMKNIĘTE

- **Było:** flaga `unoptimized` w modalu funkcjonowała bez komentarza.
- **Jest:** dodano jasny komentarz techniczny wyjaśniający cel stosowania `unoptimized` do obsługi grafik wektorowych (`.svg`) oraz dużych podglądów modalnych.

---

## 4. DO ROZWAŻENIA — status

| Nr | Temat | Status |
|---:|---|---|
| 19 | README — Getting Started | ✅ Uzupełnione (`npm install`, `npm run build`) |
| 20 | Duplikacja klas błędów pól formularza | 📋 Wydzielić `FormField` / wspólny helper |
| 21 | `aria-controls` → element poza DOM | ✅ `Nav #mobile-menu` zawsze w DOM, widoczność CSS |
| 22 | `npm audit` | ✅ Wdrożone w CI (`.github/workflows/deploy-staging.yml` — krok `npm audit --audit-level=high`) |
| 23 | `NODE_ENV` a testowe klucze Turnstile | ✅ Udokumentowane w sekcji „Konfiguracja i środowiska” |
| 24 | Rok w stopce | ✅ `new Date().getFullYear()` |

---

## 5. NOWE — utwardzenie endpointu i nagłówków (sesja 15.11.2026)

### 25. Kontrola Origin i Content-Type w `/api/contact`

**Status:** ✅ WDROŻONE

- Test: brak/obcy `Origin` → `403`, zły `Content-Type` → `415`.
- Poza development wymagany `Origin` z listy `ALLOWED_ORIGINS`.
- Wymagany `Content-Type: application/json`.

### 26. Limit rozmiaru body i bezpieczny parse JSON

**Status:** ✅ WDROŻONE

- Test: ponad 10 KB → `413`, niepoprawny JSON → `400`.
- Limit 10 000 B (nagłówek `content-length` oraz długość odczytanego tekstu).
- Niepoprawny JSON i body niebędące obiektem → `400` zamiast `500`.

### 27. Weryfikacja Turnstile po stronie serwera

**Status:** ✅ WDROŻONE

- Usunięto bypass środowiskowy.
- W dev używamy testowych kluczy Cloudflare po obu stronach.
- `siteverify` z `remoteip`, timeoutem 8 s i sprawdzeniem hostname względem `ALLOWED_ORIGINS` (poza dev).
- Brak `TURNSTILE_SECRET_KEY` lub `RESEND_API_KEY` → `CONFIG_ERROR` w logach i `500`.
- Odrzucenia logowane jako `TURNSTILE_REJECTED` (z `error-codes`) i `ORIGIN_REJECTED`.

### 28. Statusy odpowiedzi i timeouty

**Status:** ✅ WDROŻONE

- Błąd Resend → `502` (nie status z upstreamu).
- Timeout 10 s dla Resend.
- Odpowiedź sukcesu:

```json
{
  "success": true
}
```

### 29. Schemat Zod (`lib/validations/contact.ts`)

**Status:** ✅ WDROŻONE

- `trim()` oraz górne limity:
  - `name` ≤ 100,
  - `email` ≤ 254,
  - `message` ≤ 5000.
- Blokada znaków sterujących (w tym CR/LF) w `name`.

### 30. Token Turnstile jest jednorazowy

**Status:** ✅ WDROŻONE

W `components/Contact.tsx` dodano:

- `widgetIdRef` do śledzenia ID widżetu.
- Funkcję `resetTurnstile()` resetującą widżet w bloku `finally` po wysyłce.
- `error-callback` przekazujący czytelny komunikat błędu.
- Inicjalizację z `onReady`.

### 31. `/.well-known/security.txt` (RFC 9116)

**Status:** ✅ ZAIMPLEMENTOWANE

- Trasa `app/.well-known/security.txt/route.ts` z `dynamic = "force-dynamic"` i wygasaniem za 360 dni.

---

## 6. Konfiguracja i środowiska

### Zmienne środowiskowe

| Zmienna | Kiedy czytana | Uwagi |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | runtime (kontener) | Wymagana. Brak → `500` + `CONFIG_ERROR`. |
| `RESEND_API_KEY` | runtime (kontener) | Wymagana. Brak → `500` + `CONFIG_ERROR`. |
| `CONTACT_EMAIL_TO` | runtime | Opcjonalna, domyślnie `studio@tombergson.eu`. |
| `ALLOWED_ORIGINS` | runtime | Lista po przecinku, ze schematem, bez ukośnika na końcu. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build | Wstawiana do bundla w `next build` (build arg). |
| `NODE_ENV` | build i runtime | W obrazie musi być `production`. |

---

## 7. Cloudflare i serwer

- [ ] SSL/TLS: Always Use HTTPS, Minimum TLS 1.2.
- [ ] HSTS w jednym miejscu (aplikacja albo Cloudflare).
- [ ] Reguła WAF Rate limiting: `POST /api/contact`.
- [ ] Firewall originu: porty 80/443 tylko z zakresów IP Cloudflare.

---

## 8. Diagnostyka formularza (runbook)

### Test endpointu z poziomu serwera

```bash
curl -s -i -X POST https://DOMENA/api/contact \
  -H "Origin: https://DOMENA" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jan","email":"jan@example.com","message":"Test wiadomości 123","turnstileToken":"x"}'
```

---

## 9. Znane, nieszkodliwe komunikaty w konsoli

Pochodzą głównie z iframe Cloudflare Turnstile (np. `Unrecognized Content-Security-Policy directive`) oraz mechanizmów przeglądarkowych i nie wpływają na działanie aplikacji.

---

## 10. Rzeczy sprawdzone i uznane za OK

- `.env*` w `.gitignore`; brak sekretów w historii Gita.
- Linki `target="_blank"` mają `rel="noopener noreferrer"`.
- Walidacja Zod po stronie klienta i serwera.
- Nagłówki bezpieczeństwa potwierdzone `curl -I`.
- Endpoint przetestowany pod kątem kodów błędów: `403`, `415`, `400`, `413`, `429`.

---

## 11. Lista DO POPRAWY — kolejność zalecana

### Przed / zaraz po starcie produkcji (wysoki priorytet)

- [ ] Hasło basic auth na stagingu — zmienić na losowe.
- [ ] Cloudflare:
  - [ ] Reguła rate limiting.
  - [ ] Firewall originu ograniczony do IP Cloudflare.
  - [ ] Decyzja dotycząca Web Analytics.
- [ ] Skany po wdrożeniu produkcji:
  - [ ] MDN Observatory.
  - [ ] SSL Labs.
  - [ ] securityheaders.com.
- [ ] OG image — `public/images/og-default.jpg` (1200 × 630).
- [ ] Staging: `noindex`.
- [ ] RODO: polityka prywatności i baner cookies.

### Backlog (niski priorytet)

- [ ] Wspólny `FormField`.
- [ ] Rate limit oparty o Redis przy skalowaniu horyzontalnym.
- [ ] Ścisłe CSP z nonce (`proxy.ts`).

---

## 12. Checklist przed produkcją

- [x] `npm run lint` — 0 errors.
- [x] `npx tsc --noEmit` — pass.
- [x] `npm run build` — pass.
- [x] `npm audit` — zaimplementowane w CI.
- [x] Formularz: sukces na stagingu.
- [x] Endpoint: Origin, Content-Type, limit body, zły JSON, rate limit.
- [x] Nagłówki bezpieczeństwa widoczne (`curl -sI`).
- [x] `/.well-known/security.txt` zwraca `200`.

---

## 13. Wniosek

Warstwa bezpieczeństwa kontaktu, poprawne ładowanie zasobów statycznych, jednorazowy token Turnstile w formularzu oraz audyt npm w CI są w pełni domknięte.

**Projekt jest gotowy do finalnych wdrożeń infrastrukturalnych.**

---

*Dokument zaktualizowany na podstawie audytu kodu, raportu wdrożenia ACT oraz sesji utwardzania endpointu, nagłówków i CI (15.11.2026).*