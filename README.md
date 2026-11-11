# Liturgi – gudstjenesteplanlegger

SvelteKit-app for å planlegge gudstjenester fra maler. Kjøres lokalt, data lagres i nettleseren (localStorage).

## Start

    npm install
    npm run dev          # utviklingsserver (http://localhost:5173)
    npm run build        # statisk produksjonsbygg i build/
    npm run preview      # forhåndsvis produksjonsbygget

## Funksjoner

- **Maler**: «Ordning for hovedgudstjeneste (bokmål, 2020)» og «Gudstjenestemal Bakke og Gylland 2025» er innebygd. Lag nye lokale maler («+ Ny lokal mal») eller lagre en gudstjeneste som grunnordning med «Lagre som mal».
- **Gudstjenester**: opprett fra valgt mal med navn og dato, lagres lokalt, hentes frem og redigeres videre.
- **Ledd**: slå valgfrie ledd av/på (✕/↺), flytt opp/ned, slett, legg til ledd og hovedavsnitt. Tekst, instruksjoner og overskrifter redigeres ved klikk (lagres ved «💾 Lagre»).
- **Alternativer**: ledd med flere alternativer velges med radioknapper; nye alternativer kan legges til («+ Alternativ til siste ledd») og tekstene redigeres.
- **Salmer**: salmeledd har felt for nummer og tittel.
- **Eksport**: PDF (utskriftsvisning → «Lagre som PDF»), Word (.docx) og PowerPoint (.pptx) – ett lysbilde per ledd, lange tekster deles automatisk.

## Struktur

    src/lib/data.js          – de to innebygde malene (generert fra docx-filene)
    src/lib/store.svelte.js  – tilstand og lagring (Svelte 5 runes + localStorage)
    src/lib/modal.svelte.js  – modal-kø (prompt/confirm/ny gudstjeneste)
    src/lib/export.js        – Word/PowerPoint/PDF-eksport (docx, pptxgenjs)
    src/lib/Sidebar.svelte   – liste av gudstjenester og maler
    src/lib/Editor.svelte    – redigering av gudstjeneste/mal
    src/lib/Item.svelte      – ett liturgiledd (tekst, alternativer, salme)
    src/lib/Modal.svelte     – modalvindu
    src/app.css              – stil (inkl. utskrifts-/PDF-stil)

Datakey i localStorage: `liturgi-store-v1`. Innebygde maler seedes ved oppstart hvis de mangler – brukerdata overskrives aldri.

## Merk

- `app/`-mappen i prosjektroten er den gamle vanilla-JS-versjonen (referanse; kan slettes).
- Eksportbibliotekene (`docx`, `pptxgenjs`) er npm-pakker og bundles av Vite – fungerer offline.
- PDF-eksporten bruker nettleserens utskriftsdialog og kan ikke automatiseres i test.
