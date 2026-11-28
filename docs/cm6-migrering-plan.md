# Migreringsplan: CodeMirror 6 med liturgi-widgets

Mål: erstatte EditableText (egen contenteditable + lit.js-render) med CM6
som editor over hele appen, og bygge alle liturgiske markeringer som
CM6-decorations/widgets slik at WYSIWYG-prinsippet bevares: visning = eksport.

## Utgangspunkt (nov 2026, oppdatert)

- EditableText.svelte er dagens WYSIWYG-komponent: visning = eksport
  (samme lit.js-motor), klikk-til-rediger via contenteditable.
- Egen vim.js og alle vim-valg er fjernet fra main (commit 2712849):
  appen har i dag INGEN vim. CM6-vim (@replit/codemirror-vim) er
  dermed den eneste vim-motoren videre.
- Prekenforberedelse-redigeringsmodulen er nå dev-modul
  (app.devModus + __DEV_MODE__ lazy-import i +page.svelte): koden
  (med Cm6Kilde/CM6) lastes aldri i pakkede utgaver. Alt CM6 ligger i
  dev-modus videre.

## Widget-katalog (markering for markering)

| Merke | Render i dag | CM6-mekanisme |
|---|---|---|
| Rolle L -pipe, ML -pipe, A -pipe | rød fet inline | Decoration.mark (klassen lit-rolle) |
| at-NOTAT / at-n | hele linjen rød kursiv, skjult i eksport | Line-decor + replace-widget: prefiks rendres som badge |
| BIBELREF-pipe Matt 25,31-46 | inline blå | Decoration.mark (blå) + hover-tooltip |
| FOTNOTE-pipe | dempet referanse inline | Decoration.mark + footnote-tooltip |
| nummer-skilt overskrift (#, ##) | større skrift | Line-decor med skriftskala |
| bindestrek punkt | punktliste | Line-decor + innrykk |
| dobbelstjerne fet / enkelt kursiv | inline | Decoration.mark med font-weight/style |
| krll-1 hevet versnummer (vers-merket med sirkumfleks) | sup | Decoration.mark (vertikal, mindre skrift) |
| dobbel-krll refreng-blokk | kursiv blokk | Line-decor over blokken |
| Salmeinfo (nummer/tittel) | inline-felt i salmeleddet | Block-widget over innholdet |

Fem CM6-mekanismer: mark (inline-farge/font), line-decor (hele linjer),
replace-widget (skjule koder og vise rendret utgave), tooltip-widget og
block-widget.

## Fasene

### Fase 0 - Beslutningsbase
- Ekte-tastaturtest av cm6-eksperiment (:w, motiver, dekorasjoner).
  Rapport: gaa videre eller rull tilbake.
- Måling: ytelse med store dokumenter (300+ ledd).

### Fase 1 - Felles widget-bibliotek (ny fil src/lib/lit-widgets.js)
- Flytt finnMerker fra Cm6Kilde inn i den felles modulen.
- Implementer alle ti rader i widget-katalogen som
  litDekorasjoner(text) -> DecorationSet (RangeSetBuilder,
  viewport-begrenset for store dokumenter).
- Enhetstester med samme kontrakt som cm6-merker.test.mjs (fra, til,
  klasse), + nye for FOTNOTE/overskrift/punktliste/refreng/fet/kursiv.
- Ingen visning endres ennå - ren infrastruktur.

### Fase 2 - CM6 i kilde-modus overalt
- Kilde-modus i alle felter til Cm6Kilde: prekenforberedelse +
  Vis-kildekode-bryteren i EditableText.
- Prism-overlay og egne linjenumre går ut (CM6 tar dem).
- Vim: replit-vim i kilde, vim.js fortsatt i riktekst; samme
  statusfarge (en CSS-klasse for norm/ins/vis).
- Ex :w og :e mappes til modulens lagre/åpning (som i Cm6Kilde);
  andre kommandoer rutes til Kommandopalett.apenMed().

### Fase 3 - Riktekst: CM6 som WYSIWYG-editor (den store fasen)
- Ny komponent LitCm.svelte (CM6 som riktekst-editor).
- Hovedregelen: dekorasjonsreglene bygger på den samme
  roleSegments-kjøden som lit.js bruker - da er visning = eksport
  per konstruksjon, ikke per konvensjon.
- Enhetstest: litDekorasjoner(tekst) skal gi samme visuelle resultat
  som litHtml(tekst) (farge, fet, sup, blokk) - regresjonsskjold.
- Feltene konverteres én ad gangen: it.text først, så it.instr,
  alternativer, innledning/avslutning, salmeinfo,
  bibliotekforhåndsvisning (10+ felter).
- Endring av interaksjon: CM6 er alltid editor (ikke velge
  visning/redigering); A/B-bryter i Innstillinger (riktekst-motor)
  slik at du kan vende tilbake til EditableText en periode.

### Fase 4 - Eksport og linjer
- Regresjonstest: eksportens output fra lit.js skal ikke endre seg
  ved CM6-redigering (tekst inn = tekst ut).
- Merker skal ikke lekke ut i eksporten (profilvalgene: instruksjoner
  skjules i Menighet, med-kolonne i Skjerm osv.).

### Fase 5 - Vim: ferdig i komponenten (CM6-vim)
- @replit/codemirror-vim er nå den eneste vim-motoren (vim.js er pensjonert på main).
- Statusfarge/blokkmårk harmoniseres: ån CSS-klasse for norm/ins/vis.
- ':' i normal-modus åpner Kommandopalett.apenMed(":") (1c-designet).

### Fase 6 - Avslutning
- EditableText pensjoneres.
- Oppdater håndbokskjermbilder og AGENTS.md.

## Risiko og tiltak

| Risiko | Avbøting |
|---|---|
| Widgets avviker fra lit.js (eksporten må være lik) | Fase 1/3-enhetstest: dekorasjons-output = litHtml-output |
| 10+ redigeringsfelter i Item.svelte | A/B-bryter + felt-for-felt-rullering (Fase 3) |
| Vim-paritet (blokkmarkør, instr-felt) | vim.js er pensjonert; blokkmarkør re-lages som CM6-tillegg når LitCm kommer |
| Opplevelse: redigeringsatferd endres | A/B-bryter (Fase 3) + kan rulles tilbake til EditableText |
| Ytelse i store dokumenter | Viewport-begrensede dekorasjoner; måling i Fase 0 |

Parallelt arbeid: gudstjenesteredigering (brukerkrav nov 2026)

- Gudstjenesteredigering med CM6 bygges som en PARALLELL modul
  (LitCm.svelte), aldri ved å bytte ut EditableText i feltene.
- Tilgjengeliggjøres som ENTEN et alternativ i Innstillinger
  (dev-modul: skjules i pakkede utgaver med samme .skjult-teknikk)
  ELLER en egen dev-modul i sidemenyen (som Malverktøy).
- Skifte skjer først når LitCm har paritet med EditableText
  (alle merker, alle 10 felter, eksport-likhet) og er tatt i bruk.

## Beslutningspunkter for brukeren

1. Fase 0 godkjennes etter ekte-tastaturtesten av cm6-eksperiment.
2. Fase 3: valget Innstillinger-alternativ vs. egen dev-modul for
   LitCm (gudstjenesteredigering) foretas først når omfanget er
   synbart; ingenting fjernes fra EditableText før paritet.
