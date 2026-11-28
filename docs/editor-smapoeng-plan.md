# Editor-småpoeng — detaljert plan (punkt 1 i runde 0.0.7)

Status: plan. Arbeidsmodus per trinn: implementer → enhetstest for ny logikk →
røyk + svelte-check → commit med bygg-nr → installer i /Applications →
CDP-/skjermverifisering før «ferdig».

## Dagens arkitektur (kort)

- **Tekstfeltet** er egenutviklet: `EditableText.svelte` (1 102 linjer) —
  contenteditable med render (rollemerker, BIBELREF, FOTNOTE, @NOTAT-merker,
  overskrifter, punktlister) pluss markdown-modus («Vis kildekode») og
  undo-stakk.
- **Vim-modus** er egenutviklet: `vim.js` (586 linjer) — normal/insert/visual/
  vline, operators d/c/y med motions, tellere, f/F/t/T, %, { }, registers,
  kobles via `vimKeydown()`.
- **Kommandopaletten** er egenutviklet (`Kommandopalett.svelte`) — ⌘K,
  samme handler-sett som mac-menyen via `kjorMenyId()`.
- **Instruksjoner** i dag: `it.instr` finnes i data; redigeres som @NOTAT-linje
  eller kontekstmenyens «Legg til/fjern instruksjonsfelt» (Item.svelte:323);
  vises styres av globalbryteren `visInstr`.

## Pakkeanalyse — kan pakker løse delene?

| Utfordring | Kandidat | Vurdering |
|---|---|---|
| 1b/1c: vim | **@replit/codemirror-vim** (CM6, Replit, aktiv — sist feb 2025) | Full vim-motor (motions, operators, registers, **Ex-kommandoer** for «:»). Krever CodeMirror 6 som editor-motor — dvs. at contenteditable/EditableText erstattes. CM6 er liten (68–92 KB gz) og tree-shakbar, men liturgi-rikteksten (rollemerker inline, BIBELREF, hevede vers, refreng) må bygges som CM6-decorations. Stor omlegging av v-tested kode. |
| 1c: palett | svelte-command-palette v2 (Svelte 5), @svgrid/grid sin SvCommand, @mateothegreat/svelte5-command-palette | God fuzzy + fokusfelle + hotkey. Men paletten finnes, med ⌘K, kategorier og kjorMenyId-kobling — bytte gir ny integrasjon uten merverdi. |
| 1a: instruksjonsfelt | ingen relevant pakke | Ren UI i Item/EditableText. |
| 1d: seksjonsskille | ingen relevant pakke | Egen logikk i export.js (jsPDF + docx). |

**Anbefaling:**
- **1a og 1d: ingen pakke** — purpose-built endringer i egen kode.
- **1c: ingen pakke** — utvid den eksisterende paletten (vim `:` → åpne med
  forhåndsfylt søk). Små grep.
- **1b: behold egen vim.js** (charwise-fix er én motion-funksjon).
- **CM6 + @replit/codemirror-vim** er plan B hvis vim-behovet vokser (Ex,
  register, buffers): gjøres da som eget prosjekt med pilot i
  prekenforberedelse-editoren (nesten ren plaintext der), ikke i denne runden.
  Høy risiko: hovedredigeringens riktekst-WYSIWYG er appens viktigste
  og mest kritiske interaksjon — derfor pilot først.
## 1a. Instruksjonsfelt i redigering

**Mål:** fast, kompakt felt per ledd (rød kursiv, 12,5–13 px), synlig i
redigeringsmodus når leddet har instruksjonsfelt — uavhengig av globalbryteren.

Steg:
1. **Data:** `it.instr` finnes; kontekstmeny-switchen finnes (Item.svelte:323).
2. **Visning:** i EditableText/Item: `.it-instr`-rad under teksten
   (klikk-til-rediger som resten); vis når `it.instr.trim() !== ''`.
3. **Eksport ubrutt** — klonMedValg-logikken styrer allerede instruksjoner.
4. Test: CDP (felt redigeres, synlig uavhengig av visInstr), røyk +
   svelte-check (enhetstest på leddTekst-filteret dersom det endres).

Estimat: 1–2 timer.

## 1b. charwise v + w

**I dag:** `v` gir visual; `w`-motion er ordvis. Som `vw` blir hele ord.
Ønske: kortere presisjon i visual — charwise-trinn.

Steg:
1. I `vim.js` motionfunksjonen (linje 116–na): i modus 'visual' skal `w`
   stoppe charvis på nåværende ord-slutt (råordvis posisjon i normal,
   men visual-utvidelsen skal aldri gå forbi char-posisjonen).
2. Enhetstest: `nyVimTilstand()` + syntetisk doc → forventede posisjoner
   (v w d sletter til char-slutt, ikke hel ord).
3. CDP: v + w + d = riktig område slettet.

Estimat: 0,5–1 time.

## 1c. Vim → kommandopalett

**Mål:** i vim-modus åpner `:` kommandopaletten med forhåndsfylt søk.
1. `Kommandopalett.svelte`: eksporter «apenMed(forhånd = '')» (state-utfiller).
2. `vim.js`: normal-modus `:`-tast → konsumér og callback → palett-åpneren.
3. EditableText/Editor: pass callbacken fra Item til paletten.
4. CDP: vim-normal → `:` → palett synlig med før-utfylt tekst, filtrering
   fungerer.

Estimat: 1–2 timer (tvers av tre filer).

## 1d. Seksjonsskille (sideskift) i eksporten

**Mål:** per ledd flagg `sideskift` (kontekstmeny: «Sideskift før dette
leddet») som gir sideskift i Word/PDF-eksporten og forhåndsvisningen
(PPTX er allerede per-slide — vises som kommentar i hjelp).

Steg:
1. **Data:** `it.sideskift = true|undefined` lagres i `.liturgi`/`.limal` —
   dokumenteres i `limal-format.md`.
2. **Kontekstmeny:** nytt punkt med ✓ (Item.svelte:325-stil).
3. **PDF (`export.js buildPdfBase64`):** ved leddstart med flagget:
   doc.addPage() før tegneprosedyren; sidetall fortsetter.
4. **Word (`exportWord`):** docx-bibl: `pageBreakBefore: true` på
   leddets første paragraf.
5. **Oversikten:** radmarkering (som «ikke med»-stilen) for ledd med
   sideskift.
6. **Enhetstest:** buildPdfBase64 → sideskift gir to rader; exportWord →
   pageBreakBefore på riktig paragraf.
7. CDP: forhåndsvisning med sideskift synlig.

Estimat: 3–4 timer.

## Rekkefølge

1d (størst verdi) → 1a → 1c → 1b (minst). CM6-vim-avklaring foreslås
presentert til bruker samtidig som denne planen.

## Fast regel-huskeliste

- Aldri nullstill nøkler i brukerens db (spesielt prekenforberedelseMappe).
- Test-instanser: LITURGI_DB_DIR=test-db og KOPI av .liturgi i /tmp;
  slett i ~/.Trash.
- Bygg-nr YYYYMMDD.HHMM i manuelle bygg, nevnt i sammendrag.
- Ny funksjon → enhetstest i samme commit.
