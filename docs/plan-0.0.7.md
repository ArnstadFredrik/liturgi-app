# Plan for runde 0.0.7 (etter v0.0.6)

Status: v0.0.6 er publisert (tag peker på `36b5a39`, release/validering/Pages
kjører). Hvert punkt skal ha detaljerte steg, se under. Arbeidsmodus per punkt: implementer → test (enhetstest for ny logikk,
røyk + svelte-check) → commit med bygg-nr → installer i /Applications →
CDP-/skjermverifisering før «ferdig».

## 0. Verifiser v0.0.6-releasen (første punkt, ca. 5-20 min)

1. `gh run watch <release-run>` til mac/win/linux er grønne — feilet jobb:
   «Valider på alle plattformer» skal nå gå grønt etter tema-test-fixen
   (`36b5a39`; den gamle home-stien ENOENT-er på runnerne).
2. Sjekk utkastene: release-jobben lager DMG/EXE/AppImage-drafts; `publiser`-
   jobben setter dem ut av draft (`gh release view v0.0.6`).
3. Homebrew-tap og GitHub Pages skal peke på 0.0.6 (Pages-workflow: web.yml).
4. Installer 0.0.6-DMG i /Applications og røyktest: åpne gudstjeneste,
   Kirkeåret (lys tema som standard), eksport-dropdowns.

## 1. Editor-småpoeng (krever presisering av omfang - spør bruker)

### 1a. Instruksjonsfelt i redigering
- I dag: instruksjoner vises via «Vis instruksjoner»-bryteren (+ @NOTAT).
  Ånsket: fast instruksjonsfelt per ledd i redigeringsmodus (liten, rød
  kursiv), uavhengig av «vis instruksjoner» globalbryteren.
- Steg: 1) datafelter finnes allerede (`it.instr`) — bare visning. 2) Ny
  still i Item.svelte: kompakt felt under teksten, kun i editor. 3) Test:
  CDP-verifikasjon + enhetstest for rendering.

### 1b. charwise v + w i Vim-modus
- I dag: `v` visual, `w` ordvis flytting. Ånsket: charwise-valg følger
  markøren til neste karakter for korte justeringer.
- Steg: 1) les vim-tilstanden (`vn.svelte.js`). 2) test i lysbildeplan? Nei —
  i editor-markørlogikk: spesifikk endring i markør-rutine. 3) enhetstest.

### 1c. Vim → kommandopalett
- Ånsket: `:` i vim-modus åpner kommandopaletten (samme som ⌘K), med
  forhåndsutfylt `:`-prefiks.
- Steg: 1) gut kernel: `Kommandopalett.svelte` får prop/klargjort
  `apenMed(prefiks)`. 2) vim-handler kaller den. 3) CDP-test: `µ:p` → hopp
  til prekenforberedelse.

### 1d. Seksjonsskille (sideskift) i eksporten
- Ånsket: mulighet til å markere «sideskift før dette leddet» i Word/PDF-
  eksporten (salme-innledninger o.l. starter på ny side).
- Steg: 1) data: `it.sideskift` (bool). 2) eksportmotoren: `buildPdfBase64`
  håndterer ny side + `exportWord` section-break. 3) kontekstmenypunkt +
  Oversikt-badgestatus. 4) enhetstester på sidetall-flowet.

## 2. Komponentgjennomgang — nesta bølge

- `ToggleRow.svelte`? Sjekk duplikatmønstre mellom eksport-toggles og
  innstillinger (avpaa-bryter) — kanskje gi ui-sdk-switch.
- `SegmentVelger` for alternativbytte (brukes i Item + Eksport).
- PanelHode ble vurdert avslått — revurder ved fler modulspesifikke paneler.

## 3. Infrastruktur-gjennomgang

- SSH-push mot GitHub feiler (`Permission denied (publickey)`, ingen agent-
  nøkkel): midlertidig omgått med `credential.helper='!gh auth git-credential'`
  over HTTPS. Alternativ: bytt origin til HTTPS-remote permanent, eller
  registrer en ny ed25519-nøkkel på GitHub (`gh ssh-key add`).
- origin-tracking peker på ssh-remote som aldri oppdateres i løpet av
  HTTPS-push — støy i `git status`. Løses av punktet over.
- CI: vurder å cache `npm ci` for kortere bygg (valgfritt).

## 4. Håndbok / docs

- Handbok-bilder er nå laget i lyst tema og harmonerer med ny standard.
- Etter 0.0.7-release: nytt skjermbilde-pass på geometrier som er endret
  (eksport-verktøylinje, Oversikt-tabell).
- `docs/api.md` oppdateres ved endringer i dataformat (`sideskift` i
  `.liturgi`-formatet må inn i `limal-format.md` hvis det lagres).

## 5. Fast regel-huskeliste

- Slett alltid til papirkurven (testfiler i /tmp ender i ~/.Trash).
- Aldri nullstill nøkler i brukerens db i brukerens db (spesielt prekenforberedelseMappe).
- Test-instanser: LITURGI_DB_DIR=test-db og KOPI av .liturgi i /tmp.
