# AGENTS.md — liturgi-app

Retningslinjer for KI-agenter som jobber i dette repoet. Les dette før du endrer noe.

## Prosjektet

«Liturgi» — gudstjenesteplanlegger som Electron-app (macOS/Windows/Linux + web):
SvelteKit 5-renderer (Svelte 5 runes, adapter-static, `ssr: false`) i `src/`,
Electron-main-prosess i `electron/`, SQLite (`better-sqlite3`) via `electron/db.cjs`.
Gudstjenester lagres som `.liturgi`, maler som `.limal`; filene er kilden.
UI-språk er norsk (bokmål). Versjon i `package.json`; release via tag → DMG/CI.

## Bygg og verifisering

- `npm test` — enhetstester (Vitest, `tests/enhet/`). Kjør etter endringer i
  data-koden (`data.js`/`lit.js`/`db.cjs`/malformat). Ny funksjon → ny
  enhetstest i samme commit (regresjonstest ved kostbare feil).
- `npm run test:royk` — 13 røyktester som bygger og klikker gjennom alle maler
  i Electron med test-db (CDP, port 9877). Kjør før «ferdig».
- `npx svelte-check` — skal stå på 0 feil (warnings er ok).
- `npm run build` — prod-bygg (adapter-static); `npm run build:dev` til lokal
  Electron-test. Bygg + installer i /Applications etter hver ferdige endring
  (`npm run app:mac`; hdiutil attach/ditto/detach; `osascript quit` først hvis
  appen er åpen).
- Byggnr-mønster `YYYYMMDD.HHMM` i `electron/byggnr.txt`; commit-tekst «Byggnr».
  Byggnr kun i manuelle bygg — release/bygg fra CI får bare versjonsnummer.
- Utviklingstest-flyt: dev-instans mot **test-db**:
  `LITURGI_DB_DIR=~/.hermes/cache/liturgi-test-db npm run electron:dev -- --remote-debugging-port=9310`
  (logg til /tmp). Test-instanser skal åpne en **KOPI** av `.liturgi`-filen i
  /tmp — aldri originalen.

## Harde regler

- **DB**: Brukerens db berøres aldri av testing. Test-db ryddes kun i
  `~/.hermes/cache/liturgi-test-db`. Nullstill aldri nøkler i brukerens db —
  spesielt `prekenforberedelseMappe`.
- **Sletting på maskinen**: aldri `rm` — flytt til `~/.Trash/` (Electron:
  `shell.trashItem`).
- **Dato-endring** må aldri oppdatere kirkeårsinnhold automatisk — spør alltid
  brukeren først.
- **Credentials**: aldri skriv ut tokens/passord; verdier holdes `[REDACTED]`
  (salme.no-innlogging ligger i db-nøkkel `salmeLogin`).
- **Force-push** bare `--force-with-lease` og bare etter eksplisitt godkjenning.
- **Commit-meldinger** skrives til `/tmp/msgN.txt` + `GIT_EDITOR='cp /tmp/msgN.txt'`
  (beskytter norske tegn mot skrivefelle i herdede skall); sjekk at loggen ikke
  inneholder `\u00`-rester. `git add` med eksplisitte filnavn.
- **Branches**: `main` (kjernen), `ui-sdk` (ui-sdk-oppsettet),
  `malverkoy-dev` (malverktøy dev-flagg `VITE_DEV_MODE`),
  `design/ui-overhaul` (design-eksperiment).

## Arkitektur

- `src/lib/*.svelte` — modulene (Editor, Eksport, Oversikt, Salmer,
  Innstillinger, Kirkeaar, Forberedelse …); sidefelt/TOC i
  `src/routes/+page.svelte`.
- **Gjenbrukbare komponenter**: nr to eller flere moduler trenger samme
  UI-del, trekk den ut i en komponent i `src/lib/` (fx `ModulTopp.svelte`
  for module-headere, `Modulfaner.svelte` for faner, `Modal.svelte` for
  dialoger). Ikke dupliser markup/stil mellom moduler — send det som
  varierer inn som props/snippets, og behold modulspesifikke detaljer
  i modulens eget scope (`#modulnavn …`) i `app.css`.
- `src/lib/data.js` — BUILTIN_TEMPLATES (malene); «Dåp i hovedgudstjenesten» er
  KILDEN for dåpsdelen i hovedgudstjenesten (HG-seksjonen er tom + merket
  `__lenket: true` og bygges ved oppstart fra malen — låst av
  `tests/enhet/data.test.mjs`).
- `src/lib/export.js` — eksportmotoren: `byggSlidePlan` (slideplan, konsumeres
  av både PPTX-eksporten og forhåndsvisningen), `buildPdfBase64`/`byggPdfSider`
  (manus-PDF), `exportWord`/`buildOutline`, `delPptSegs`/`finnDelPunkt`
  (slidetekst-delepunkter), `lysbildeTallFor` (margtall), `roleSegments`,
  `flytAvsnitt`. Visning og eksport deler motor — forhåndsvisningen er førende
  for eksporten.
- `src/lib/lit.js` — felles formatfunksjoner (`leddTekst`, `salmeTekst`);
  `src/lib/bibelboeker.js` — bibelforkortelser → fullt navn.
- `src/lib/md-til-docx.js` — docx-tabeller (frontmatter-tabell, salmetabell).
- Eksportinnstillinger per profil ligger i dokumentet (`eksportInnst[profil]`),
  leddvalg per ledd-**ID** (ikke indeks), og tomme linjer i tekst = avsnittsgrense
  (avsnittsavstand, følger «avstand»-valget tett/normal/luftig). Margtall i
  lysbildemanuset tegnes som linjekø — detaljer i
  `references/eksport-arkitektur.md` i den installerte `liturgi-app`-skillen.
- Prekenforberedelse: ekte EJS (npm-pakken `ejs`) + PrismJS-syntaksutheving
  (`src/lib/highlight.js`); maler i db-nøkkel `forbMaler`, filer i `forbFiler`,
  rekke-mapper via `forbRekkeForDag` (`src/lib/kirkeaar.js`).
- Konvertering: `docs/limal-format.md` + `electron/konverter.cjs`
  (docx/pdf → .limal).

## UI, ikoner og styling

- Farger/fonts: rød `#c0392b`, Georgia, creme `#f6f1e7`; temafeller:
  `var(--card)` er **udefinert** — bruk `var(--panel2)`; `var(--foreground)`
  finnes ikke — bruk `var(--text)`. `clamp()`-bredder.
- Ikoner **kun** via `{@html mdi('navn', størrelse)}` (`src/lib/mdi.js`,
  MDI inline path-data) — aldri webfont eller emoji. Ukjente ikonnavn feiler i
  `tests/enhet/mdi-ikoner.test.mjs`.
- `src/app.css` er global stil og importeres ved app-inngang
  (`src/routes/+layout.svelte`); ui-sdk-stilene
  (`@ui-sdk/core/web.css`) importeres rett etter.

## CI og release

- Tag `v*` → `release.yml` (matrix mac/win/linux) + `publiser`-jobb som setter
  electron-builder-utkastene ut av draft (`gh release edit --draft=false
  --latest`). Linux-pakking krever `author` i package.json. Node 22.
- Web: `GH_PAGES=1`-bygg + `404.html`-kopi → GitHub Pages.
- Homebrew-tap oppdateres av release.

## Dokumentasjon

- `docs/` — `limal-format.md`, `malsprak.md` (EJS), `bk.html`, og
  brukerhåndbokkilden (`npm run handbok` genererer
  `src/lib/generated/handbok-html.js`).
- Håndbokskjermbilder: bygg uten dev-mod, riktige moduler/sider.
- Dybdereferanser: `references/eksport-arkitektur.md`, `references/tester.md`
  og `references/undermoduler-og-drag.md` i den installerte
  `liturgi-app`-skillen.

## ui-sdk (branch `ui-sdk`)

Før du bruker ui-sdk: følg ui-sdk-skillen hvis den er installert, og les
`node_modules/@ui-sdk/svelte/docs/llms.txt`. For å bygge en ny komponent:
søk også `node_modules/@ui-sdk/svelte/docs/core.md` etter overskrift, og les
`rendering.md` som ligger ved siden av.
