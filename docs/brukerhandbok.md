# Liturgi – brukerhåndbok

Denne håndboken dokumenterer appen i sin helhet: alle moduler, alle funksjoner og hvordan alt henger sammen. For arkitektur og kodebase se [api.md](api.md).

Liturgi finnes i to varianter som fungerer likt:

- **Mac-app (Electron)** – gudstjenester og lokale maler lagres som filer; innstillinger i SQLite.
- **Nettleser-versjon** – alt lagres i nettleserens localStorage.

---

## Innholdsfortegnelse

1. [Oversikt: modulene i appen](#oversikt-modulene-i-appen)
2. [Maler og bibliotek](#maler-og-bibliotek)
3. [Ny gudstjeneste og kirkeåret](#ny-gudstjeneste-og-kirkeåret)
4. [Redigeringsvisningen](#redigeringsvisningen)
5. [Oversikt og salmer](#oversikt-og-salmer)
6. [Eksportmodulen](#eksportmodulen)
7. [Innstillinger](#innstillinger)
8. [Kommandopaletten](#kommandopaletten)
9. [Maleredigering](#malredigering)
10. [Dev-modus og Malverktøy](#dev-modus-og-malverktøy)
11. [Filer og lagring](#filer-og-lagring)

---

## Oversikt: modulene i appen

Appen består av følgende hoveddeler:

| Modul | Hvor | Hva den gjør |
|---|---|---|
| **Sidefelt (Sidebar)** | venstre | Hjem, Bibliotek, Kirkeåret, Innstillinger + listen over åpne dokumenter |
| **Redigering** | hovedvindu | Redigering av gudstjenesten eller malen – ledd for ledd |
| **Oversikt** | hovedvindu | Kompakt strukturvisning av hele gudstjenesten |
| **Salmer** | hovedvindu | Salmeoversikt: alle salmer med nummer, tittel og tekst |
| **Eksport** | hovedvindu | Profilvalg, per-ledd valg, forhåndsvisning og eksport til PDF/Word/PPTX |
| **Maler** | visning | Liste over innebygde og lokale maler; import og konvertering |
| **Bibliotek** | visning | Søk i hovedgudstjenesten; hent innhold eller hele ledd |
| **Kirkeåret** | visning | Kirkeårsdager, dagens bønn og bibeltekster (forberedelsesvisning) |
| **Innstillinger** | visning | Appinnstillinger, profilvalg, brukerhåndbok |
| **Malverktøy** | visning (dev) | Redigering av originalmalene direkte i prosjektet (kun dev-utgaven) |
| **Diff** | visning (dev) | Sammenligning av maler (kun dev-utgaven) |
| **Kommandopalett** | ⌘K | Søk og kjør alle menyvalg |

**Visninger:** appen styres av en `visning`-variabel (`hjem`, `maler`, `bibliotek`, `innstillinger`, `oversikt`, `salmer`, `eksport`, `editor`, `malverktoy`, `diff`, `handbok`). Hver visning rendres av sin egen Svelte-modul, og navigasjonen (sidefelt, menylinje, kommandopalett) setter bare denne variabelen.

---

## Maler og bibliotek

### Maler

En **mal** er en gudstjenesteskjelett: seksjoner med ledd, alternativer, roller og instruksjoner. Appen leveres med innebygde maler («Ordning for hovedgudstjeneste (bokmål, 2020)», «Gudstjenestemal Bakke og Gylland 2025», gravferd, dåp m.fl.), og du kan lage dine egne lokale maler.

- **Innebygde maler** ligger i appen (`src/lib/data.js`) og følger med alle installasjoner. De er låste: åpner du en, lager endringer en kopi i dine brukermaler.
- **Lokale maler** lagres som `.limal`-filer i `~/.config/Liturgi/maler/` (Mac) og kan dels fritt dels med andre.
- **Lagre gudstjeneste som mal**: fra en åpnet gudstjeneste lagrer du den som grunnordning med «Lagre som mal».

### Oppbygning av en mal

En mal består av **seksjoner** («I. Samling», «II. Ordet» …) som igjen består av **ledd**. Hvert ledd har:

- **Overskrift** – vises i manuset og kan vises på slidene («Leddtitler»).
- **Tekst** – liturgisk riktekst (rollemerker, BIBELREF, FOTNOTE, @NOTAT, markdown – se [Tekstformat](#tekstformat) nederst).
- **Instruksjonsfelt** – scenenotat til medarbeideren (rød kursiv, valgfritt).
- **Alternativer** – ett eller flere tekstalternativer med «Bytt alternativ»-velger.
- **Innledning/avslutning** – egne grupper for tekster som går foran/etter hoveddelen (f.eks. «L | Vår Herre sier …» før og «Slik lyder …» etter). Et ledd kan ha flere innledningsalternativer.
- **Rollemerker** – `L |`, `ML |`, `A |` osv. (rødt i visningen).
- **Type** – tekst, salme (med nummer/tittel og tekstfelt) eller lesning (bibeltekst).

### Lenket innhold

Noen ledd i hovedgudstjenesten er **lenket til en mal** – typisk dåpsleddene, som er lenket til dåp-malen. Når malen endres, synkroniseres lenkede ledd i åpne gudstjenester automatisk («lenke-synk» som logges i konsollen). Slik holder lokal tilpasning og hovedmalen seg i samsvar uten manuelt vedlikehold. Lenken lagres i gudstjenestefilen; bryter du lenken, blir leddet et vanlig fritt ledd.

### Dynamiske ledd

Ledd som fylles av kirkeåret (dagens bønn, bibeltekstene) kalles **dynamiske**:

- **Dagens bønn** fylles som plassholderfylling (`[Dagens bønn]`), som nytt alternativ («Dagens bønn (kirkeåret)») eller som eget ledd – avhengig av hvordan malen er satt opp.
- **Bibeltekstene** (lesningene) fylles med referanse og tekst, og tekstene kan hentes på nytt når som helst (se [Ny gudstjeneste og kirkeåret](#ny-gudstjeneste-og-kirkeåret)).
- Malen kan ha **dynamisk kobling**: `Bibeltekster`-innstillingen i malen kobler et ledd til L1/L2/E, slik at riktig lesning havner i riktig ledd uansett kirkeårsdag.

### Alternativer og varianter

- **Alternativer** er ulike tekster for samme ledd – f.eks. to prekefbønner eller to bekjennelser. Velges med «Bytt alternativ (1 av N)».
- **Enten/eller-varianter** (bare i bokmålsmalen) markeres i malen og gjenkjennes ved konvertering.
- **Innlednings- og avslutningsalternativer** er egne grupper – et ledd kan bytte både innledning og hoveddel uavhengig av hverandre.

### Bibliotek

Biblioteket søker i **hovedgudstjenesten** (hele liturgien) og kopierer innholdet inn i dokumentet:

- **«Hent innhold …»** – erstatter leddets hoveddel med et valgt alternativ; leddets egen innledning/avslutning og alternativgrupper røres ikke.
- **«Hent ledd …»** – setter et **nytt ledd** over det nåværende (mindre destruktivt) med alle alternativer, innledning og avslutning fra biblioteket; det nåværende leddet fjernes fra gudstjenesten men beholdes i dokumentet.

Innholdet **kopieres** inn i filen – dokumentet forblir delbart uten referanser til hovedgudstjenesten.

---

## Ny gudstjeneste og kirkeåret

1. **«Ny gudstjeneste …»** (⌘N) åpner valget av mal, navn og dato. Navneforslaget er «dato - type - kirkeårsdag».
2. **Kirkeårsdagen** slås opp automatisk fra datoen (manuell overstyring er mulig). Kirkeårsdagen lagres i gudstjenesten sammen med tekstrekke og liturgisk farge.
3. Ved opprettelse fyller appen **dagens bønn** og **bibeltekstene** fra kirkeåret, med malens struktur i behold (innledning/hoveddel/avslutning).
4. **Endres datoen** senere spør appen om innholdet skal oppdateres til den nye kirkeårsdagen – det skjer aldri automatisk.
5. **Hente bibeltekster på nytt**: høyreklikk et lesningsledd → «Hent bibeltekster på nytt», eller bruk kommandopaletten (⌘K). Appen slår opp kirkeårsdagen og fyller alle lesningsledd: bibelteksten i hoveddelen, referansen i innledningens «Det står skrevet i/hos …», avslutningen fra malen. Dagens bønn røres ikke.
6. **Kirkeåret-visningen** viser kirkeårsdagene, dagens bønn og bibeltekstene som forberedelsesmateriell (tekstene hentes i bakgrunnen og foldest ut ved behov).

Bibeltekstene krever innlogging hos bibel.no (lagres i appens innstillinger); tekstene caches lokalt så appen fungerer også uten nett.

---

## Redigeringsvisningen

Redigeringsvisningen viser gudstjenesten ledd for ledd, seksjon for seksjon. Alt redigeres ved klikk – appen skiller mellom visning (ferdig rendret tekst) og redigering (kildetekst med «Vis kildekode»).

### Verktøylinjen

- **Vis roller / Vis instruksjoner / Vis salmeinfo** – styrer visningen (og er grunnlaget for eksportens tilsvarende valg).
- **Vim-modus** (valgfritt) – tastaturnavigasjon av leddene.

### Hvert ledd

- **Hovedboksen** (avkrysningsboksen i leddhodet) styrer om leddet er med i gudstjenesten; et fjernet ledd dempes i visningen men beholdes i dokumentet.
- **Teksten** redigeres ved klikk. Rollemerker, BIBELREF/FOTNOTE/@NOTAT-markører, overskrifter og markdown rendres live.
- **Salmeledd** har nummer- og tittelfelt, «Hent tekst» (salme.no) og «Tekst»-knappen som viser/redigerer selve salmeteksten med vers.
- **Lesningsledd** kan bytte mellom «Hele teksten» og «Bibelref.» (kun referansen).
- **Alternativer** byttes med «Bytt alternativ (1 av N)».
- **Innledning/avslutning** vises som egne rader med egne bytteknapper.

### Kontekstmenyen (høyreklikk på et ledd)

Flytt opp/ned · nytt ledd over/under · nytt hovedavsnitt · hent innhold/ledd fra biblioteket · hent bibeltekster på nytt (lesninger) · skift type · legg til/fjern instruksjonsfelt · vis roller/instruksjoner/salmeinfo · fjern fra gudstjenesten / ta med · eksportér · slett.

### Lenkede ledd

Ledd lenket til en mal (dåpen) synkroniseres automatisk når malen endres. Synkroniseringen logges; du kan fjerne lenken ved å redigere leddet fritt.

---

## Oversikt og salmer

- **Oversikt** viser hele gudstjenesten kompakt med seksjoner og leddoverskrifter – rask navigering og helhetssjekk.
- **Salmer** viser alle salmer med nummer, tittel og tekst – og er utgangspunktet for å sjekke at sanginnholdet er komplett før eksport.

---

## Eksportmodulen

Eksportmodulen har profiler, per-ledd valg og forhåndsvisning. **Forhåndsvisningen er førende**: den genereres av samme layoutmotor som eksporten.

### Profiler

| Profil | Innhold | Formater |
|---|---|---|
| **Prest** | Full liturgi med instruksjoner | PDF, Word |
| **Medarbeider** | Liturgi med instruksjoner og lysbildenumre | PDF, Word |
| **Menighet** | Menighetsinnhold (hovedsakelig A/M-roller + salmer), bibeltekster som referanse | PDF, Word |
| **Skjerm** | PowerPoint til skjerm | PPTX (+ lysbildemanus) |

Alle profiler har egne innstillinger (format, kolonner, marger, avstand, skriftskala) som lagres per dokument.

### Per-ledd valg

I eksportlistens leddrader styrer du per ledd og per profil:

- **Hovedboksen** – leddet med eller ikke.
- **Innhold med/uten** – hele hoveddelen eller bare overskriften.
- **Innledning med/uten** og **Avslutning med/uten** – for ledd med innledning/avslutning i malen (Skjerm/Menighet).
- **Hele teksten / Bibelref.** – for bibelledd.

Valgene lagres per profil i dokumentet.

### Blanke sider (Skjerm)

Dropdownen «Blanke» styrer tomme mellomsider i presentasjonen:

- **Ingen** – ingen blanke sider.
- **Alle** – blank side mellom hvert viste ledd.
- **Smart** – blank side kun der det ligger skjulte ledd mellom viste ledd, eller der et ledds innledning/avslutning er valgt bort. Flere skjulte elementer etter hverandre gir likevel bare én blank side. Det kan også komme en blank side til slutt dersom siste ledd har skjult avslutning.

Forhåndsvisningen og pptx-eksporten bruker samme slidplan, så fordelingen er alltid identisk.

### Lysbildemanus

Med «Lysbildemanus» påslått eksporteres samtidig en Medarbeider-utskrift med **lysbildenummer i margen** – plassert ved det leddet/verset der hvert lysbilde begynner, også for blanke mellomsider. Manuset eksporteres som PDF og/eller Word etter formatvalgene.

### Forhåndsvisning

- PDF-profilene: sidevisning generert av samme layoutmotor som PDF-eksporten.
- Skjerm: slidevisning generert av samme slidplan som pptx-eksporten, med notatfelt per slide og klikk som markerer tilhørende ledd i listen.

### Eksportér

«Eksportér kun [profil]» eller «Eksportér alle profilene». Filnavn-format: «dato - navn - profil».

---

## Innstillinger

Innstillinger (⌘,) samler:

- **Versjon og byggnr** – «Versjon 0.0.4 · bygg YYYYMMDD.HHMM».
- **Appinnstillinger** – maalformer, visninger, hentede teksters cache og påloggingsopplysninger for bibel.no/salme.no (lagres lokalt).
- **Brukerhåndbok** – åpner denne håndboken i appen (også i menylinjen under «Hjelp»).

Innstillinger lagres i SQLite (`~/.config/Liturgi/liturgi.db`) i Mac-appen og i localStorage i nettleser-versjonen.

---

## Kommandopaletten

**⌘K** åpner kommandopaletten: søk i alle menyvalg – filhandlinger, navigasjon, eksportvalg og henting av bibeltekster. ↑↓ velger, ⏎ kjører, esc lukker. Paletten har samme handlinger som menylinjen og er kontekstavhengig (eksportvalg vises bare i eksportvisningen osv.).

---

## Malredigering

Maler redigeres som gudstjenester – samme editor, samme kontekstmeny, med noen mal-spesifikke tillegg:

- **Innledning/avslutning** kan opprettes og fjernes som grupper (tannhjulsmenyen administrerer alternativene; plussteg legger til nye).
- **Alternativgrupper** opprettes, nummereres og administreres per ledd.
- **Dynamiske koblinger**: malens «Bibeltekster»-innstilling kobler lesningsledd til L1/L2/E.
- **Lenket innhold**: hovedgudstjenestens dåpsledd lenkes til dåp-malen; endringer i malen synkroniseres til lenkede ledd i åpne gudstjenester.
- **Lagre til prosjektet (⌘S)** gjelder bare originalmalene i dev-modus; lokale maler lagres som filer.
- **Målform skrives aldri i malens navn** – maalformen styres av innholdet og profilens målformvalg.

---

## Dev-modus og Malverktøy

Dev-utgaven bygges kun lokalt (`npm run electron:dev` / `build:dev`) og inneholder verktøy som aldri følger publiserte utgaver. Tre mekanismer holder dem utenfor: byggflagget `__DEV_MODE__` (tree-shaker verktøykoden ut av vanlige bygg), upakket-sjekken i hovedprosessen (en app fra DMG får aldri verktøyene) og CI-verifisering (release-bygg feiler hvis dev-modulen finnes).

### Malverktøy

**Malverktøy** redigerer **originalmalene** – de innebygde ordningene i `src/lib/data.js`:

- Åpne en originalmal, rediger med hele den vanlige editoren, og velg **«Lagre til prosjektet» (⌘S)**.
- Lagringen skriver tilbake til `data.js` **og** til seed-filen under `~/.config/Liturgi/maler/` med automatisk validering og tilbakerulling ved feil.
- **Bekreft**-valget fjerner wip-merkingen og låser malen; **Slett** flytter til papirkurven (macOS) med bekreftelse.
- **Diff**-visningen sammenligner maler mot originalene.

### Viktig om seeds

Endringer i originalmalene lander i `src/lib/data.js` og seed-filene. De blir **ikke** med i fremtidige releaser bare ved å ligge lokalt:

> **Seeds må pushes tilbake til repoet via PR** for å bli en del av neste release. Uten push lever endringene kun i din lokale dev-utgave og forsvinner ved neste installasjon fra release.

### Frys-vern

Dev-utgaven og Mac-appen deler ikke data (dev-utgaven kan bruke egen database); gudstjenester slettes aldri automatisk – «Slett» flytter alltid til papirkurven.

---

## Filer og lagring

- **Gudstjenester**: `.liturgi`-filer (JSON) – standard `~/Documents/Liturgi/`; dobbeltklikk i Finder åpner appen.
- **Lokale maler**: `.limal`-filer i `~/.config/Liturgi/maler/`.
- **Innstillinger og siste gudstjenester**: `~/.config/Liturgi/liturgi.db` (SQLite).
- **«Lagre som …»** duper filen med nytt navn; **«Åpne mappe»** viser filen i Finder.
- Sletting flytter alltid til **papirkurven** – aldri permanent sletting.

---

## Tekstformat

Tekstene er riktekst med liturgisk markering. Full spesifikasjon: [docs/limal-format.md](limal-format.md).

### Roller

`{{r}}L |{{/r}} tekst` (inline-pakket, malenes format) eller hele linjer: `L | tekst`, `ML/L | tekst`, `@r | tekst`. Rollemerket rendres rødt.

### Linjemarkører

| Markør | Betydning |
|---|---|
| `BIBELREF | Matt 25,31-46` | Bibelreferanse som liten notis; grunnlag for «Bibelref.»-bytting |
| `FOTNOTE | …` | Generell liten notis |
| `@NOTAT …` / `@n …` | Scenenotat – rød kursiv, mindre; ikke i menighetsutskrift |
| `# / ##` | Overskrift / underoverskrift |
| `- punkt` | Punktliste |

### Inline

`**fet**`, `*kursiv*`, `^{1}` (hevet versnummer), `{{refreng}}…{{/refreng}}` (kursiv blokk).

### Linjeskift

Nye linjer = linjeskift, tomme linjer = avsnitt. Linjer som starter med en markør får eget avsnitt. Linjeskiftene fra redigeringen er førende i alle eksporter.
