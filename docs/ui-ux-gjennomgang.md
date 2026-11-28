# UI/UX-gjennomgang — liturgi-app

Gjennomgang av hele appen med fokus på styling og brukervennlighet.
Metode: skjermbilder av alle visninger (mørkt + lyst tema, CDP mot test-db) +
kildegjennomgang (`src/app.css`, modulene, `+page.svelte`), med **ui-sdk som
referanse** (hodeuavhengige komponenter med innbygd tastatur/ARIA/fokus, se
`node_modules/@ui-sdk/svelte/docs/`).

---

## Hovedfunn

### 1. Fire ulike knappestiler blandes — knapptypene er ikke et system
Fylt rød (fanen «Eksport», aktivt kort, «Eksportér alle profilene»), omriss
(«Eksportér kun «Prest»», visningsvalg-chips), ghost (inaktive chips) og hvite
kort («Lagre ▾»). Navigasjon (fane) ser identisk ut med primærhandling (knapp);
chips ser ut som knapper men virker som brytere; «Sett som standard» og
«+ Ny profil» er bare tekst.
**→ Definer 4 knapptyper i app.css (primær / sekundær / ghost / fare) + én
chip-stil per kontrolltype, og erstatt ad-hoc-stylingene. Differensier faner
fra knapper (fane = understreket/lys bakgrunn, aldri fylt primærfarge).**

### 2. Kontrast og tekststørrelse under WCAG AA i mesteparten av sekundærtekst
57 steder bruker 10–11 px. Grå metadata («SIST BRUKT · SISTE 5», datoer,
«Lilla · II», «1/16», «162 %»), small-caps-seksjonstitler («AVSNITT»,
«EKSPORT», «GENERELT») og kode-chips ligger trolig under 4,5:1 på krem —
spesielt i lyst tema. Previewet står i 162 % zoom som standard: teksten er
for liten.
**→ Hev minstetekst til 12,5–13 px, mørkne «muted»-fargen, verifiser
kontrasten på faner/chips mot 4,5:1 (liturgirøden `#c0392b` på creme
`#f6f1e7` er fin for store elementer, men grensetilfelle for liten tekst).**

### 3. Tastatur- og skjermleser-støtte er ufullstendig
`:focus-visible` finnes bare i app.css + Malverkøy; `aria-label` bare i
6 moduler; kun 24 `aria-pressed/-checked/-expanded` i hele koden. Ikonknapper
uten navn: panelkollaps, nullstill (↺), «Aa»-merket, zoom −/+. Ingen synlig
fokus på chips/faner, ingen «hopp til innhold», leddkortets kombinasjon
(avkryssning + chip + tittel + dra) mangler gruppering.
**→ Bygg kontrollene på ui-sdk-komponentene (Switch, Checkbox, TabList,
Dialog, Menu, Tooltip) — tastatur, ARIA og fokus følger med. Definer én
global fokusring-token og `:focus-visible`-regel.**

### 4. Informasjonsarkitekturen i eksportmodulen står «på hodet»
Arbeidsflyten er: velg profil → velg format → eksporter — men panelet viser:
AVSNITT → EKSPORT (én avkrysningsboks) → PROFILER → EKSPORTFORMAT → knapper.
«Lysbildemanus» hører inn under formatvalget (Word/PDF/PPTX/slideplan);
«Sett som standard» gjelder hele profilen, ikke bare formatet. Primærknappene
ligger nederst, trolig under folden.
**→ Rekkefølge i panelet: PROFILER → FORMAT (4 formater) → AVSNITT (;»
eksportknappene fast nederst, alltid synlige. Slå EKSPORT + EKSPORTFORMAT
sammen i ett «Format»-panel.**

### 5. Duplikater og navneblanding i sidebaren
«Bakke - Gudstjeneste» vises både under Åpne og Sist brukt; «2026-11-22 …
Kristi kongedag» to ganger; «Mørkt utseende» (en handling) ligger blant
navigasjonslenkene; «Diff» / «Malverktøy» er utviklerverktøy uten avstand
fra brukerfunksjonene.
**→ Dedupliser «Sist brukt» mot åpne filer; flytt temabryteren ut av
navigasjonen (ikonknapp i topplinjen); grupper Diff/Malverktøy under en
diskret «Utvikler»-seksjon som kan skjules.**

---

## Konkret plan (prioritert)

### P1 — Grunnlag: tokens + kontrollsystem (FERDIG, commits d7b49f4–08ab902)
1. **Designtokens i app.css**: farger (liturgirød / mørkrød / success / danger /
   dempet), mellomrom (4 nivåer), radius, skriftstørrelser (lt/md/lg),
   fokusring. Refaktorer ad-hoc-verdier til var()-bruk.
2. **Knapptyper + chip-stil** (hovedfunn 1) som globale klasser.
3. **ui-sdk-utskifting, runde 1** (størst gevinst fra ferdig tilgjengelighet):
   - Kontekstmenyene (15 høyreklikk-steder) → ui-sdk **Menu**
   - Dialogene (Modal.svelte, KonverterModal) → ui-sdk **Dialog**
   - Fanene (Redigering/Oversikt/Salmer/Eksport; Bibliotek/Maler;
     Innstillinger) → ui-sdk **TabList**
   - Visningsvalg-chips → ui-sdk **ToggleGroup** (holder orden på
     aria-pressed og multiple)

### P2 — Eksportmodulen (viktigste arbeidsflate) — FERDIG (d5e6416 → 497e894)
4. Rekkefølge og gruppering i høyre panel (hovedfunn 4); eksportknappene
   fast nederst og alltid synlige.
5. «EKSPORT» + «EKSPORTFORMAT» → ett «Format»-panel; «Lysbildemanus» som
   fjerde format; «Sett som standard» flyttes til profilseksjonen;
   «Blanke sider» inn under formatvalget.
6. Zoomkontrollen fast i forhåndsvisningslinjen (ikke flytende over
   innholdet); slå «1/16» og sidechipen sammen til én indikator.
7. «Lagre» ut av verktøylinjen (oppleves som instruksjonsknapp klemt mellom
   innstillinger); vurder lagre-hint i sidebaren.
8. Funksjonsforklaringer for visuelle statusmerker: «Menighet»-deaktivering
   får forklaring via tittel/hint, «Innhold med» får tydelig Rolle.

### P3 — De øvrige visningene — FERDIG (sesonginndeling i a96e101-/3c2f48c, strørelsespass i a96e101)
9. **Salmer**: layout + «Format»-panelets mønster.
10. **Kirkeåret**: fargedots får tekst og tooltip (liturgisk fargenavn),
    ukedag i datolisten, sesonginndeling i kalenderen, «I dag»-knapp,
    cachingbanneret får «Oppdater»-knapp. «Dagens bønn» → «Bønn for
    {dato}». Korrekturles navn (stavemåter over hele linjen).
11. **Bibliotek**: vis original-resultater i tom-tilstanden i stedet for
    død sone; «Etter type» → eksplisitt filterknapp med aktivmerke +
    «nullstill»; tag-/mappenavigasjon av ressursbanken.
12. **Innstillinger**: skill hjelp / lagring / konto i egne grupper (h3);
    «Regenerer» / «Logg ut» får egen destruktiv knappestil + bekreftelse
    (ui-sdk Dialog); versjonslinjen flyttes til foten.
13. **Sidebar**: dedupe (hovedfunn 5), ett fokus- og klikkmål per element.

### P4 — Finpuss — FERDIG (kontrasspass a96e101; fokus-i-lytema verifisert; mikrosprk i tekstcache)14. Kontrast- og størrelsespass over alle 10–11 px-tekster (hovedfunn 2).
15. Synlig fokus globalt via `:focus-visible`-token.
16. Mikrospråk: «cachet» → «mellomlagret»; konsist datonormal
    («søndag 29. november 2026») overalt; anførselsteg ok.
17. Eksport-teksttrekk (delPptSegs-delepunkter og margtallstøtten er nylig
    fixet — ingen endringer her utover oppfølgingsverifisering).

---

## Estimert omfang
- P1: tokens + knapper + 4 ui-sdk-komponenter (ca. én økt)
- P2: eksportmodulen (én økt; røyktest + CDP-verifisering)
- P3: per visning småpuljer (3–5 endringer hver)
- P4: én kort finpusset bolk (kontrast/fokus/språk)

Anbefaler P1 → P2 i rekkefølge; verifisering hver gang med røyktestene og
CDP-skjermbilder.


---

## P5 — Responsiv layout (startet, `890fb77`/`2a0da6f`)

Tre bruddpunkter i app.css:
- **1240 px** — trangere vindu (eks-ekstra-gruppen skjules — eksisterende regel)
- **1080 px** — sidebar i ikon-modus (56 px, kun ikoner); bibliotek stables
  (master over detalj); Kirkeåret-artikkelen full bredde; eksport: liste
  over forhåndsvisningen
- **840 px** — høyre sidemeny blir uttrekk (drawer over innholdet, box-shadow);
  sidebar smalere (48 px); eksport-verktøylinjene stables radvis;
  salmeradene stables; Bibliotek søkefeltet wrap
- Electron: `minWidth` 900  620 px, sø vinduet kan bli spisst av andre apper
- Verifisert med CDP-simulering av narrow-regler på Eksport/Bibliotek/
  Innstillinger/Kirkeåret (skudd i ui-shots10)

---

## Komponent-/strukturrunde (påbegynt 2026-11-28)

Mål: hver UI-del bygges én gang; modulspesifikke detaljer i modulens eget
scope i `app.css`. Fremgangsmåte: grep etter dupliserte mønstre, trekk ut
komponent med props/snippets, behold de eksisterende CSS-klassene (visuell
endring = null).

| Komponent | Status | Erstatninger |
|---|---|---|
| `ModulTopp.svelte` (modul-header, sticky/klebet) | levert | `+page.svelte`, Kirkeaar |
| `Chevron.svelte` (vis/skjul-knapp) | levert | DelerTabell, Oversikt |
| `DraHandel.svelte` (dra-håndtak) | levert | DelerTabell, Oversikt |
| confirmBox | ferdig fra fr (modal.svelte.js sentral) | 8 moduler |
| `SlettKnap.svelte` (søppelbøtte-ikonknapp) | levert | DelerTabell, Editor, Oversikt, Sidebar |
| `IkonKnapp.svelte` (ikonknapp med aria-label) | levert | Eksport (4 zoom), Forberedelse (oppdater) |
| PanelHode (sidepanel-topper) | avsla (for får felles knutepunkter) | panelstila beholdes i sine scopes |

Regel er notert i AGENTS.md («Gjenbrukbare komponenter»).

### Status etter autonom runde 2026-11-28

- Komponentrunden er fullført: ModulTopp, Chevron, DraHandel, SlettKnap,
  IkonKnapp levert og verifisert; PanelHode avslått (for få felles
  knutepunkter). main er merget fra ui-sdk (commit `ede41c6`).
- Eksport-verktøylinjen: alle fire nivåene levert (se
  `docs/eksport-verktoylinje-plan.md`).
- Handbok-skjermbilder: påbegynt men IKKE ferdig — skjermbilder tatt mot
  installert app blir identiske/lossen når vinduet ikke er aktivt
  (rendering-pause bak andre vinduer). Må tas med Liturgi-vinduet i
  forgrunnen (mørkt tema, 11 bilder i `docs/bilder/`). Ikke commit-et;
  endelige webp-filer gjenopprettes med `git checkout -- docs/bilder`.

### Til bekreftelse (krever deg)

1. **v0.0.6-release**: versjonbump + tag `v0.0.6` + push (starter
   release.yml, Homebrew-tap, Pages). Krever din godkjenning.
2. **Editor-småpoeng** (instruksjonsfelt i redigering, charwise v+w,
   Vim → kommandopalett, seksjonsskille): trenger presisering av omfang
   før implementering.

### Fullført i punkt 2-runden (2026-11-28)

- **Lys tema er standard** (store: `theme: 'light'`): enhetstest
  `tema.test.mjs` låser det (133/133) — commit `b94e0ee`.
- **Handbok-bilder ferdig**: alle 11 skjermbilder tatt på nytt i lyst
  tema mot installert app med test-db (unike hasjer, webp q82) —
  commit `feae686`. Handbok-HTML regenerert (`npm run handbok`).
