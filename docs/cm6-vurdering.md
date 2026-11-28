# CM6-vurdering (eksperiment-branch `cm6-eksperiment`)

## Hva som er prøvd

CodeMirror 6 erstatter textarea + Prism-overlay i **kilde-modus** i
prekenforberedelse-modulen (`src/lib/Cm6Kilde.svelte`). Riktekst/hybrid er
urørt (fortsatt EditableText). Introduksjon i samme commit som denne filen.

## Hva som virker (CDP-verifisert)

- CM6-montering i kilde-modus, synk begge veier (ekstern tekstendring → doc;
  doc → bind:value).
- Vim via `@replit/codemirror-vim`: `gg`, `x`, `u`, `dd`, `A` + innsetting
  bekreftet gjennom CDP-keyevents.
- Liturgi-merker som CM6-dekorasjoner (ViewPlugin + Decoration):
  `@NOTAT`/`@n` = rød kursiv, rollemerker `L |`/`ML |` = rød fet,
  `BIBELREF | …` = blå. Merkeanalysen (`finnMerker`) er enhetstestet
  (`tests/enhet/cm6-merker.test.mjs`).
- Ex-kommandolinje åpner med `:`; `.cm-vim-panel` vises.
- `:w` er lagt inn som Ex-kommando (`Vim.defineEx('write','w',…)`) som
  trigge modulens lagre. Lagre-knappen fungerer verifisert.

## Ikke verifisert / open punkt

- `:w`-rundturen gjennom syntetiske CDP-keyevents testet, men mtimeoppdatering
  ikke bekreftet via den veien (fokus/nøkkelhåndtering i syntetiske events).
  Test med ekte tastatur før main-godkjenning.
- Vis/høy status, markørstatusfarger som i egen vim (norm/ins/vis) er ikke
  stilt inn — kan legges i CM6-themet senere.

## Plan for veien videre

### Vim-støtte med og uten CM6

1. **Kilde-modus, prekenforberedelse (enties branch)**: CM6 + replit-vim.
   Beslutt mot egen vim.js-paritet (foldetlæsning, blokkmarkør, instr-
   feltintegrasjon) etter brukertesting med ekte tastatur.
2. **Kilde-modus, hovedredigering**: samme komponent om CM6 tas inn.
   Egen vim.js beholder du for EditableText (riktekst) så lenge CM6 ikke
   driver WYSIWYG — den er allreden paritets med v+w (1b) og 1c/«:»-tab.
3. **Enten/eller-strategi**: én vim-modul (utils: @replit/codemirror-vim for
   CM6-flater, egen vim.js for contenteditable) med felles regler:
   - Blokkmarkør/statusfarge skal se lik ut i begge (én CSS-klasse).
   - Ekstra (Ex/kommandopalett) skal åpne samme kommandopalett (1c-design):
     CM6 Ex-meldinger rutet videre — `:w` → lagre, `:e navn` → åpne,
     alles andre → `Kommandopalett.apenMed(':' + cmd)`.

### WYSIWYG i hele appen

- **Fase 1 (nåværende)**: EditableText = riktekst-kontent med render-midling
  («slim opp»-måten): beholder; CM6 bare kilde-modus.
- **Fase 2**: Prøv CM6 *ristekst* med utvalgte lezer-markers (NOTAT/rolle/
  BIBELREF som widgets) i prekenforberedelse RIKTEKST-fanen. Hvis markør-
  widgets + vim fås stabilt — vurder CM6 for hovedredigeringens riktekst i
  egen branch igjen.
- **Fase 3**: Siste hopp: bytt EditableText til CM6-riktekst + behold
  render-pipeline (rollemerker, ledd-merker) som CM6-widgets, bruk uten
  Toolbar-maskineri i eksporten. Store endringskostnad; krever verifikasjon
  mot: 1a instr-feltet, 1d seksjonsskift, før beslutning.

## Avstemming
- Branch: `cm6-eksperiment`; konflikter med main: ingen (kun addisjon).
- For å gå videre: merge denne først etter brukertest.
