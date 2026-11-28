# Eksport-verktøylinjene — plan for rydding (forslag)

Status: gjennomgang av alle verktøylinjene i eksport-modulen og et forslag til
organisering. Dagens én horisontal rad med alt i seg er rotete på små skjermer
og blander forestillinger.

## Gruppene i dagens rad

| Blokk | Hva den styrer | Endres ofte? |
|---|---|---|
| FORMAT / KOLONNER / MARGER / AVSTAND | sideoppsett A4-A5, kolonner, marger, luft | sjelden |
| LAGRE ▾ | lagre-edit kun PDF/Word | ofte |
| HOVEDDEL / LEDD / TEKST + ↺ | skriftstørrelser per nivå | sjelden |
| VIS NAVN / HOVEDTITLER / INSTRUKSJONER / SALMEINFO / KORTE TITLER | profil/format-innholdsvalg | ofte |
| (Skjerm) TEKST/TITTEL, JUSTERING, BLANKE, LEDDTITLER, TITTELSLIDE, LYS BAKGRUNN, NOTATER, EKSTRA SIDE | slide-oppsettsregler | ganske ofte |

## Plan — fire nivåer

1. **Nivå 1: Lagre-knappen flyttes ut av verktøylinjen** — inn under det
   høyre panelets eksportknapper («Eksportér»-handlinger setter lagre-valget
   via samme meny).
2. **Nivå 2: Typografi ▾-dropdown** — HOVEDDEL/LEDD/TEKST + ↺ pakket i en
   dropdown med én chip «Aa 11/11/10» som oppsummerer tilstanden.
3. **Nivå 3: Sideoppsett ▾-dropdown** — FORMAT / KOLONNER / MARGER / AVSTAND
   (+ Blanke sider for PPTX) i en dropdown, chip «A5 · 1 kol · Normal».
4. **Nivå 4: Skjerm-profilen grupperes i tre undergrupper** — innstillte
   verdier (tekst/tittel/justering), innholdsvalg (leddtitler/tittelslide/
   lys bakgrunn/notater/ekstra side) + egne forhåndsvisninger.

## Effekt

- Verktøylinjen går fra én lang rad til:
  `[Sideoppsett ▾] [Typografi ▾] [Visning ▾]   [Lagre ▾]`
- Status-chips: 'Visning (3)' og «Aa 11/11/10» gir status på ett blikk.
- Det endres ofte (profiler, format, knapper) forblir synlig — det endres
  sjelden ligger i dropdown.

## Anbefalt rekkefølge

1. Nivå 1 (lagre) + Nivå 2 (typografi) — leveres i én omgang.
2. Nivå 3 (sideoppsett) i neste omgang.
3. Nivå 4 (skjerm) sist siden den berører Skjerm-profilens verktøy.

Estimert arbeid: nivå 1–2 i én økt; nivå 3 moderat; nivå 4 størst.
