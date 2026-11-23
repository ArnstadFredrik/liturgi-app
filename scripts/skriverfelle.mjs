#!/usr/bin/env node
// Skriverfelle-sjekk: retter gud(t)jeneste-formen (uten s) til
// gud(s)tjeneste/gud(s)teneste i .limal-filer, rapporter og filnavn.
// «gudstjeneste»/«gudsteneste» i .limal-filer, rapporter og filnavn.
//
// Bakgrunn: no-catching miljøer kan miste s-en i «gud(s)tjeneste»-familien
// når filer skrives. Kildedokumentene fra ressursbanken er verifisert rene
// (alle forekomster har s), så en global rett er trygg — norsk har ikke
// ordformer uten s her. Kjøres automatisk av konverter-liturgi.mjs etter
// konvertering, og skal kjøres manuelt på ALLE leveransefiler (limal +
// rapport) før levering.
//
// Bruk: node skriverfelle.mjs <fil> [<fil> …]
//   — retter innholdet in place; filnavn med feilen omdøpes.
import { readFileSync, writeFileSync, renameSync, existsSync, statSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

const moenster = new RegExp('ud' + String.fromCharCode(116) + 'jeneste|udteneste', 'g'); // dekker alle former uten s
const rett = (t) => t.replace(/ud(t?j?eneste)/g, (m, rest) => 'uds' + rest.replace(/^j?/, (x) => x));

// 'udtjeneste' → 'udstjeneste'; 'udteneste' → 'udsteneste';
// 'udjene…' finnes ikke — resten starter på 'tjeneste'/'teneste'.
function fiksTekst(t) {
  return t.replace(/udtjeneste/g, 'udstjeneste').replace(/udteneste/g, 'udsteneste')
          .replace(/udeneste/g, 'udsteneste')
          .replace(/Udtjeneste/g, 'Udstjeneste').replace(/Udteneste/g, 'Udsteneste')
          .replace(/Udeneste/g, 'Udsteneste');
}

let totalt = 0;
for (const fil of process.argv.slice(2)) {
  if (!fil || !existsSync(fil)) continue;
  const erJson = fil.toLowerCase().endsWith('.limal');
  let inn = readFileSync(fil, 'utf8');
  const foer = (inn.match(/udt?j?eneste|Udt?j?eneste|udeneste|Udeneste/g) ?? []).length;
  {
    if (erJson) {
      const d = JSON.parse(inn);
      const data = d.data ?? d;
      const gaa = (obj) => {
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (typeof v === 'string') obj[k] = fiksTekst(v);
          else if (v && typeof v === 'object') gaa(v);
        }
      };
      gaa(d);
      if (typeof d.data?.name === 'string') d.data.name = fiksTekst(d.data.name);
      inn = JSON.stringify(d, null, '\t');
    } else {
      inn = fiksTekst(inn);
    }
    writeFileSync(fil, inn);
    console.log(`${basename(fil)}: rettet ${foer} forekomster`);
    totalt += foer;
  }
  // filnavn med feilen?
  const base = basename(fil);
  const rettetNavn = fiksTekst(base);
  if (rettetNavn !== base) {
    const nySti = join(dirname(fil), rettetNavn);
    renameSync(fil, nySti);
    console.log(`${base} → ${rettetNavn} (filnavn rettet)`);
    totalt++;
  }
}
console.log(totalt ? `${totalt} rettinger totalt` : 'ren — ingen skriverfelle-funn');
process.exit(0);
