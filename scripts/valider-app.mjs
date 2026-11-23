#!/usr/bin/env node
// Headless «steg 4»-validering for .limal-maler — uten liturgi-appen.
// Gjentar det appen sjekker ved import/åpning av en mal, så langt det lar
// seg gjøre programmatisk:
//   1. parse + påkrevde felt (som valider.mjs)
//   2. rendring: alle tekstfelt kjøres gjennom appens egen litHtml
//      (src/lib/lit.js) — fanger opp feilformede rollemerker/notater som
//      ville sett rare ut i redigeringsvisningen
//   3. app-regler: leddTekst-komposisjon, selAlt/selIntro/selAvsl i
//       grensene, salme-felt for type salme, delGruppe ∈ delGrupper,
//       skriftlesningKilde peker på en eksisterende seksjon, bokstav-
//       sekvens i skriftlesningskatalog, __lenket-malId finnes blant
//       seed-malene (valgfritt --seeds <mappe>)
// Ikke dekket: visuell rendering i appen (farger/høyder) — den gjøres
// fortsatt best ved import hos brukeren.
//
// Bruk: node valider-app.mjs <fil>.limal [--seeds <mappe>]
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);
const fil = args.find((a) => !a.startsWith('--'));
const seedsIdx = args.indexOf('--seeds');
const seedsDir = seedsIdx !== -1 ? args[seedsIdx + 1] : null;
if (!fil) { console.error('Bruk: node valider-app.mjs <fil>.limal [--seeds <mappe>]'); process.exit(2); }

// lit.js — appens egen renderer. Prøv nabostier (repo-layout og cache-layout).
let litHtml = null;
const kandidater = [
  join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'lit.js'),
  join(dirname(fileURLToPath(import.meta.url)), 'lit.js'),
  join(dirname(fileURLToPath(import.meta.url)), '..', 'lit.js')
];
for (const sti of kandidater) {
  if (existsSync(sti)) { ({ litHtml } = await import(sti)); break; }
}
const kanRendre = typeof litHtml === 'function';

const feil = [];
const advar = [];
let mal;
try {
  mal = JSON.parse(readFileSync(fil, 'utf8'));
} catch (e) { console.error('FEIL: ugyldig JSON —', e.message); process.exit(1); }
if (mal.liturgiFormat !== 1) feil.push(`liturgiFormat må være 1: ${mal.liturgiFormat}`);
if (mal.kind !== 'template') feil.push(`kind må være "template": ${mal.kind}`);
const data = mal.data ?? mal;
if (!Array.isArray(data.sections)) { console.error('FEIL: data.sections mangler'); process.exit(1); }

const roler = new Set();
const ider = new Set();
let ledd = 0;

function sjekkTekstfelt(id, navn, tekst) {
  if (typeof tekst !== 'string') return;
  if (!(tekst ?? '').trim()) return; // tomme felt er normale (holder-/salme-ledd)
  const apne = (tekst.match(/\{\{r\}\}/g) ?? []).length;
  const lukk = (tekst.match(/\{\{\/r\}\}/g) ?? []).length;
  if (apne !== lukk) feil.push(`ulebalanserte rollemerker i ${navn} (${apne}/${lukk})`);
  for (const m of tekst.matchAll(/\{\{r\}\}(.*?)\|/g)) roler.add(m[1].trim());
  const linjer = tekst.split('\n');
  const refIdx = linjer.findIndex((l) => l.startsWith('BIBELREF'));
  if (refIdx !== -1 && refIdx !== linjer.length - 1) {
    advar.push(`${navn}: BIBELREF er ikke sist i feltet (linje ${refIdx + 1} av ${linjer.length}) — OK for meny-ledd`);
  }
  // render-sjekk med appens egen renderer
  if (kanRendre) {
    const html = litHtml(tekst);
    if (typeof html !== 'string' || !html.length) advar.push(`${navn}: litHtml ga tomt resultat`);
    if (/undefined|\[object Object\]/.test(html)) feil.push(`${navn}: render inneholder 'undefined'/[object Object]`);
  }
}

for (const sec of data.sections) {
  if (typeof sec.title !== 'string' || !sec.title.trim()) advar.push(`seksjon uten tittel`);
  const items = sec.items ?? [];
  for (const it of items) {
    ledd++;
    if (!it.id) feil.push(`ledd uten id i «${sec.title}»`);
    else if (ider.has(it.id)) feil.push(`duplikat id: ${it.id}`);
    else ider.add(it.id);
    sjekkTekstfelt(it.id, it.id, it.text ?? '');
    sjekkTekstfelt(it.id, it.id + ' (instr)', it.instr ?? '');
    for (const nokkel of ['alts', 'introAlts', 'avslutningAlts']) {
      const liste = it[nokkel] ?? [];
      liste.forEach((a, i) => {
        if (!a.label) advar.push(`${it.id}: ${nokkel}[${i}] uten label`);
        sjekkTekstfelt(it.id, `${it.id} ${nokkel}[${i}]`, a.text ?? '');
      });
      if (nokkel === 'alts' && liste.length && (it.selAlt == null || it.selAlt >= liste.length)) {
        feil.push(`${it.id}: selAlt ${it.selAlt} utenfor 0..${liste.length - 1}`);
      }
      if (nokkel === 'introAlts' && liste.length && (it.selIntro == null || it.selIntro >= liste.length)) {
        feil.push(`${it.id}: selIntro ${it.selIntro} utenfor 0..${liste.length - 1}`);
      }
      if (nokkel === 'avslutningAlts' && liste.length && (it.selAvsl == null || it.selAvsl >= liste.length)) {
        feil.push(`${it.id}: selAvsl ${it.selAvsl} utenfor 0..${liste.length - 1}`);
      }
    }
    if (it.type === 'salme' && !it.salmeNr && !it.salmeTittel && !(it.instr ?? '').trim() && !(it.text ?? '').trim()) {
      advar.push(`${it.id}: helt tom salme-ledd (verken nummer, instr eller tekst)`);
    }
    if ((it.heading ?? '').startsWith('*') && it.optional !== true) {
      advar.push(`${it.id}: '* '-heading men optional !== true`);
    }
    if (it.optional === true && !(it.heading ?? '').startsWith('*')) {
      advar.push(`${it.id}: optional true men heading mangler '* '-prefiks`);
    }
  }
  if (sec.delGruppe && !(data.delGrupper ?? []).includes(sec.delGruppe)) {
    feil.push(`seksjon «${sec.title}»: delGruppe "${sec.delGruppe}" finnes ikke i delGrupper ${JSON.stringify(data.delGrupper ?? [])}`);
  }
  // bokstav-sekvens i skriftlesningskatalog
  const bokstaver = items.map((i) => i.bokstav).filter(Boolean);
  if (bokstaver.length >= 3) {
    const forventet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, bokstaver.length).split('');
    const feilBokstav = bokstaver.some((b, i) => b !== forventet[i]);
    if (feilBokstav) advar.push(`seksjon «${sec.title}»: bokstavsekvensen er ikke A,B,C… (${bokstaver.join(',')})`);
  }
}

// skriftlesningKilde → seksjonen finnes
if (data.skriftlesningKilde && !data.sections.some((s) => s.title === data.skriftlesningKilde)) {
  feil.push(`skriftlesningKilde "${data.skriftlesningKilde}" peker på en seksjon som ikke finnes`);
}

// __lenket-seksjoner: malId må finnes blant seed-malene, og backup bør finnes
if (seedsDir && existsSync(seedsDir)) {
  const seedData = [];
  for (const f of readdirSync(seedsDir).filter((f) => f.endsWith('.limal'))) {
    try {
      const p = JSON.parse(readFileSync(join(seedsDir, f), 'utf8'));
      seedData.push({ id: p.data?.id, name: p.data?.name, data: p.data ?? p });
    } catch { }
  }
  for (const sec of data.sections) {
    if (!sec.__lenket) continue;
    const malId = sec.__lenket.malId;
    const kandidat = seedData.find((s) => s.id === malId || s.name === sec.__lenket.tittel);
    // ikke blant seeds er ikke nødvendigvis en feil — målformen kan være en
    // variant (f.eks. '-nynorsk') som følger med appens originaler, ikke som
    // seed. Advarsel med tydelig kontrollpunkt i stedet for hard feil.
    if (!kandidat) advar.push(`seksjon «${sec.title}»: __lenket.malId "${malId}" finnes ikke blant seed-malene — kontroller at malen finnes i appen`);
    else if (!kandidat.data?.sections?.length) advar.push(`seksjon «${sec.title}»: lenket mal (${malId}) har ingen seksjoner`);
  }
}

console.log(`Fil: ${fil}`);
console.log(`Seksjoner: ${data.sections.length} | ledd: ${ledd} | roller: ${[...roler].sort().join(', ') || '(ingen)'}${kanRendre ? ' | litHtml-rendering: kjørt' : ' | litHtml: ikke funnet (render-sjekk hoppet over)'}`);
console.log(`malForm: ${data.malForm ?? '(mangler)'} | liturgiType: ${data.liturgiType ?? '(mangler)'}${data.delGrupper ? ` | delGrupper: ${data.delGrupper.join(', ')}` : ''}`);
for (const f of feil) console.log('  FEIL: ' + f);
for (const a of advar) console.log('  advarsel: ' + a);
console.log(feil.length ? `${feil.length} feil` : 'OK');
process.exit(feil.length ? 1 : 0);
