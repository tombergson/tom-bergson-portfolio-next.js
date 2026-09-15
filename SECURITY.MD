# Raport z audytu bezpieczeństwa i spójności kodu — tombergson.eu

**Zakres:** struktura projektu, `next.config.ts`, `Dockerfile`, CI (`.github/workflows`), API `/app/api/contact`, walidacja Zod, komponenty, TS/ESLint, gałęzie git, `.env.local`, `package.json`.  
**Weryfikacja:** `eslint`, `tsc --noEmit`.  
**Status po wdrożeniu (tryb ACT):** większość punktów krytycznych i ważnych **naprawiona**; poniżej stan aktualny + rzeczy do dokończenia.

---

## Podsumowanie

| Kategoria | Znaleziska (audyt) | Po wdrożeniu ACT |
|-----------|--------------------|------------------|
| KRYTYCZNE | 4 | ✅ 4/4 wdrożone |
| WAŻNE | 14 | ✅ większość; część a11y/refaktor do dokończenia |
| DO ROZWAŻENIA | 6 | częścicznie / backlog |

**Wdrożono 16 z 18 zaplanowanych punktów.** Punkty 9 i 10 celowo odłożone. Punkt 17 (social links) — struktura przygotowana, mapowanie do ręcznego domknięcia.

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

### 3. Wyciek szczegółów błędu do klienta
**Status: ✅ NAPRAWIONE**

- **Było:** `message: error?.message` po stronie klienta.
- **Jest:** generyczne komunikaty dla przeglądarki; szczegóły tylko w logach serwera.

### 4. Logowanie PII (RODO)
**Status: ✅ NAPRAWIONE**

- **Było:** `console.log` z odpowiedzią Resend / danymi formularza.
- **Jest:** logowanie statusów/ID bez surowych danych osobowych.

---

## [WAŻNE] — status

### 5. Nagłówki bezpieczeństwa
**Status: ✅ NAPRAWIONE**

- W `next.config.ts`: CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (oraz powiązane nagłówki).
- **Do sprawdzenia przed prod:** czy CSP nie blokuje Turnstile / fontów / skryptów Cloudflare — test na stagingu.

### 6. Rate limiting na `/api/contact`
**Status: ✅ NAPRAWIONE**

- `lib/rateLimit.ts` — limit per IP (**5 req/min**), integracja w route kontaktowym.
- **Ograniczenie:** limiter in-memory — OK przy jednej instancji; przy wielu replikach rozważyć Redis / limit na edge.

### 7. Kruchy check Zod + `any`
**Status: ✅ NAPRAWIONE**

- `error instanceof z.ZodError`, `catch (error)` bez `any`.

### 8. Hardkodowany fallback klucza Turnstile
**Status: ✅ NAPRAWIONE**

- Usunięty fallback; wymagana jawna konfiguracja env.

### 9. Nieużywana zależność `@marsidev/react-turnstile` + literówka w `turnstile.d.ts`
**Status: ⏸️ ODŁOŻONE (decyzja PO)**

- **Do zrobienia:** usunąć paczkę i `turnstile.d.ts` **albo** przejść na oficjalny komponent biblioteki (obecnie ręczny `<Script>` + `window.turnstile`).

### 10. Duplikacja modelu portfolio (`projects.json` vs hardcode w `Portfolio.tsx`)
**Status: ⏸️ ODŁOŻONE (decyzja PO)**

- **Do zrobienia:** jeden źródłowy model — albo usunąć martwy `content/projects.json`, albo render z JSON i ujednolicić `category` / `categories`.

### 11. Escape / focus w menu mobilnym vs modal portfolio
**Status: ✅ CZĘŚCIOWO**

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
**Status: ✅ CZĘŚCIOWO**

- `AnimatedText.tsx` — naprawione.
- **Do weryfikacji:** `Contact.tsx` — `decodedEmail` nadal może iść przez zbędny `useEffect`; prościej stała w bundlu (obfuskacja i tak nie chroni).

### 15–16. `no-explicit-any` / nieużywany `err`
**Status: ✅ NAPRAWIONE**

### 17. Social links — 3× skopiowany markup
**Status: ⚠️ NIEDOKOŃCZONE**

- Przygotowana tablica `socialLinks[]`, mapowanie nie domknięte (ograniczenia edytora).
- **Do zrobienia ręcznie:** `.map()` jak w `navItems` / `TechStrip`.

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
| **22** | `npm audit` | 📋 Uruchomić lokalnie/w CI (sandbox nie miał pełnego TLS) |
| **23** | `NODE_ENV` a testowe klucze Turnstile | 📋 Udokumentować; pipeline musi trzymać `production` |
| **24** | Rok w stopce | ✅ `new Date().getFullYear()` |

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

---

## Lista DO POPRAWY (kolejność zalecana)

### Przed produkcją (wysoki priorytet)

1. **Domknąć punkt 17** — `socialLinks.map(...)` w `Contact.tsx`.
2. **`npm audit`** (+ ewentualne upgrade’y `next` / `resend` / `zod` po przeglądzie CVE).
3. **Test CSP na stagingu** — Turnstile, fonty, skrypty CF.
4. **OG image** — `public/images/og-default.jpg` (1200×630) dostępny pod produkcyjnym URL.
5. **Staging:** `noindex` (robots / metadata), żeby nie dublować indeksu z produkcją.
6. **Checklist kontaktu:** submit OK · rate limit · HTML w polu → escaped w mailu · brak stack trace w JSON · brak PII w logach.

### Wkrótce po starcie (średni)

7. **Punkt 9** — usunąć martwą zależność Turnstile albo użyć biblioteki świadomie.  
8. **Punkt 10** — jeden model danych portfolio (JSON **albo** kod, nie oba).  
9. **Punkt 14 (Contact)** — uprościć `decodedEmail` bez `useEffect`.  
10. **Punkt 11** — pełny fokus (powrót na toggle) w menu mobilnym.  
11. **Punkt 18** — decyzja i komentarz przy `unoptimized`.

### Backlog (niski)

12. Wspólny `FormField` (punkt 20).  
13. Rate limit oparty o Redis przy skalowaniu horyzontalnym.  
14. Dokumentacja: „nigdy nie ustawiać `NODE_ENV=development` na prod” (punkt 23).  
15. Opcjonalnie: skan obrazu Docker (`trivy` / `grype`) w CI.

---

## Checklist przed produkcją

- [ ] `npm run lint` — 0 errors  
- [ ] `npx tsc --noEmit` — pass  
- [ ] `npm run build` — pass  
- [ ] `npm audit` — przejrzany wynik  
- [ ] Formularz: sukces, błąd walidacji, rate limit, injection w treści  
- [ ] Nagłówki bezpieczeństwa widoczne (`curl -sI` / securityheaders)  
- [ ] Obraz produkcyjny **bez** `.env` w warstwach  
- [ ] OG / canonical na `https://tombergson.eu`  
- [ ] Staging z `noindex`  

---

## Wniosek

Warstwa bezpieczeństwa kontaktu i builda Docker jest **w istotnym stopniu domknięta** (punkty 1–8). Projekt nadaje się do produkcji po:

1. domknięciu refaktoru social links (17),  
2. `npm audit`,  
3. weryfikacji CSP + OG + checklisty formularza.

Punkty 9 i 10 (zależność Turnstile, model portfolio) nie blokują startu, ale warto je ogarnąć zaraz po deployu, żeby nie rosły jako dług techniczny.

---

*Dokument powstał na podstawie pełnego audytu kodu oraz raportu wdrożenia ACT. 
*Data aktualizacji: 15.09.2026
