# Liturgi – arkitektur og API

Denne dokumentasjonen beskriver kodebasen: hvordan appen er bygd opp, hva de ulike modulene gjør og hvordan de samarbeider. For brukerrettet dokumentasjon se [brukerhandbok.md](brukerhandbok.md).

---

## Innholdsfortegnelse

1. [Overordnet arkitektur](#overordnet-arkitektur)
2. [Dataformater](#dataformater)
3. [Moduloversikt](#moduloversikt)
4. [Tilstand og lagring](#tilstand-og-lagring)
5. [Eksportarkitekturen](#eksportarkitekturen)
6. [Kirkeåret og bibeltekster](#kirkeåret-og-bibeltekster)
7. [Konvertering og LLM-skill](#konvertering-og-llm-skill)
8. [Bygg, release og distribusjon](#bygg-release-og-distribusjon)
9. [Tester](#tester)

---

## Overordnet arkitektur

```
┌─────────────────────────────────────────────────────┐
│ Electron-hovedprosess (electron/main.cjs)           │
│  · vindu, nativ menylinje, kontekstmeny (Menu.popup)│
│  · fil-IPC (lagre/åpne .liturgi/.limal)             │
│  · SQLite (~/.config/Liturgi/liturgi.db)            │
│  · statisk server + proxy mot bibel.no/salme.no     │
│  · docx/pdf → .limal-konvertering (konverter.cjs)   │
└──────────────────────┬──────────────────────────────┘
                       │ window.liturgi (preload.cjs, contextIsolation)
┌──────────────────────▼──────────────────────────────┐
│ SvelteKit-renderer (src/) – Svelte 5 runes          │
│  · store.svelte.js   – global tilstand              │
│  · fileio.svelte.js  – filer, menyhandling          │
│  · export.js         – eksportmotor (PDF/Word/PPTX) │
│  · routes/+page.svelte – visningsruting             │
└─────────────────────────────────────────────────────┘
```

- **Rendereren** er en SvelteKit-app med `adapter-static` (`ssr = false`): hele UI-et er en statisk SPA som Electron serverer lokalt, og som bygges til GitHub Pages for nettleser-versjonen.
- **Hovedprosessen** eier alt med OS-tilgang: filsystem, SQLite, menyer, dialoger, nettverksproxy og konvertering.
- **Mellom dem**: en smal bridge (`preload.cjs` → `window.liturgi`) med contextIsolation.

### Visningsruting

`src/routes/+page.svelte` ruter på `app.visning`:

| Visning | Modul |
|---|---|
| `hjem` | Hjem-skjerm |
| `editor` | Redigeringsvisning |
| `oversikt` / `salmer` | Oversikt / salmeoversikt |
| `eksport` | Eksportmodulen (`Eksport.svelte`) |
| `maler` / `bibliotek` / `innstillinger` | egne visninger |
| `malverktoy` / `diff` | dev-moduler (`__DEV_MODE__`-beskyttet) |
| `handbok` | Brukerhåndboken (renderer docs/brukerhandbok.md) |

---

## Dataformater

### `.liturgi` – gudstjenestefil

JSON-dokument:

```json
{
  "name": "2026-11-29 - Bakke - Gudstjeneste",
  "date": "2026-11-29",
  "kirkeaar": { "name": "1. søndag i advent", "series": "A" },
  "sections": [
    { "title": "I. Samling", "items": [ { "id": "…", "type": "tekst|salme|lesning",
        "heading": "…", "text": "…", "instr": "…", "enabled": true,
        "alts": [{ "label": "…", "text": "…" }], "selAlt": 0,
        "introAlts": [{ "label": "Innledning", "text": "…" }], "selIntro": 0,
        "avslutningAlts": [{ "label": "Avslutning", "text": "…" }], "selAvsl": 0 } ] }
  ],
  "eksportValg": { "Menighet": { "0:2": false, "0:7:t": false } },
  "eksportInnst": { "Skjerm": { "storrelse": "…" } },
  "eksportPptx": { "lysManus": true }
}
```

Nøkkelkonvensjoner: leddnøkler er `"seksjon:item"` (`"0:2"`); tilleggsnøkler peker på samme ledd med suffix — `:t` (innhold), `:i` (innledning), `:a` (avslutning), `:br` (bibelreferanse-modus). Tekstene bruker liturgisk riktekst (se [limal-format.md](limal-format.md)).

### `.limal` – malfil

Samme struktur som `.liturgi`, pluss mal-metadata. Formatet er dokumentert fullstendig i [docs/limal-format.md](limal-format.md) — kilden til sannheten for malformatet, brukt av konverteringen og LLM-skillen.

---

## Moduloversikt

### electron/

| Fil | Ansvar |
|---|---|
| `main.cjs` | Vindu, mac-menylinje (`byggMeny`), nativ kontekstmeny, fil-IPC, SQLite-tilgang, proxy mot bibel.no/salme.no, feillogg, menytilstand (`app:meny-tilstand` → `meny:handling`) |
| `preload.cjs` | Bridge `window.liturgi` (contextIsolation) |
| `db.cjs` | SQLite: innstillinger (`dbSet/dbGet`), siste gudstjenester, maler-index |
| `konverter.cjs` | docx/pdf → `.limal`: hoveddeler/leddtitteler fra stiler, rolleprefiks, `BIBELREF |`, `@NOTAT`, salmeledd; grupperEllerLedd håndterer Eller/enten-varianter |

### src/lib/ – kjerne

| Fil | Ansvar |
|---|---|
| `store.svelte.js` | Global tilstand (Svelte 5 `$state`): åpne dokumenter, visning, kirkeårsfylling (`applyKirkeaar`, `fyllLesning` via `lit.js`), formatering av bønn, malregistrering |
| `fileio.svelte.js` | Lagre/åpne filer, `saveCurrent`, `kjorMenyId` (menylinje/kommandopalett → handling), siste-gudstjenester, maler på disk |
| `export.js` | Hele eksportmotoren (se [Eksportarkitekturen](#eksportarkitekturen)) |
| `lit.js` | Tekstrendering og -hjelpere: `roleSegments` (rolle/markdown/sup-segmenter), `litHtml`/`litLinjeHtml` (HTML-render), `leddTekst` (komponert ledtekst m/ innledning+avslutning), `salmeTekst`, `fyllLesning` (bibeltekst-struktur), `referanseIInnledning` |
| `deler-logikk.js` | Ren logikk for eksportlistens utvalg (`secAlternativer`, `includeSection`, `filterValgfrie`) – re-eksportert av store |
| `kirkeaar.js` | Kirkeårsdata, oppslag av dag fra dato (`lookupKirkeaar`), bibeltekst-henting fra bibel.no (`hentTekster`), cache (`lesTeksterCache`) |
| `data.js` | Innebygde maler (BUILTIN_TEMPLATES) – generert fra originalene |
| `malverktoy.svelte.js` | Dev: åpne/lagre originalmaler, seed-skriving til `data.js` + seed-fil |
| `contextmenu.svelte.js` | Renderer-eid kontekstmeny (delegerer til nativ meny i Electron) |
| `modal.svelte.js` | Alle dialoger (velgModal, chooseOneModal, bibSokModal, kirkeaarListeModal …) |
| `mdi.js` / `sf.js` | Ikonpath-data offline (MDI / SF Symbols) |
| `bibelboeker.js` | Hjelpeoppslag for bibelbøker (referanse-validering) |

### src/lib/ – visninger

`Sidebar.svelte`, `Editor.svelte` + `Item.svelte` (ett ledd), `Eksport.svelte` (profiler, per-ledd valg, forhåndsvisning, eksport), `Kirkeaar.svelte`, `Bibliotek.svelte`, `Innstillinger.svelte`, `Malverktoy.svelte`, `Kommandopalett.svelte`, `Handbok.svelte` (brukerhåndboken), `Modal.svelte` (ny gudstjeneste m.m.), `EditableText.svelte` (klikk-til-rediger riktekst).

---

## Tilstand og lagring

**App-tilstand** (`store.svelte.js`): `app = { visning, kind ('service'|'template'|null), current, åpneTjenester, services, dirty … }` — alt som `$state`-proxyer, så Svelte 5-runes reagerer på dype endringer.

**Persistens**:

- Mac: `.liturgi`/`.limal`-filer via `window.liturgi.lagre/åpne` (hovedprosess); innstillinger i SQLite via `dbSet/dbGet` med JSON-pakking.
- Nettleser: samme struktur i localStorage (fallback/normalisering ved oppstart).
- `markDirty()` setter dirty-flagg og driver autolagring/avsluttingsbekreftelse («ulagrede endringer»).

**Menyhåndtering**: menylinjen (Electron) og kommandopaletten sender meny-id-er til `kjorMenyId(id)` i `fileio.svelte.js` — ett switch-punkt som mapper id → handling. Kontekstmenyer sender egne id-er til `window.__eksMeny`/lokale handlere.

---

## Eksportarkitekturen

`src/lib/export.js` inneholder hele eksportmotoren. Grunnprinsippet: **én layoutkilde per medie, og forhåndsvisningen bruker eksportmotoren**.

### PPTX (Skjerm)

```
byggSlidePlan(svc, valg) → plan  ─┬─→ exportPptx()   → pptxgenjs
                                  └─→ byggPptSlides() → forhåndsvisning (HTML)
```

- **`byggSlidePlan`** bygger slidplanen: tittelslide, én plan-entry per slide (`{ segs, big, notat, nokkel, del, blank }`), tomme mellomsider etter «tomSlideModus» (`av`/`alle`/`smart`), salmevers per gruppe, ekstra slides, og `posisjoner`-kartet (`nokkel → forste/deler`) som er grunnlaget for margtallene.
- Blanke-sider-logikken: `smart` legger inn blank der skjulte ledd ligger mellom viste ledd, eller der et ledd har `__skjultIntro`/`__skjultAvsl` (merket av `klonMedValg` ut fra per-ledd valgene `:i`/`:a`). Aldri doble blanke; blank etter tittelslide og til slutt er tillatt etter samme regler.
- **`delPptSegs(segs, fs)`** deler segmenter til slide-størrelse med **linjebevisst budsjett** (antall rendrete linjer per slide, korte verslinjer teller som hele linjer; kutt aldri midt i hevet versnummer).
- **`exportPptx`** rendrer planen med pptxgenjs: rollefarger, hevet versnummer (sup-run med redusert skrift), tomme mellomsider, notater, lys bakgrunn, og rydder pptxgenjs 4.x sitt `[Content_Types].xml`-skjema (slideMaster-Overrides).
- **Forhåndsvisningen** (`byggPptSlides` i Eksport.svelte) konsumerer samme plan og tegner HTML-slides — fordelingen er per definisjon identisk.

### PDF (Prest/Medarbeider/Menighet)

```
buildPdfBase64(svc, instr, valg) ─┬─→ base64 → lagrePdf()   (PDF-eksport)
                                  └─→ byggPdfSider()        (forhåndsvisning)
```

- **`buildPdfBase64`** er hele PDF-layoutmotoren (jsPDF): titler, instruksjoner, `skrivSegmenter`-flyten (linjebryting, hevet versnummer, rollefarger, fotnoter), sidestyring, kolonner, marger, avstander. Innholdet komponeres per ledd med `leddTekst` (innledning + hoveddel + avslutning, med plassholder- og dobbelt-filtre).
- **`byggPdfSider`** kjører samme funksjon med `__spor`-instrumentering: hver tegneoperasjon logges, spilles av per side og rendres som forhåndsvisningssider. Forhåndsvisningen er dermed per definisjon lik eksporten.

### Word

`exportWord(svc, instr, filnavn, valg)` bygger docx med docx-biblioteket: samme innhold (klonMedValg-kopien), profilens innstillinger (kolonner, marger, avstand), seksjonstitler med linje, gruppeflyt for salmer og alternativer, lysbildenumre for lysbildemanus.

### Lysbildemanus

`lysbildeTallFor(plan, manuscript, ppt)` mapper leddnøkler til slidenumre: ledd med egne slides får sitt første nummer (+ `del` per gruppe); ledd uten slides får «neste emitterte slide − 1» (F-1-regelen — dekker skjulte ledd og blanke sider); blanke sider med skjult innledning/avslutning gir tall foran/etter leddets egne grupper (`tom`-flagg). Tallene tegnes i manuset ved vers-/gruppe-start (salmer: ett tall per vers).

### Per-ledd valg og `klonMedValg`

`klonMedValg(svc, profil, brProfil)` lager en eksportkopi: dokumentnivå `enabled` respekteres, per-ledd valg leses fra `lesValg(profil)` (Skjerm arver hovedbokser fra det delte Menighet-utvalget; egne Skjerm-valg vinner; `:i`/`:a`/`:t`/`:br` arves ikke). Kopian merkes med `__visOverskrift`/`__visInnhold`/`__skjultIntro`/`__skjultAvsl`/`__ref` og strappes (salmeinfo, innledning/avslutning) — alle eksportformatene konsumerer kopien, så visning og eksport er alltid konsistente.

---

## Kirkeåret og bibeltekster

- `kirkeaar.js`: `lookupKirkeaar(dato)` → kirkeårsdag (navn, rekke, farge, dag-nøkkel); `hentTekster(day, cache, rekke)` henter L1/L2/E + bønn fra bibel.no (via hovedprosessen i Mac-appen / vite-proxy i nettleser), med lokal cache.
- `applyKirkeaar(svc, k, tekster)` (store.svelte.js) fyller dagens bønn og lesningene ved opprettelse og datoendring — **alltid med brukerens bekreftelse** ved datoendring.
- `fyllLesning(it, ref, tekst, evangelium)` (lit.js) setter strukturen: bibeltekst i hoveddelen, referanse inn i innledningens «…står skrevet i …» (via `referanseIInnledning` — erstatter ellipsis eller eksisterende referanse), avslutning fra malen. Plassholder-varianter (`[Lesningstekst]`/`[Evangelietekst]`) og frittstående ledd (B&G) har egne grener.
- Re-henting: `hentBibelteksterPåNytt(svc)` (store) brukes av kontekstmenyen (lesningsledd) og kommandopaletten; fyller alle lesningsledd med ny struktur. Dagens bønn røres ikke.

---

### Bakgrunnscaching av kirkeårsbibeltekster

Ved oppstart (`tekstcache.js`, planlegging i `tekstcache-plan.js`) bygges en prioritert oppgaveliste fra kirkeårspakken: kommende kirkeårsdag → resten av det gjeldende kirkeåret → tidligere dager → dager med annen tekststruktur (festdager/unntak) → de to nabokirkeårene (de andre tekstrekkene) → merkedager. Hentingen er sekvensiell med 1,4 s hvile (lengre pause hvert 15. kall), alt asynkront i bakgrunnen. Tekstene lagres per dag i db-nøkkelen `kirkeaarTekster` (samme cache som appen bruker ved henting), noe som gjør prosessen gjenopptakbar: dager som ligger i cachen hoppes over ved neste oppstart. Indikatoren vises i Kirkeåret-modulen via `app.tekstCache`.

## Konvertering og LLM-skill

- **Innebygd konvertering** (Maler-siden → «Konverter Word/PDF …»): `electron/konverter.cjs` kjører offline i hovedprosessen og oversetter docx/pdf til `.limal`. Regler: hoveddeler fra overskriftstiler, rolleprefiks → `{{r}}…{{/r}}`, bibelreferanser → `BIBELREF |`, rubrikker → `@NOTAT`, salmelinjer → salmeledd, Eller/enten-varianter → alternativgrupper. Heuristisk resultat — etterkontroll i editoren.
- **LLM-skill**: [ArnstadFredrik/liturgi-limal-skill](https://github.com/ArnstadFredrik/liturgi-limal-skill) pakker arbeidsflyten for LLM-styrt konvertering. Skillen henter alltid siste format-spesifikasjon fra dette repoet: [`docs/limal-format.md`](limal-format.md) — dermed er formatet og skriptene aldri eldre i skillen enn i appen.

---

## Bygg, release og distribusjon

| Kommando | Hva |
|---|---|
| `npm run dev` | Vite-utviklingsserver (nettleser) |
| `npm run build` | Statisk produksjonsbygg (GitHub Pages/web) |
| `npm run build:dev` | Dev-bygg (`VITE_DEV_MODE=1`, `__DEV_MODE__`-flagget) |
| `npm run electron:dev` | Dev-bygg + Electron lokalt (port 9230/9310 ved debugging) |
| `npm run app:mac` | `skriv-byggnr.mjs` (byggnr = `YYYYMMDD.HHMM`) + vite build + electron-builder → DMG |
| `npm test` | Enhetstester (`tests/enhet/`) |

- **Release**: `v*`-tag → GitHub Actions bygger mac/win/linux (node 22, `npmRebuild=false`), publiserer release, oppdaterer Homebrew-tap og GitHub Pages (web) — og verifiserer at dev-modulen **ikke** finnes i byggget.
- **Byggnr**: skrives per bygg til `electron/byggnr.txt` og vises i Innstillinger («Versjon 0.0.4 · bygg …»).
- **Web-utgaven**: samme SPA med localStorage-lagring; robust lastning av maler ved deploy.

---

## Tester

`npm test` kjører `tests/enhet/*.test.mjs` (node --test). Suksessivt dekket: slidplan (tittel/vers/blanke/moduser), lysbildeTallFor (F-1, blanke-tall), delPptSegs (linjebudsjett), leddTekst (innledning/avslutning/plassholdere/dobbel-filtre), fyllLesning (struktur/referanse/idempotens), bibeltekst-henting, mdi-ikoner (alle brukte ikoner finnes), bibliotek-flows. Ny funksjon → enhetstest i samme commit.
