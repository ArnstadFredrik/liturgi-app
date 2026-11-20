# Liturgi — designplan (shadcn-inspirert, creme/lys + mørkt tema)

Referanser: ui.shadcn.com (token-modell og komponentpraksis), tailwindcss.com (skalaer og var-struktur).
Prinsipp: **ett token-lag** i `app.css` (samme variabelnavn som i dag), komponentene leser bare variabler —
da bytter hele appen tema med én klasse på rotelementet (`:root` / `.dark`).

## 1. Farger

Basert på dagens identitet (rød + Georgia + creme), modernisert til et fullt token-sett.

### Lys (off-white/creme — aldri ren hvit)

| Token            | Verdi    | Bruk |
|------------------|----------|------|
| `--background`   | `#faf7f1` | hovedbakgrunn (varm off-white) |
| `--card`         | `#f6f1e7` | kort/panel (klassisk creme) |
| `--card-raised`  | `#fffdf8` | hevede flater: modal, popover, input |
| `--foreground`   | `#2b2622` | primærtekst (varm nesten-svart) |
| `--muted-foreground` | `#8a7f72` | sekundærtekst, etiketter |
| `--border`       | `#e6ddcf` | skillelinjer, kantlinjer |
| `--input`        | `#efe8db` | input-bakgrunn |
| `--primary`      | `#b23a2e` | liturgirød (videreført fra `#c0392b`, dempet) |
| `--primary-foreground` | `#fdf6ec` | tekst på rød |
| `--accent`       | `#a34e2a` | valgt/aktiv tilstand (varm oker-rød) |
| `--accent-soft`  | `#f0e4d7` | myk valgt-bakgrunn (listevalg, chips) |
| `--destructive`  | `#b23a2e` | (samme familie som primær) |
| `--ring`         | `#c9803f` | fokusring (oker) |
| `--success`      | `#4a7c59` | kvittering/ok |

### Mørk (varm mørk — aldri ren svart)

| Token            | Verdi    | Bruk |
|------------------|----------|------|
| `--background`   | `#191614` | hovedbakgrunn (varm kull) |
| `--card`         | `#211d1a` | kort/panel |
| `--card-raised`  | `#292420` | modal, popover, input |
| `--foreground`   | `#f0e9de` | primærtekst (varm off-white) |
| `--muted-foreground` | `#a89b8b` | sekundærtekst |
| `--border`       | `#352e29` | skillelinjer |
| `--input`        | `#26211d` | input-bakgrunn |
| `--primary`      | `#d05245` | rød lysnet for kontrast på mørkt |
| `--primary-foreground` | `#1c1512` | tekst på rød |
| `--accent`       | `#c9803f` | oker som aktiv-farge i mørkt |
| `--accent-soft`  | `#322a24` | myk valgt-bakgrunn |
| `--ring`         | `#c9803f` | fokusring |

Begge temaene: `--radius: 8px` (små elementer 6, kort 12, modal 14).

## 2. Typografi

- **UI**: systemfont (`-apple-system, "SF Pro Text"`) — mac-nativt, 13 px grunntekst, 11 px etiketter (uppercase, letter-spacing 0.8 — som dagens `sidehead`), 15–17 px overskrifter (600–800 vekt).
- **Liturgiinnhold (editor + eksport)**: **Georgia beholdes** — den er appens identitet i innholdet. 15 px/1.55 i editor, alternativtekster i kursiv.
- Tall/tidsangivelser: `font-variant-numeric: tabular-nums`.

## 3. Komponentbibliotek (shadcn-praksis, kode eid i appen)

| Komponent | Erstatter i dag | Token-bruk |
|---|---|---|
| Button (primary / secondary / ghost / destructive) | `avpaa`, `.w-mal button`, toolbar | primary=rød, ghost=toolbar, destructive=Slett |
| Input / Textarea | `#modal input`, søkefelt | `--input`-bakgrunn, `--ring`-fokus |
| Select | mal-velger i Ny gudtjeneste | som input |
| Checkbox / Radio (chips-stil) | `m-chk-jord`, filtre | `--accent-soft` valgt |
| Chip / Badge | type-merker, filtre | pill, 20 px radius |
| Card / Panel | `insp-gruppe`, `malgruppe`, `utkast-boks` | `--card` + `--border` + 12 radius |
| Dialog / Modal | `#modal` (+ `.bred`) | `--card-raised`, skygge + 14 radius |
| Command palette | Kommandopalett | som modal, søkefelt øverst |
| Tabs | Bibliotek-faner | understrek eller pill, `--accent` |
| List rows | `w-mal`, `mal-liste`, avsnittsliste | hover `--accent-soft`, valgt `--accent` |
| Toast | svelte-sonner (finnes) | `--card-raised` |
| Tooltip / title | eksisterer delvis | 11 px, `--card-raised` |
| Separator | `side-skiller` | `--border` |

Ikoner forblir **SF Symbols / MDI inline-path** (fast regel) — ingen webfonter.

## 4. Layoutstruktur

Uendret informasjonsarkitektur, strammere visuell rytme (8 px-spacing-skala):

```
┌─ Toolbar (44 px, --card) ──────────────────────────────────┐
│ [＋ Ny] [Tema] [vim-status]        [søk ⌘K]                │
├────────┬───────────────────────────────────┬───────────────┤
│ Venstre│  Editor (Georgia, maks 720 px)    │ Høyre         │
│ maler/ │  ┌ seksjonskort ──────────────┐   │ DokInsp       │
│ dokument│  │ I. Samling      [Standard] │   │ Del-grupper   │
│ -liste │  │  ledd / alternativer       │   │ Info/handlinger│
│        │  └────────────────────────────┘   │ Salmer        │
└────────┴───────────────────────────────────┴───────────────┘
```

- Seksjonskort: `--card`, 12 px radius, tittelrad med typemerke/del-gruppe-chip til høyre.
- Panelene får fast 260–300 px bredde og deler samme kort-stil som editor-kortene — helhet.
- Modal: sentrert, `--card-raised`, 24 px indre luft, knapperad nede til høyre.

## 5. Tema-bryter

Lagres i db (`tema`: lys/mørk/system, finnes allerede). `document.documentElement.classList.toggle('dark')`
+ alle farger via tokens → ingen komponentendringer trengs for mørk modus.

## 6. Trafikklys / rekkefølge når layout-oppdateringen starter

1. `app.css`: token-lag + mørkt tema + basis-komponentstiler (knapper/input/kort/modal).
2. Toolbar + tema-bryter.
3. Høyre panel (DokInsp) og venstre lister (Maler/Bibliotek).
4. Editor + seksjonskort.
5. Modaler (m-*) — verifiseres med skjermdump per modal (fast regel).
