# .limal — malformat for Liturgi

Dette dokumentet er kilden til sannheten for `.limal`-filformatet og
liturgistrukturen i Liturgi-appen. Konverteringsskript og LLM-skills skal
lese denne filen for å hente siste utgave av formatet.

En `.limal`-fil er JSON med toppnivå-nøklene `liturgiFormat: 1`,
`kind: "template"` og `data` (selve malen). Tilsvarende for
gudstjenester: `.liturgi` med `kind: "service"`.

```json
{
  "liturgiFormat": 1,
  "kind": "template",
  "data": { … mal-objektet … }
}
```

## Mal-objektet (`data`)

| Felt | Type | Betydning |
|---|---|---|
| `id` | streng | stabil id (f.eks. `dop-i-hovedgudstjenesten-2017`) |
| `name` | streng | visningsnavn, uten målform (f.eks. «Dåp i hovedgudstjenesten (2017)») |
| `description` | streng | valgfri beskrivelse |
| `malForm` | streng | målform/språk: `bokmål` (standard), `nynorsk`, … |
| `liturgiType` | streng | `gudstjeneste` (standard), `vigsel`, `gravferd` — avgjør kategori og «Opprett»-liste |
| `kanGudstjeneste` | bool | `false` = malen tilbys ikke ved opprett av gudstjeneste |
| `alternativer` | string[] | katalog av alternativ-merker (f.eks. `["dåp", "nattverd"]`) som styrer valgene i «Opprett»-dialogen |
| `skriftlesningKilde` | string | **seksjonstittel i samme mal** som er kilden til skriftlesningene (f.eks. "Skriftlesninger ved Vigsels- og forbønnsliturgi 2017") — brudeparet velger tekster fra denne seksjonen |
| `delGrupper` | string[] | katalog av variasjoner/del-grupper (f.eks. `["gravferd", "bisettelse"]`) — enten/eller |
| `sections` | array | hoveddelene (se under) |
| `visInstr` / `visRoles` / `visSalmeinfo` | bool | visningsvalg (standard `true`) |
| `builtinKey` | streng | bare innebygde originalmaler (ikke med i brukermaler) |
| `erOriginal` | bool | flagg for originalmaler |

## Seksjon (hoveddel)

```json
{
  "title": "I. Samling",
  "items": [ … ledd … ],
  "alternativer": ["dåp"],          // valgfritt: flervalg-merker (alternativer-katalogen)
  "delGruppe": "gravferd",          // valgfritt: variasjon (kun én pr mal)
  "__lenket": { "malId": "…", "tittel": "…" }  // lenket hoveddel: innholdet
                                                // fornyes fra malen ved åpning
                                                // og kan ikke redigeres
}
```

Hoveddeler nummereres ofte med romertall i tittelen (`I. Samling`,
`II. Ordet`, `III. Nattverd`, `IV. Sendelse`).

## Ledd (item)

```json
{
  "id": "unik-id",
  "type": "tekst",                    // "tekst" | "salme" | "instruks"
  "heading": "* 3 Hilsen",            // leddtittel; `* ` = menigheten står under leddet (ikke valgfri)
  "bokstav": "A",                     // valgfritt: katalog-ledd i skriftlesningskatalog (A, B, C …)
  "instr": "",                        // instruksjoner/rubrikker (vises kursiv rød)
  "text": "…",                        // innholdet — se tekstkonvensjoner
  "alts": [ { "label": "Mark 10,13-16", "text": "…" } ],   // varianter (enten/eller)
  "selAlt": 0,                        // valgt alternativ-indeks (0 = første)
  "introAlts": [ { "label": "Innledning", "text": "…" } ],
  "selIntro": 0,
  "avslutningAlts": [ { "label": "Avslutning", "text": "…" } ],
  "selAvsl": 0,
  "enabled": true,                    // false = tatt ut av gudstjenesten
  "optional": false,                  // valgfritt ledd
  "salmeNr": "",                      // bare type "salme"
  "salmeTittel": ""                   // bare type "salme"
}
```

Minimum: `id`, `type`, `heading`, `text`, `alts`, `selAlt`.
`heading` uten `* `-prefiks = alltid med. `type: "salme"`-ledd bruker
`salmeNr`/`salmeTittel` i stedet for tekst.

## Tekstkonvensjoner (viktigst for konvertering)

### Roller

Rollemerker skrives som `{{r}}ROLLE |{{/r}}` først på linjen, deretter
teksten. Rollene skilles med `/`:

```
{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn.
{{r}}ML/L |{{/r}} De bar små barn til Jesus …
```

Vanlige roller: `L` (liturg), `ML` (medliturg), `ML/L`, `K` (kongebaru),
`Alle`/`M` (menighet). Tekst uten rollemerke = menighet/tale.

### Bibelreferanser — `BIBELREF |`

Bibeltekster avsluttes med en referanselinje:

```
BIBELREF | Joh 3,16
BIBELREF | Mark 10,13-16
```

Referanselinjen ligger SIST i `text` (etter `\n`).

### Instruksjoner — `@NOTAT`

Rubrikker/stageinstruksjoner i docx («Rubrikk»-stil) blir `instr`-feltet,
eller `@NOTAT`-linjer i teksten:

```
@NOTAT Klokkeringing
@NOTAT Her kan liturgen si noe kortfattet om den aktuelle dåpshandlingen.
```

### Opphavsrett — `@COPYRIGHT |`

Salmeinfo/copyright-linjer: `@COPYRIGHT | Tekst/Melodi/© …` (kan fjernes
fra eksport per dokument).

### Alternativer i teksten

Flere varianter av samme ledd = `alts[]` (label = gjerne bibelreferansen),
ikke gjentatte ledd. «Eller»-rubrikken i kildedokumentet skiller
variantene.

## Konverteringsregler (docx/pdf → .limal)

1. **Hoveddeler**: `Heading 1` (docx) eller nummererte/ROMERTALL-titler →
   ny seksjon. Behold nummereringen i tittelen hvis kilden har den.
2. **Leddtitler**: `Heading 2/3` eller «nummer + tittel» («2 Hilsen») →
   `heading` med `* `-prefiks hvis menigheten står under leddet. Valgfrie ledd
   markeres med `optional: true` (typisk der kilden sier «Her kan følge …»),
   ikke med `* `.
3. **Rubrikker** (docx-stil `Rubrikk`, rød/kursiv tekst) → `instr`-feltet
   (eller `@NOTAT`-linjer).
4. **Roller**: fet prefiks før `|` (`L |`, `ML/L |`) → `{{r}}ROLLE |{{/r}}`.
5. **Bibelreferanser**: linje som kun inneholder en referanse
   («Joh 3,16», «Mark 10,13–16») rett etter et ledd → `BIBELREF | <ref>`
   på sluten av leddets `text`, og gjerne som `alts`-label.
6. **«Eller»-rubrikker**: følgende tekstinntil neste tittel/rubrikk blir
   et nytt alternativ i `alts[]` på samme ledd.
7. **Salmer**: «Nr. X»/tittel-kombinasjoner → `type: "salme"` med
   `salmeNr`/`salmeTittel`.
8. **Målform/type**: sett `malForm` og `liturgiType` eksplisitt.
9. Valider alltid resultatet ved å åpne `.limal`-filen i appen
   (Bibliotek → Maler → importer) før den anses som ferdig.
