# Liturgi – gudstjenesteplanlegger

SvelteKit-app for å planlegge gudstjenester fra maler. Finnes i to varianter: **Mac-app (Electron)** der gudstjenester og lokale maler lagres som filer, og **nettleser-versjon** der data lagres i localStorage.

## Mac-app

Bygges og pakkes lokalt:

    npm install
    npm run app:mac      # bygg + DMG i dist/

Eller installeres via Homebrew:

    brew install arnstadfredrik/tap/liturgi

Data lagres utenfor appen og overlever oppdateringer:

- Gudstjenester: `.liturgi`-filer (JSON) der du velger – standard `~/Documents/Liturgi/`
- Lokale maler: `~/.config/Liturgi/maler/`
- Innstillinger og liste over siste gudstjenester: `~/.config/Liturgi/liturgi.db` (SQLite)

## Nettleser-versjon

    npm install
    npm run dev          # utviklingsserver
    npm run build        # statisk produksjonsbygg i build/
    npm run preview      # forhåndsvis produksjonsbygget

## Dev-modus og Malverktøy

`npm run build` og `npm run app:mac` lager **vanlige bygg**. Det finnes også en egen dev-utgave som inneholder utviklerverktøy som aldri kommer med i publiserte utgaver:

    npm run electron:dev   # bygger dev-utgave og starter Electron lokalt
    npm run build:dev      # bygger dev-utgave i build/ (starter ikke appen)

Hvordan dev-utgaven holdes utenfor publiseringen:

1. **Byggflagget**: `__DEV_MODE__` (settes kun av `VITE_DEV_MODE=1` i `npm run build:dev`/`electron:dev`) – uten flagget tree-shaker Vite selve verktøykoden ut av bundle'en.
2. **Upakket-sjekk**: hovedprosessen svarer `devModus: !app.isPackaged` på `dev:tilstand`-IPC-en – en app fra en DMG-installasjon får aldri verktøyene, selv om byggget ville inneholdt dem.
3. **CI-verifisering**: release-workflowen (`.github/workflows/release-mac.yml`) bygger kun på `v*`-tags og feiler hvis dev-modulen finnes i byggget. Dev-utgaven kan derfor ikke publiseres ved et uhell – den bygges alltid lokalt.

### Malverktøy

En dev-modul for å redigere **originalmalene** – de innebygde ordningene som følger med programmet. Åpnes fra «Malverktøy»-knappen i sidefeltet (vises bare i dev-utgaven).

**Dette er annerledes enn vanlig malredigering**, som du kjenner fra «Maler»-siden:

| | Vanlig malredigering (Maler-siden) | Malverktøy (dev) |
|---|---|---|
| Hva redigeres | Lokale maler (`.limal`-filer i `~/.config/Liturgi/maler/`) | Originalene i `src/lib/data.js` – kildekoden som følger appen |
| Hvor endringen lander | I mal-filen på disk | I **prosjektet**: `src/lib/data.js` + seed-filen under `~/.config/Liturgi/maler/` |
| Blir med i bygg? | Nei – malene er brukerdata | **Ja** – endringene følger kildekoden og neste build/release |
| Originalen endres? | Aldri – originalene er låste; endringer lager en kopi i brukermaler | Ja – det er selve poenget; dette er verktøyet for å vedlikeholde originalene |

I praksis: du åpner en originalmal fra Malverktøy-lister, redigerer den med hele den vanlige editoren (riktekst, rolle-markering, alternativer, bibliotek – samme UI som ellers), og velger «Lagre til prosjektet» i høyremenyen (eller ⌘S). Endringene skrives tilbake til `data.js` (med automatisk validering og tilbakerulling ved feil) og til seed-filen, slik at de blir med i byggeprosessen.

Andre dev-konsekvenser: åpne maler dukker opp under «Åpne maler» i sidefeltet, og maler åpnet fra Malverktøy er merket med **dev**. Publiserte utgaver inneholder ingen av delene.

## Funksjoner

- **Maler**: «Ordning for hovedgudstjeneste (bokmål, 2020)» og «Gudstjenestemal Bakke og Gylland 2025» er innebygd. Lag nye lokale maler («+ Ny lokal mal») eller lagre en gudstjeneste som grunnordning med «Lagre som mal».
- **Gudstjenester**: opprett fra valgt mal med navn og dato; lagres som filer, åpnes fra listen over de siste fem.
- **Kirkeårsdag**: velges automatisk fra datoen, eller manuelt («☀️ … · ✏️ endre») fra alle kirkeårsdager – både i redigeringsvisning og i «Ny gudstjeneste». Endres datoen, spør appen om innholdet (dagens bønn + bibeltekster) skal oppdateres.
- **Dagens bønn**: kirkeårsbønnen hentes inn i leddet «Dagens bønn» – som plassholderfylling, nytt alternativ eller eget ledd, avhengig av malen.
- **Bibeltekster**: «Første lesning», «Andre lesning» og «Evangelium» fylles med referanse og tekst fra bibel.no, innledes/avsluttes som i ordningen («Det står skrevet i/hos …» / «Slik lyder Herrens ord.») og får referansen som fotnote. Ingress-ledd røres ikke.
- **Bibliotek**: hent enkeltalternativer («Hent innhold …») eller hele ledd («Hent ledd …») fra hovedgudstjenesten – innholdet kopieres inn i filen, så den forblir delbar.
- **Ledd**: flytt med drag-and-drop (drag i leddhodet) eller høyreklikk-meny (flytt, legg til over/under, fjern, slett). Tekst, instruksjoner og overskrifter redigeres ved klikk.
- **Alternativer**: ledd med flere alternativer; velg med «Bytt alternativ», rediger fritt.
- **Salmer**: salmeledd har felt for nummer og tittel, og salmetekst kan legges inn.
- **Eksport**: PDF (utskriftsvisning), Word (.docx) og PowerPoint (.pptx) – røde roller og liturgidesign i alle formater; fotnoter renders i alle tre.
- **Filer**: «Lagre som …», «Åpne fil …» og dobbeltklikk på `.liturgi`-filer i Finder.

## Tekstformat (markdown-syntaksen)

Tekstene i ledd, maler og bibeltekster er **riktekst med liturgisk markering** — skrevet i en lett markdown-syntaks som rendres likt i redigeringsvisningen og i eksporten (Word/PDF/PowerPoint). Redigeringsfeltet viser den ferdige teksten (rediger ved klikk), og «Vis kildekode»-knappen viser den rå syntaksen.

### Roller

Rollemarkører («L», «ML», «M», «A», «KA», «K» eller kombinasjoner som «L/ML») vises **rødt** og kan skrives på to måter:

- **Inline pakket**: `{{r}}L |{{/r}} tekst` — rollemerket er rødt, teksten fortsetter vanlig. Dette er formatet malene bruker.
- **Hele linjen**: `L | tekst`, `ML | tekst` eller `@r | tekst` — rollemerket rødt, resten av linjen vanlig tekst.

Rollenavnet kan redigeres fritt (f.eks. «Klokker/dåpsfølge |») — det som teller er teksten før `|` på linjen, eller innholdet i `{{r}}…{{/r}}`.

### Linjemarkører

- `BIBELREF | Rom 8,31b-35` — bibelreferanse som liten tekstnotis; brukes av eksporten til «Bibelreferanse»-bytting i menighetsprogrammet.
- `FOTNOTE | …` — generell liten notis (samme styling som BIBELREF, men uten referanse-oppslag).
- `@NOTAT …` (eller `@n …`) — scenenotat: rød kursiv, litt mindre; havner ikke med i menighetseksporten på samme måte som brødtekst.
- `# Overskrift` / `## Underoverskrift` — henholdsvis nivå 1 og 2.
- `- punkt` — punktliste (rendres med reell kul).

### Inline-markdown

- `**fet**` — fet
- `*urskrift*` — kursiv
- `^{1}` — hevet versnummer (brukes i bibeltekstene: «^{14} Han sier: …»)

### Linjeskift

Nye linjer rendres som linjeskift. Tomme linjer gir avsnitt. Linjer som starter med en markør (rolle, BIBELREF, FOTNOTE, @) får alltid eget avsnitt — markøren gjelder kun for sin egen linje.

### Eksempel

    {{r}}ML |{{/r}} Det står skrevet i evangeliet etter Matteus:

    **23** Da sa Jesus til disiplene sine:
    ^{31} Menneskesønnen skal komme i sin herlighet …

    {{r}}L |{{/r}} Slik lyder det hellige evangelium.

    BIBELREF | Matt 25,31-46

## Struktur

    electron/main.cjs          – Electron-hovedprosess (statisk server, fil-IPC, sqlite)
    electron/preload.cjs       – bridge til rendereren (window.liturgi)
    electron/db.cjs            – SQLite (~/.config/Liturgi/liturgi.db)
    src/lib/data.js            – de to innebygde malene (generert fra docx-filene)
    src/lib/malverktoy.svelte.js – DEV: felles logikk for Malverktøy (åpne/lagre originalmaler)
    src/lib/store.svelte.js    – tilstand (Svelte 5 runes)
    src/lib/fileio.svelte.js   – lagre/åpne filer, siste-gudstjenester-liste, maler på disk
    src/lib/export.js          – Word/PowerPoint/PDF-eksport (docx, pptxgenjs)
    src/lib/kirkeaar.js        – kirkeårsdata + bibeltekster fra bibel.no
    src/lib/Sidebar.svelte     – sidefelt med siste gudstjenester og maler
    src/lib/Editor.svelte      – redigering av gudstjeneste/mal
    src/lib/Item.svelte        – ett liturgiledd (tekst, alternativer, salme)

## Merk

- `app/`-mappen i prosjektroten er den gamle vanilla-JS-versjonen (referanse; kan slettes).
- Eksportbibliotekene (`docx`, `pptxgenjs`) er npm-pakker og bundles av Vite – fungerer offline.
- PDF-eksporten bruker nettleserens utskriftsdialog og kan ikke automatiseres i test.
- Kirkeårstekster fra bibel.no krever server-proxy; i Mac-appen gjør hovedprosessen dette, i nettleser gjør vite-proxyen det (dev/preview).
