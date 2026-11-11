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

## Struktur

    electron/main.cjs          – Electron-hovedprosess (statisk server, fil-IPC, sqlite)
    electron/preload.cjs       – bridge til rendereren (window.liturgi)
    electron/db.cjs            – SQLite (~/.config/Liturgi/liturgi.db)
    src/lib/data.js            – de to innebygde malene (generert fra docx-filene)
    src/lib/store.svelte.js    – tilstand (Svelte 5 runes)
    src/lib/fileio.svelte.js   – lagre/åpne filer, siste-gudstjenester-liste, maler på disk
    src/lib/export.js          – Word/PowerPoint/PDF-eksport (docx, pptxgenjs)
    src/lib/kirkeaar.js        – kirkeårsdata + bibeltekster fra bibel.no
    src/lib/Sidebar.svelte     – sidefelt med siste gudstjenester og maler
    src/lib/Editor.svelte      – redigering av gudstjeneste/mal
    src/lib/Item.svelte        – ett liturgiledd (tekst, alternativer, salme)

## Utevilging (release)

1. Lag en fine-grained PAT med skriverettighet til `ArnstadFredrik/homebrew-tap` og legg den som repo-secret `HOMEBREW_TAP_TOKEN`.
2. Push en tag:

        git tag v1.0.1 && git push origin v1.0.1

3. GitHub Actions (`.github/workflows/release-mac.yml`) bygger DMG-en, publiserer release og oppdaterer `Casks/liturgi.rb` i homebrew-tap automatisk.

## Merk

- `app/`-mappen i prosjektroten er den gamle vanilla-JS-versjonen (referanse; kan slettes).
- Eksportbibliotekene (`docx`, `pptxgenjs`) er npm-pakker og bundles av Vite – fungerer offline.
- PDF-eksporten bruker nettleserens utskriftsdialog og kan ikke automatiseres i test.
- Kirkeårstekster fra bibel.no krever server-proxy; i Mac-appen gjør hovedprosessen dette, i nettleser gjør vite-proxyen det (dev/preview).
