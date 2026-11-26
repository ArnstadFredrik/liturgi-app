# Malspråket for prekenforberedelse

Malene for prekenforberedelse-filene bruker et lite malspråk i Jinja/EJS-familien (mustache-tagger).
En mal gir innholdet til én fil: skriver du malen for `notat.md`, blir utdataet md-tekst som
lages til notat.md – eller notat.docx hvis filformatet er Word.

## Malsyntaks

- Tre klamrer `{{{ uttrykk }}}` gir rå tekst (anbefalt i md- og docx-filer).
- To klamrer `{{ uttrykk }}` escaper HTML-tegn (sjelden relevant her).
- Seksjoner skrives med `{{#nøkkel}} ... {{/nøkkel}}` og vises bare hvis verdien finnes og ikke er tom.
- Inverterte seksjoner `{{^nøkkel}} ... {{/nøkkel}}` vises bare hvis verdien mangler.
- Inni en seksjon kan underfelter refereres direkte ({{#ref}} i stedet for {{#tekster.E.ref}}); se seksjonen om lesningene under.

## Konteksten: variablene du kan bruke

Malen får et objekt med tre deler: `dag`, `tekster` og `kirkeaar`. Alt hentes fra
kirkeårsmodulen for den dagen prekenforberedelsen startes fra.

### dag - kirkeårsdagen

| Variabel | Betydning | Eksempel |
|---|---|---|
| `{{{dag.navn}}}` | Dagens navn | Julaften |
| `{{{dag.dato}}}` | ISO-dato (y-m-d) | 2026-12-24 |
| `{{{dag.datoTekst}}}` | Ukedag og dato på norsk | torsdag 24. desember 2026 |
| `{{{dag.farge}}}` | Liturgisk farge | Hvit |
| `{{{dag.rekke}}}` | Tekstrekken (hovedrekke I/II/III eller alternativ) | Andre |
| `{{{dag.periode}}}` | Periodeopplysning (tom hvis ingen) | Adventstid |
| `{{{dag.bonn}}}` | Dagens bønn (tom hvis ingen) | Herre, vår Gud ... |

### tekster - lesningene fra tekstcachen

Hver av `tekster.E`, `tekster.L1` og `tekster.L2` (Evangelium, første og andre lesning) er et objekt med fem felter:

| Variabel | Betydning | Eksempel |
|---|---|---|
| `{{{tekster.E.ref}}}` | Referansen som tekst (tom hvis mangler) | Matt 1,18-25 |
| `{{{tekster.E.refVis}}}` | Referansetekst med fallback: `—` hvis tom | Matt 1,18-25 |
| `{{{tekster.E.tittel}}}` | Tekstens overskrift fra tekstcachen | Jes 7,10-16 |
| `{{{tekster.E.tekst}}}` | Selve bibelteksten | ... |
| `{{{tekster.E.harInnhold}}}` | Sant hvis tittel eller tekst finnes | true/false |

- Hvis teksten ikke er cachet ennå, er tittel og tekst tomme og `harInnhold` er falsk.
- Bibeltekst-cache-fyller feltene i bakgrunnen ved oppstart, så innholdet blir tilgjengelig første dagene du bruker appen.

### kirkeaar - kirkeåret

| Variabel | Betydning | Eksempel |
|---|---|---|
| `{{{kirkeaar.start}}}` | Startåret for kirkeåret | 2026 |
| `{{{kirkeaar.slutt}}}` | Sluttåret | 2027 |
| `{{{kirkeaar.rekke}}}` | Mappenavnet: rekkes navn | Andre |

## Lesningene: seksjoner med relative felter

Innenfor `{{#tekster.E}} ... {{/tekster.E}}` (og tilsvarende for L1/L2) refererer du feltene direkte:

```text
{{#tekster.E}}## Evangelium{{#ref}} — {{{ref}}}{{/ref}}

{{#harInnhold}}{{#tittel}}**{{{tittel}}}**
{{/tittel}}{{{tekst}}}{{/harInnhold}}{{^harInnhold}}*Teksten er ikke hentet åpne Kirkeåret med nettforbindelse og prøv igjen.*{{/harInnhold}}
{{/tekster.E}}
```

Fallback-mønsteret over er standard i de innebygde malene: hvis teksten mangler, vises et lite varsel i stedet.

## Eksempel - egendefinert notatmal

```text
# {{{dag.navn}}} ({{{dag.dato}}})

Rekke: {{{dag.rekke}}} | Kirkeår {{{kirkeaar.start}}}-{{{kirkeaar.slutt}}}
Farge: {{{dag.farge}}}

{{#dag.bonn}}
## Dagens bønn

{{{dag.bonn}}}
{{/dag.bonn}}

## Evangelium

{{#tekster.E.harInnhold}}**{{{tekster.E.tittel}}}**
{{{tekster.E.tekst}}}{{/tekster.E.harInnhold}}{{^tekster.E.harInnhold}}(teksten kommer når den er cachet){{/tekster.E.harInnhold}}
```

## Word (.docx) og forhåndsvisning

- Markdown-innholdet følger oversetteren til Word: overskrifter (# til ####), punktliste, nummerert liste, **utheving**, *kursiv* og tabeller (`|`-linjer).
- Forhåndsvisningen i mal-redigeringen kjører mot eksempel dagen Julaften; datoer og tekster der kan avvike fra din valgte dag.
- Feil i en mal stopper ikke genereringen: fila blir tom, og du får en feilmelding med navnet på den feilende malen.
